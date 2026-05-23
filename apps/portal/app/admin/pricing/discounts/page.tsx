"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Percent,
  Calendar,
  Tag,
  Trash2,
  Edit2,
  MoreVertical,
  Loader2,
  CheckCircle2,
  XCircle,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { useToast } from "@/hooks/use-toast";

interface Discount {
  id: string;
  name: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  min_order_cents?: number;
  max_uses?: number;
  used_count: number;
  start_date: string;
  end_date?: string;
  status: "active" | "inactive" | "expired";
  applies_to: "all" | "categories" | "products";
}

export default function DiscountsPage() {
  const { toast } = useToast();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    min_order: "",
    max_uses: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      // Simulated data
      setDiscounts([
        {
          id: "disc-001",
          name: "Summer Sale",
          code: "SUMMER20",
          type: "percentage",
          value: 20,
          min_order_cents: 10000,
          max_uses: 100,
          used_count: 45,
          start_date: "2024-06-01",
          end_date: "2024-08-31",
          status: "active",
          applies_to: "all",
        },
        {
          id: "disc-002",
          name: "New Customer",
          code: "WELCOME15",
          type: "percentage",
          value: 15,
          max_uses: 1,
          used_count: 0,
          start_date: "2024-01-01",
          status: "active",
          applies_to: "all",
        },
        {
          id: "disc-003",
          name: "Bulk Order Discount",
          code: "BULK50",
          type: "fixed",
          value: 5000,
          min_order_cents: 50000,
          used_count: 12,
          start_date: "2024-01-01",
          status: "active",
          applies_to: "all",
        },
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load discounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: `Discount code "${code}" copied to clipboard.` });
  };

  const handleToggleStatus = (id: string) => {
    setDiscounts(
      discounts.map((d) =>
        d.id === id ? { ...d, status: d.status === "active" ? "inactive" : "active" } : d
      )
    );
    toast({ title: "Status Updated", description: "Discount status has been updated." });
  };

  const handleDelete = (id: string) => {
    setDiscounts(discounts.filter((d) => d.id !== id));
    toast({ title: "Deleted", description: "Discount has been deleted." });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDiscount: Discount = {
      id: `disc-${Date.now()}`,
      name: formData.name,
      code: formData.code.toUpperCase(),
      type: formData.type,
      value: formData.type === "percentage" ? parseFloat(formData.value) : parseFloat(formData.value) * 100,
      min_order_cents: formData.min_order ? parseFloat(formData.min_order) * 100 : undefined,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : undefined,
      used_count: 0,
      start_date: formData.start_date,
      end_date: formData.end_date || undefined,
      status: "active",
      applies_to: "all",
    };
    setDiscounts([newDiscount, ...discounts]);
    setDialogOpen(false);
    setFormData({
      name: "",
      code: "",
      type: "percentage",
      value: "",
      min_order: "",
      max_uses: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
    });
    toast({ title: "Created", description: "New discount code has been created." });
  };

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

  const filteredDiscounts = discounts.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Discounts & Coupons"
        description="Create and manage promotional discount codes"
        backHref="/admin/pricing"
        backLabel="Pricing"
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active Codes</p>
              <p className="text-xl font-bold text-slate-900">
                {discounts.filter((d) => d.status === "active").length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <Tag className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Uses</p>
              <p className="text-xl font-bold text-slate-900">
                {discounts.reduce((sum, d) => sum + d.used_count, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Percent className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Codes</p>
              <p className="text-xl font-bold text-slate-900">{discounts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search discounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Discount
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Discount Code</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Discount Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Summer Sale"
                  required
                />
              </div>
              <div>
                <Label>Discount Code</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., SUMMER20"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v: "percentage" | "fixed") => setFormData({ ...formData, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Value</Label>
                  <Input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={formData.type === "percentage" ? "20" : "10.00"}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Min Order ($)</Label>
                  <Input
                    type="number"
                    value={formData.min_order}
                    onChange={(e) => setFormData({ ...formData, min_order: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <Label>Max Uses</Label>
                  <Input
                    type="number"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                    placeholder="Unlimited"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                  Create Discount
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Discounts List */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : filteredDiscounts.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">No discounts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Code</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Discount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Usage</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDiscounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleCopyCode(discount.code)}
                        className="font-mono font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                      >
                        {discount.code}
                        <Copy className="h-3 w-3" />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-900">{discount.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">
                        {discount.type === "percentage"
                          ? `${discount.value}% off`
                          : `${formatCurrency(discount.value)} off`}
                      </Badge>
                      {discount.min_order_cents && (
                        <span className="text-xs text-slate-500 ml-2">
                          Min: {formatCurrency(discount.min_order_cents)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {discount.used_count}
                      {discount.max_uses && ` / ${discount.max_uses}`}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          discount.status === "active"
                            ? "bg-green-100 text-green-700"
                            : discount.status === "expired"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-700"
                        }
                      >
                        {discount.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleCopyCode(discount.code)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Code
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(discount.id)}>
                            {discount.status === "active" ? (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(discount.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
