#!/usr/bin/env python3
"""Manage cryptopay.sale DNS on Porkbun (API v3) — Vercel + Resend.

Docs: https://porkbun.com/api/json/v3/documentation

Usage:
  python3 scripts/porkbun-dns-vercel.py          # audit (dry run)
  python3 scripts/porkbun-dns-vercel.py --apply  # sync Vercel web records
  python3 scripts/porkbun-dns-vercel.py --clean  # remove legacy (Netlify/Vercel/etc) + verify stack

Notes:
- Vercel apex uses A record 76.76.21.21.
- Vercel www uses CNAME cname.vercel-dns.com.
- We intentionally do not touch Resend DKIM/DMARC content — we only ensure SPF exists.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

API_BASE = "https://api.porkbun.com/api/json/v3"
ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = Path(os.environ.get("PORKBUN_ENV_FILE", ROOT / ".env.porkbun"))

VERCEL_APEX_A = "76.76.21.21"
VERCEL_WWW_CNAME = "cname.vercel-dns.com"

REQUIRED_WEB = [
    ("A", "", VERCEL_APEX_A),
    ("CNAME", "www", VERCEL_WWW_CNAME),
]

REQUIRED_EMAIL = [
    ("TXT", "", "v=spf1 include:_spf.resend.com ~all"),
    ("TXT", "resend._domainkey", None),  # value from Resend dashboard — must exist
    ("TXT", "_dmarc", None),  # must exist
]

LEGACY_MARKERS = ("netlify", "apex-loadbalancer.netlify.com", "vercel-dns", VERCEL_APEX_A)
SES_MARKERS = ("amazonses.com", "feedback-smtp.")


def load_env(path: Path) -> None:
    if not path.is_file():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        if key:
            os.environ[key] = val


def pb_post(path: str, body: dict | None = None) -> dict:
    api_key = os.environ.get("PORKBUN_API_KEY", "")
    secret = os.environ.get("PORKBUN_SECRET_API_KEY", "")
    if not api_key or not secret:
        raise SystemExit(
            "Missing PORKBUN_API_KEY or PORKBUN_SECRET_API_KEY in .env.porkbun\n"
            "  https://porkbun.com/account/api"
        )

    payload = {"apikey": api_key, "secretapikey": secret, **(body or {})}
    req = urllib.request.Request(
        f"{API_BASE}/{path.lstrip('/')}",
        data=json.dumps(payload).encode(),
        headers={
            "Content-Type": "application/json",
            "X-API-Key": api_key,
            "X-Secret-API-Key": secret,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode()
        raise SystemExit(f"HTTP {exc.code} {path}: {detail}") from exc


def host_label(name: str, domain: str) -> str:
    if not name or name == domain:
        return "@"
    suffix = f".{domain}"
    if name.endswith(suffix):
        return name[: -len(suffix)] or "@"
    return name


def normalize_host(name: str, domain: str) -> str:
    label = host_label(name, domain)
    return "" if label == "@" else label


def fetch_records(domain: str) -> list[dict]:
    resp = pb_post(f"dns/retrieve/{domain}")
    if resp.get("status") != "SUCCESS":
        raise SystemExit(f"dns/retrieve failed: {json.dumps(resp)}")
    return resp.get("records") or []


def delete_record(domain: str, rec: dict) -> None:
    rid = rec.get("id")
    rtype = rec.get("type")
    name = rec.get("name") or "@"
    print(f"  delete {rtype} {name} (id={rid}) → {rec.get('content')}")
    out = pb_post(f"dns/delete/{domain}/{rid}")
    if out.get("status") != "SUCCESS":
        raise SystemExit(f"delete failed: {json.dumps(out)}")


def create_record(domain: str, rtype: str, host: str, content: str, notes: str = "") -> None:
    body: dict = {"type": rtype, "content": content, "ttl": 600}
    if host:
        body["name"] = host
    if notes:
        body["notes"] = notes
    label = host or "@"
    print(f"  create {rtype} {label} → {content}")
    out = pb_post(f"dns/create/{domain}", body)
    if out.get("status") != "SUCCESS":
        raise SystemExit(f"create failed: {json.dumps(out)}")


def has_record(
    records: list[dict], domain: str, rtype: str, host: str, content: str | None = None
) -> bool:
    for rec in records:
        if rec.get("type") != rtype:
            continue
        if normalize_host(rec.get("name") or "", domain) != host:
            continue
        if content is not None and (rec.get("content") or "") != content:
            continue
        return True
    return False


def is_legacy(rec: dict, domain: str) -> bool:
    rtype = rec.get("type", "")
    if rtype in ("NS", "SOA"):
        return False
    content = (rec.get("content") or "").lower()
    host = normalize_host(rec.get("name") or "", domain)

    # old stacks / stray markers
    if any(m in content for m in ("netlify", "vercel-dns")):
        return True
    # Unused Amazon SES custom MAIL FROM on send.* (app sends via Resend from root)
    if host == "send" and any(m in content for m in SES_MARKERS):
        return True
    # If apex/www are non-Vercel, treat as legacy.
    if host in ("", "www") and rtype in ("ALIAS", "A", "AAAA", "CNAME"):
        if host == "" and rtype == "A" and (rec.get("content") or "") == VERCEL_APEX_A:
            return False
        if host == "www" and rtype == "CNAME" and (rec.get("content") or "") == VERCEL_WWW_CNAME:
            return False
        return True
    return False


def print_audit(records: list[dict], domain: str) -> None:
    groups = {"Web (Vercel)": [], "Email (Resend)": [], "System": [], "Legacy / remove": []}
    for rec in sorted(records, key=lambda r: (r.get("type", ""), r.get("name") or "")):
        rtype = rec.get("type", "")
        host = normalize_host(rec.get("name") or "", domain)
        content = rec.get("content") or ""
        line = f"  {rtype:6} {host or '@':22} {content[:72]}{'…' if len(content) > 72 else ''}"
        if rtype in ("NS", "SOA"):
            groups["System"].append(line)
        elif is_legacy(rec, domain):
            groups["Legacy / remove"].append(line)
        elif rtype in ("A", "CNAME", "ALIAS", "AAAA"):
            groups["Web (Vercel)"].append(line)
        elif rtype in ("MX", "TXT"):
            groups["Email (Resend)"].append(line)
        else:
            groups["Web (Vercel)"].append(line)

    print(f"\n==> DNS audit: {domain}")
    for title, lines in groups.items():
        print(f"\n{title}:")
        if lines:
            print("\n".join(lines))
        else:
            print("  (none)")

    print("\n==> Expected production stack:")
    print(f"  A      @                      {VERCEL_APEX_A}")
    print(f"  CNAME  www                    {VERCEL_WWW_CNAME}")
    print("  TXT    @                      v=spf1 include:_spf.resend.com ~all")
    print("  TXT    resend._domainkey      (Resend DKIM — from Resend dashboard)")
    print("  TXT    _dmarc                 v=DMARC1; …")


def run_clean(domain: str, apply: bool) -> None:
    records = fetch_records(domain)
    print_audit(records, domain)

    legacy = [r for r in records if is_legacy(r, domain)]
    if legacy:
        print(f"\n==> Legacy records to remove: {len(legacy)}")
        if not apply:
            print("Dry run. Run with --clean --apply to remove.")
        else:
            for rec in legacy:
                delete_record(domain, rec)
            records = fetch_records(domain)

    ensure_stack(records, domain, apply=apply)


def ensure_stack(records: list[dict], domain: str, apply: bool) -> None:
    print("\n==> Ensuring required web records (Vercel)...")
    for rtype, host, content in REQUIRED_WEB:
        if has_record(records, domain, rtype, host, content):
            print(f"  ok {rtype} {host or '@'}")
            continue
        if not apply:
            print(f"  missing {rtype} {host or '@'} → {content}")
        else:
            create_record(domain, rtype, host, content, notes="managed-by=crypto-pay vercel")

    print("\n==> Ensuring required email records (Resend)...")
    for rtype, host, content in REQUIRED_EMAIL:
        if content is None:
            if has_record(records, domain, rtype, host, None):
                print(f"  ok {rtype} {host or '@'} (present)")
            else:
                print(f"  WARN missing {rtype} {host or '@'} (set in Resend dashboard)")
            continue
        if has_record(records, domain, rtype, host, content):
            print(f"  ok {rtype} {host or '@'}")
            continue
        if not apply:
            print(f"  missing {rtype} {host or '@'} → {content}")
        else:
            create_record(domain, rtype, host, content, notes="managed-by=crypto-pay resend")


def main() -> None:
    load_env(ENV_FILE)
    domain = os.environ.get("PORKBUN_DOMAIN", "cryptopay.sale")

    apply = "--apply" in sys.argv
    clean = "--clean" in sys.argv

    if clean:
        run_clean(domain, apply=apply)
        return

    records = fetch_records(domain)
    print_audit(records, domain)
    ensure_stack(records, domain, apply=apply)

    if not apply:
        print("\nDry run. Re-run with --apply to write changes.")


if __name__ == "__main__":
    main()

