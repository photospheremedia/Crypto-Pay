"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Search,
  MoreVertical,
  Mail,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Crown,
  Trash2,
  Edit2,
  Eye,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  profile_role?: string;
  user_type: 'super_admin' | 'admin' | 'owner' | 'staff_member' | 'customer';
  membership_id?: string;
  membership_role?: string;
  membership_status?: string;
  tenant?: {
    name: string;
    slug: string;
  };
  created_at: string;
}

interface ApiStats {
  total: number;
  super_admins: number;
  admins: number;
  owners: number;
  staff: number;
  customers: number;
}

const userTypeColors: Record<string, string> = {
  super_admin: "bg-purple-100 text-purple-800 border-purple-200",
  admin: "bg-blue-100 text-blue-800 border-blue-200",
  owner: "bg-orange-100 text-orange-800 border-orange-200",
  staff_member: "bg-slate-100 text-slate-800 border-slate-200",
  customer: "bg-gray-50 text-gray-600 border-gray-200",
};

const userTypeLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  owner: "Owner",
  staff_member: "Staff",
  customer: "Customer",
};

const membershipRoleLabels: Record<string, string> = {
  rhs_admin: "Super Admin",
  admin: "Admin",
  owner: "Owner",
  staff: "Staff",
  manager: "Manager",
};

const statusColors: Record<string, string> = {
  active: "bg-orange-100 text-orange-800",
  pending: "bg-amber-100 text-amber-800",
  inactive: "bg-slate-100 text-slate-800",
  suspended: "bg-red-100 text-red-800",
};

export default function StaffManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all"); // 'all', 'admins', 'staff', 'customers'
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [currentRole, setCurrentRole] = useState("");

  // Dialog states
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("staff");
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (typeFilter && typeFilter !== "all") params.append("type", typeFilter);
      
      const res = await fetch(`/api/admin/staff${params.toString() ? `?${params}` : ""}`);
      const data = await res.json();

      if (data.success) {
        setUsers(data.users || []);
        setStats(data.stats || null);
        setCurrentRole(data.currentUserRole);
        setIsSuperAdmin(data.currentUserRole === 'rhs_admin');
      } else {
        setError(data.error || "Failed to load users");
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setError("Failed to load users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, typeFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      const data = await res.json();

      if (data.success) {
        setInviteOpen(false);
        setInviteEmail("");
        setInviteRole("staff");
        fetchUsers();
      } else {
        setError(data.error || "Failed to invite staff");
      }
    } catch (error) {
      setError("Failed to invite staff");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          role: editRole,
          status: editStatus,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setEditOpen(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        setError(data.error || "Failed to update user");
      }
    } catch (error) {
      setError("Failed to update user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/staff", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id }),
      });

      const data = await res.json();

      if (data.success) {
        setDeleteOpen(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        setError(data.error || "Failed to remove user");
      }
    } catch (error) {
      setError("Failed to remove user");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditRole(user.membership_role || "staff");
    setEditStatus(user.membership_status || "active");
    setEditOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  // Determine which roles the current user can assign
  const getAssignableRoles = () => {
    const allRoles = ["staff", "owner", "admin"];
    if (isSuperAdmin) {
      return allRoles; // Super admin can assign any role except rhs_admin
    }
    // Others can only assign roles below their own
    const roleHierarchy: Record<string, number> = {
      rhs_admin: 4,
      admin: 3,
      owner: 2,
      staff: 1,
    };
    const currentLevel = roleHierarchy[currentRole] || 0;
    return allRoles.filter((r) => (roleHierarchy[r] || 0) < currentLevel);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div>
      {/* Back Navigation */}
      <Link 
        href="/admin/dashboard" 
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage all users, staff members, and administrators
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setInviteOpen(true)} size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Staff
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <button
            onClick={() => setTypeFilter("all")}
            className={`p-4 rounded-lg border-2 transition ${
              typeFilter === "all"
                ? "border-orange-500 bg-orange-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-sm text-slate-600">All Users</div>
          </button>
          <button
            onClick={() => setTypeFilter("admins")}
            className={`p-4 rounded-lg border-2 transition ${
              typeFilter === "admins"
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="text-2xl font-bold text-blue-600">
              {(stats.super_admins || 0) + (stats.admins || 0) + (stats.owners || 0)}
            </div>
            <div className="text-sm text-slate-600">Admins</div>
          </button>
          <button
            onClick={() => setTypeFilter("staff")}
            className={`p-4 rounded-lg border-2 transition ${
              typeFilter === "staff"
                ? "border-slate-500 bg-slate-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="text-2xl font-bold text-slate-600">{stats.staff}</div>
            <div className="text-sm text-slate-600">Staff</div>
          </button>
          <button
            onClick={() => setTypeFilter("customers")}
            className={`p-4 rounded-lg border-2 transition ${
              typeFilter === "customers"
                ? "border-gray-500 bg-gray-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="text-2xl font-bold text-gray-600">{stats.customers}</div>
            <div className="text-sm text-slate-600">Customers</div>
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 mb-4">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <p className="text-red-800 text-sm">{error}</p>
          <button
            onClick={() => setError("")}
            className="ml-auto text-red-600 hover:text-red-800"
            aria-label="Dismiss error message"
            title="Dismiss"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by email or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left p-4 font-medium text-slate-600">User</th>
              <th className="text-left p-4 font-medium text-slate-600">User Type</th>
              <th className="text-left p-4 font-medium text-slate-600">Membership</th>
              <th className="text-left p-4 font-medium text-slate-600">Status</th>
              <th className="text-left p-4 font-medium text-slate-600">Joined</th>
              <th className="text-right p-4 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                          {user.user_type === "super_admin" ? (
                            <Crown className="h-5 w-5 text-purple-600" />
                          ) : user.user_type === "admin" ? (
                            <Shield className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Users className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {user.full_name || "Unnamed"}
                        </p>
                        <p className="text-sm text-slate-500">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className={userTypeColors[user.user_type] || userTypeColors.customer}>
                      {user.user_type === "super_admin" && <Crown className="h-3 w-3 mr-1" />}
                      {user.user_type === "admin" && <Shield className="h-3 w-3 mr-1" />}
                      {userTypeLabels[user.user_type] || user.user_type}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {user.membership_role ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-slate-700">
                          {user.membership_role}
                        </span>
                        {user.tenant && (
                          <span className="text-xs text-slate-500">
                            {user.tenant.name}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">No membership</span>
                    )}
                  </td>
                  <td className="p-4">
                    {user.membership_status ? (
                      <Badge className={statusColors[user.membership_status] || statusColors.active}>
                        {user.membership_status}
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600">
                        Regular User
                      </Badge>
                    )}
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="p-4 text-right">
                    {/* Don't allow editing super admins unless you are one */}
                    {(user.user_type !== "super_admin" || isSuperAdmin) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(user)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit Role
                          </DropdownMenuItem>
                          {isSuperAdmin && (
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View as User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => openDeleteDialog(user)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Access
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No users found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Staff Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {getAssignableRoles().map((role) => (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {membershipRoleLabels[role] || role}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={!inviteEmail || submitting}>
              {submitting ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>
              Update role and status for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editRole">Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {getAssignableRoles().map((role) => (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {membershipRoleLabels[role] || role}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editStatus">Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Staff Access</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove access for{" "}
              <strong>{selectedUser?.email}</strong>? This action can be
              undone by re-inviting them.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? "Removing..." : "Remove Access"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
