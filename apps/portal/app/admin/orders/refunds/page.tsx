"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ArrowLeft,
  RotateCcw,
  DollarSign,
  Calendar,
  User,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Eye,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { useToast } from "@/hooks/use-toast";

interface Refund {
  id: string;
  order_id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  amount_cents: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "processed";
  created_at: string;
  processed_at?: string;
}

const statusConfig = {
  pending: { label: "Pending Review", icon: Clock, color: "bg-yellow-100 text-yellow-700" },
  approved: { label: "Approved", icon: CheckCircle2, color: "bg-blue-100 text-blue-700" },
  rejected: { label: "Rejected", icon: XCircle, color: "bg-red-100 text-red-700" },
  processed: { label: "Processed", icon: CheckCircle2, color: "bg-green-100 text-green-700" },
};

export default function RefundsPage() {
  const { toast } = useToast();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      // Simulated data - replace with actual API call
      setRefunds([
        {
          id: "ref-001",
          order_id: "ord-001",
          order_number: "ORD-2024-001",
          customer_name: "John's Restaurant",
          customer_email: "john@restaurant.com",
          amount_cents: 15000,
          reason: "Product quality issue - received damaged goods",
          status: "pending",
          created_at: new Date().toISOString(),
        },
        {
          id: "ref-002",
          order_id: "ord-002",
          order_number: "ORD-2024-002",
          customer_name: "Maria's Cafe",
          customer_email: "maria@cafe.com",
          amount_cents: 8500,
          reason: "Order arrived late",
          status: "approved",
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "ref-003",
          order_id: "ord-003",
          order_number: "ORD-2024-003",
          customer_name: "Downtown Bistro",
          customer_email: "orders@bistro.com",
          amount_cents: 22000,
          reason: "Wrong items delivered",
          status: "processed",
          created_at: new Date(Date.now() - 172800000).toISOString(),
          processed_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load refunds",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    toast({ title: "Refund Approved", description: "The refund request has been approved." });
    setRefunds(refunds.map((r) => (r.id === id ? { ...r, status: "approved" as const } : r)));
  };

  const handleReject = async (id: string) => {
    toast({ title: "Refund Rejected", description: "The refund request has been rejected." });
    setRefunds(refunds.map((r) => (r.id === id ? { ...r, status: "rejected" as const } : r)));
  };

  const handleProcess = async (id: string) => {
    toast({ title: "Refund Processed", description: "The refund has been processed successfully." });
    setRefunds(
      refunds.map((r) =>
        r.id === id ? { ...r, status: "processed" as const, processed_at: new Date().toISOString() } : r
      )
    );
  };

  const filteredRefunds = refunds.filter((refund) => {
    const matchesSearch =
      refund.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || refund.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Refunds"
        description="Manage refund requests and process returns"
        backHref="/admin/orders"
        backLabel="Orders"
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending</p>
              <p className="text-xl font-bold text-slate-900">
                {refunds.filter((r) => r.status === "pending").length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Approved</p>
              <p className="text-xl font-bold text-slate-900">
                {refunds.filter((r) => r.status === "approved").length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Processed</p>
              <p className="text-xl font-bold text-slate-900">
                {refunds.filter((r) => r.status === "processed").length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <RotateCcw className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Value</p>
              <p className="text-xl font-bold text-slate-900">
                {formatCurrency(refunds.filter((r) => r.status === "processed").reduce((sum, r) => sum + r.amount_cents, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by order or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {["all", "pending", "approved", "processed", "rejected"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={statusFilter === status ? "bg-orange-500 hover:bg-orange-600" : ""}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Refunds List */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : filteredRefunds.length === 0 ? (
          <div className="text-center py-12">
            <RotateCcw className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">No refunds found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRefunds.map((refund) => {
              const StatusIcon = statusConfig[refund.status].icon;
              return (
                <div key={refund.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Link
                          href={`/admin/orders/${refund.order_id}`}
                          className="font-semibold text-slate-900 hover:text-orange-500"
                        >
                          {refund.order_number}
                        </Link>
                        <Badge className={statusConfig[refund.status].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[refund.status].label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {refund.customer_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(refund.created_at)}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-slate-900">
                          <DollarSign className="h-4 w-4" />
                          {formatCurrency(refund.amount_cents)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{refund.reason}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {refund.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(refund.id)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReject(refund.id)}>
                            Reject
                          </Button>
                        </>
                      )}
                      {refund.status === "approved" && (
                        <Button size="sm" onClick={() => handleProcess(refund.id)} className="bg-orange-500 hover:bg-orange-600">
                          Process Refund
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/orders/${refund.order_id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Order
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
