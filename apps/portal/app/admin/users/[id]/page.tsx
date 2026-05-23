"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type UserDetail = {
  id: string;
  profile: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    company_name: string | null;
    created_at: string;
    updated_at: string;
  } | null;
  auth: {
    email_confirmed_at: string | null;
    last_sign_in_at: string | null;
    banned_until: string | null;
  } | null;
  memberships: Array<{
    id: string;
    role: string;
    status: string;
    tenant_id: string;
    tenants?: { id: string; name: string; slug: string; status: string } | null;
  }>;
  wallet: {
    wallet_network: string;
    wallet_address: string;
    wallet_verified: boolean;
    updated_at: string | null;
  } | null;
  stats: {
    orders_count: number;
    leads_count: number;
  };
};

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const userId = String(params.id || "");

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [working, setWorking] = useState<"revoke" | "delete" | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const membership = useMemo(() => user?.memberships?.[0] ?? null, [user]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load user");
      }
      const detail: UserDetail = data.user;
      setUser(detail);
      setFullName(detail.profile?.full_name || "");
      setPhone(detail.profile?.phone || "");
      setCompanyName(detail.profile?.company_name || "");
      setRole(detail.memberships?.[0]?.role || "staff");
      setStatus(detail.memberships?.[0]?.status || "active");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) load();
  }, [userId]);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          phone: phone || null,
          company_name: companyName || null,
          membership_role: role,
          membership_status: status,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update user");
      }
      setSuccess("User updated successfully.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const revokeSessions = async () => {
    setWorking("revoke");
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/users/${userId}/revoke`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to revoke sessions");
      }
      setSuccess("Sessions revoked successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to revoke sessions");
    } finally {
      setWorking(null);
    }
  };

  const deleteUser = async () => {
    if (!confirm("Delete this user permanently? This cannot be undone.")) return;
    setWorking("delete");
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete user");
      }
      router.push("/admin/users");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete user");
      setWorking(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading user details...
      </div>
    );
  }

  if (!user) {
    return <div className="text-slate-600">User not found.</div>;
  }

  return (
    <div className="space-y-5">
      <Link href="/admin/users" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to users
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{user.profile?.full_name || "Unnamed user"}</h1>
            <p className="text-sm text-slate-500">{user.profile?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {membership?.role || "customer"}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {membership?.status || "none"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <form onSubmit={onSave} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Update User</h2>
          <div>
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="company_name">Company</Label>
            <Input id="company_name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="staff">staff</option>
              <option value="manager">manager</option>
              <option value="owner">owner</option>
              <option value="admin">admin</option>
              <option value="rhs_admin">rhs_admin</option>
            </select>
          </div>
          <div>
            <Label htmlFor="status">Membership status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="suspended">suspended</option>
            </select>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </form>

        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Admin Tools</h2>
          <div className="space-y-2 text-sm text-slate-600">
            <p>
              <strong>Email confirmed:</strong>{" "}
              {user.auth?.email_confirmed_at ? new Date(user.auth.email_confirmed_at).toLocaleString() : "No"}
            </p>
            <p>
              <strong>Last sign-in:</strong>{" "}
              {user.auth?.last_sign_in_at ? new Date(user.auth.last_sign_in_at).toLocaleString() : "Unknown"}
            </p>
            <p>
              <strong>Wallet:</strong>{" "}
              {user.wallet
                ? `${user.wallet.wallet_network.toUpperCase()} (${user.wallet.wallet_verified ? "verified" : "pending"})`
                : "Not linked"}
            </p>
            <p>
              <strong>Orders:</strong> {user.stats.orders_count} | <strong>Leads:</strong> {user.stats.leads_count}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" onClick={revokeSessions} disabled={working === "revoke"}>
              {working === "revoke" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revoking...
                </>
              ) : (
                "Revoke sessions"
              )}
            </Button>
            <Button variant="destructive" onClick={deleteUser} disabled={working === "delete"}>
              {working === "delete" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete user"
              )}
            </Button>
          </div>
        </div>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
      {success ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>
      ) : null}
    </div>
  );
}
