#!/usr/bin/env python3
"""Manage cryptopay.sale DNS on Porkbun (API v3) — Netlify + Resend.

Docs: https://porkbun.com/api/json/v3/documentation

Usage:
  python3 scripts/porkbun-dns-netlify.py          # audit (dry run)
  python3 scripts/porkbun-dns-netlify.py --apply  # sync Netlify web records
  python3 scripts/porkbun-dns-netlify.py --clean  # remove legacy + verify stack
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

# Expected production stack (Crypto Pay uses Resend from root domain, not SES send.*)
REQUIRED_WEB = [
    ("ALIAS", "", "apex-loadbalancer.netlify.com"),
    ("CNAME", "www", None),  # filled from NETLIFY_SITE_HOSTNAME
]
REQUIRED_EMAIL = [
    ("TXT", "", "v=spf1 include:_spf.resend.com ~all"),
    ("TXT", "resend._domainkey", None),  # value from Resend dashboard — must exist
    ("TXT", "_dmarc", None),  # must exist
]
LEGACY_MARKERS = ("76.76.21.21", "vercel", "vercel-dns")
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
    """Match Porkbun API host to logical subdomain ('' for apex, 'www', etc.)."""
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


def is_legacy(rec: dict, domain: str) -> bool:
    rtype = rec.get("type", "")
    if rtype in ("NS", "SOA"):
        return False
    content = (rec.get("content") or "").lower()
    host = normalize_host(rec.get("name") or "", domain)
    if any(m in content for m in LEGACY_MARKERS):
        return True
    # Unused Amazon SES custom MAIL FROM on send.* (app sends via Resend from root)
    if host == "send" and any(m in content for m in SES_MARKERS):
        return True
    if host in ("", "www") and rtype in ("A", "AAAA") and "netlify" not in content:
        return True
    return False


def has_record(records: list[dict], domain: str, rtype: str, host: str, content: str | None = None) -> bool:
    for rec in records:
        if rec.get("type") != rtype:
            continue
        if normalize_host(rec.get("name") or "", domain) != host:
            continue
        if content is not None and (rec.get("content") or "") != content:
            continue
        return True
    return False


def print_audit(records: list[dict], domain: str, netlify_host: str) -> None:
    groups = {"Web (Netlify)": [], "Email (Resend)": [], "System": [], "Legacy / remove": []}
    for rec in sorted(records, key=lambda r: (r.get("type", ""), r.get("name") or "")):
        rtype = rec.get("type", "")
        host = normalize_host(rec.get("name") or "", domain)
        content = rec.get("content") or ""
        line = f"  {rtype:6} {host or '@':22} {content[:72]}{'…' if len(content) > 72 else ''}"
        if rtype in ("NS", "SOA"):
            groups["System"].append(line)
        elif is_legacy(rec, domain):
            groups["Legacy / remove"].append(line)
        elif rtype in ("ALIAS", "CNAME") or (rtype == "A" and host in ("", "www")):
            groups["Web (Netlify)"].append(line)
        elif rtype in ("MX", "TXT"):
            groups["Email (Resend)"].append(line)
        else:
            groups["Web (Netlify)"].append(line)

    print(f"\n==> DNS audit: {domain}")
    for title, lines in groups.items():
        print(f"\n{title}:")
        if lines:
            print("\n".join(lines))
        else:
            print("  (none)")

    print("\n==> Expected production stack:")
    print(f"  ALIAS  @                      apex-loadbalancer.netlify.com")
    print(f"  CNAME  www                    {netlify_host}")
    print("  TXT    @                      v=spf1 include:_spf.resend.com ~all")
    print("  TXT    resend._domainkey      (Resend DKIM — from Resend dashboard)")
    print("  TXT    _dmarc                 v=DMARC1; p=none; rua=mailto:postmaster@…")


def run_clean(domain: str, netlify_host: str, apply: bool) -> None:
    records = fetch_records(domain)
    print_audit(records, domain, netlify_host)

    legacy = [r for r in records if is_legacy(r, domain)]
    if legacy:
        print(f"\n==> Legacy records to remove: {len(legacy)}")
        if not apply:
            print("Dry run. Run with --clean to remove.")
        else:
            for rec in legacy:
                delete_record(domain, rec)
            records = fetch_records(domain)

    missing_web = []
    if not has_record(records, domain, "ALIAS", "", "apex-loadbalancer.netlify.com"):
        missing_web.append(("ALIAS", "", "apex-loadbalancer.netlify.com", "Netlify apex"))
    if not has_record(records, domain, "CNAME", "www", netlify_host):
        missing_web.append(("CNAME", "www", netlify_host, "Netlify www"))

    if missing_web:
        print(f"\n==> Missing web records: {len(missing_web)}")
        if apply:
            for rtype, host, content, note in missing_web:
                create_record(domain, rtype, host, content, notes=note)
        else:
            for rtype, host, content, _ in missing_web:
                print(f"  would create {rtype} {host or '@'} → {content}")

    if apply:
        records = fetch_records(domain)
        print_audit(records, domain, netlify_host)
        print("\n✅ Porkbun DNS is clean and aligned with Netlify + Resend.")


def run_apply(domain: str, netlify_host: str) -> None:
    records = fetch_records(domain)
    print_audit(records, domain, netlify_host)

    targets = [
        ("ALIAS", "", "apex-loadbalancer.netlify.com", "Netlify apex"),
        ("CNAME", "www", netlify_host, "Netlify www"),
    ]

    print("\n==> Syncing Netlify web records...")
    for rec in records:
        if not is_legacy(rec, domain):
            continue
        delete_record(domain, rec)

    records = fetch_records(domain)
    for rec in records:
        host = normalize_host(rec.get("name") or "", domain)
        rtype = rec.get("type", "")
        if host in ("", "www") and rtype in ("A", "AAAA", "ALIAS", "ANAME", "CNAME"):
            delete_record(domain, rec)

    for rtype, host, content, note in targets:
        create_record(domain, rtype, host, content, notes=note)

    records = fetch_records(domain)
    print_audit(records, domain, netlify_host)
    print("\n✅ Netlify DNS applied.")


def main() -> None:
    load_env(ENV_FILE)
    domain = os.environ.get("PORKBUN_DOMAIN", "cryptopay.sale")
    netlify_host = os.environ.get("NETLIFY_SITE_HOSTNAME", "")
    if not netlify_host:
        raise SystemExit("Set NETLIFY_SITE_HOSTNAME in .env.porkbun")

    ping = pb_post("ping")
    if ping.get("status") != "SUCCESS":
        raise SystemExit(f"Porkbun ping failed: {json.dumps(ping)}")
    print(f"==> Porkbun API OK (IP {ping.get('yourIp', '?')})")

    if "--clean" in sys.argv:
        run_clean(domain, netlify_host, apply=True)
    elif "--apply" in sys.argv:
        run_apply(domain, netlify_host)
    else:
        run_clean(domain, netlify_host, apply=False)


if __name__ == "__main__":
    main()
