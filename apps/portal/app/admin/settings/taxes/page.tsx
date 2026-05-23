"use client";

import { useState, useEffect } from "react";
import {
  Percent,
  Plus,
  MoreVertical,
  CheckCircle2,
  Loader2,
  Trash2,
  Edit2,
  MapPin,
  Calculator,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { useToast } from "@/hooks/use-toast";

interface TaxRate {
  id: string;
  name: string;
  region: string;
  rate: number;
  type: "sales" | "vat" | "gst";
  applies_to: "all" | "shipping" | "products";
  enabled: boolean;
  is_compound: boolean;
}

export default function TaxSettingsPage() {
  const { toast } = useToast();
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [collectTaxes, setCollectTaxes] = useState(true);
  const [pricesIncludeTax, setPricesIncludeTax] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    region: "",
    rate: "",
    type: "sales" as "sales" | "vat" | "gst",
    applies_to: "all" as "all" | "shipping" | "products",
  });

  useEffect(() => {
    fetchTaxRates();
  }, []);

  const fetchTaxRates = async () => {
    try {
      setTaxRates([
        {
          id: "tax-001",
          name: "California State Tax",
          region: "California",
          rate: 7.25,
          type: "sales",
          applies_to: "all",
          enabled: true,
          is_compound: false,
        },
        {
          id: "tax-002",
          name: "Los Angeles County",
          region: "Los Angeles County, CA",
          rate: 2.25,
          type: "sales",
          applies_to: "all",
          enabled: true,
          is_compound: true,
        },
        {
          id: "tax-003",
          name: "Nevada State Tax",
          region: "Nevada",
          rate: 6.85,
          type: "sales",
          applies_to: "all",
          enabled: true,
          is_compound: false,
        },
        {
          id: "tax-004",
          name: "Arizona State Tax",
          region: "Arizona",
          rate: 5.6,
          type: "sales",
          applies_to: "products",
          enabled: true,
          is_compound: false,
        },
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tax settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRate = (id: string) => {
    setTaxRates(
      taxRates.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    );
    toast({ title: "Updated", description: "Tax rate status updated." });
  };

  const handleDeleteRate = (id: string) => {
    setTaxRates(taxRates.filter((t) => t.id !== id));
    toast({ title: "Deleted", description: "Tax rate deleted." });
  };

  const handleAddRate = (e: React.FormEvent) => {
    e.preventDefault();
    const newRate: TaxRate = {
      id: `tax-${Date.now()}`,
      name: formData.name,
      region: formData.region,
      rate: parseFloat(formData.rate),
      type: formData.type,
      applies_to: formData.applies_to,
      enabled: true,
      is_compound: false,
    };
    setTaxRates([...taxRates, newRate]);
    setDialogOpen(false);
    setFormData({ name: "", region: "", rate: "", type: "sales", applies_to: "all" });
    toast({ title: "Added", description: "New tax rate added." });
  };

  const typeLabels: Record<string, string> = {
    sales: "Sales Tax",
    vat: "VAT",
    gst: "GST",
  };

  const appliesToLabels: Record<string, string> = {
    all: "All Items",
    products: "Products Only",
    shipping: "Shipping Only",
  };

  const totalActiveRates = taxRates.filter((t) => t.enabled).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Tax Settings"
        description="Configure tax rates and collection settings"
        backHref="/admin/settings"
        backLabel="Settings"
      />

      {/* Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active Tax Rates</p>
              <p className="text-xl font-bold text-slate-900">{totalActiveRates}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Regions Covered</p>
              <p className="text-xl font-bold text-slate-900">
                {new Set(taxRates.filter((t) => t.enabled).map((t) => t.region.split(",")[0])).size}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <Calculator className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Avg Tax Rate</p>
              <p className="text-xl font-bold text-slate-900">
                {taxRates.length > 0
                  ? (taxRates.reduce((sum, t) => sum + t.rate, 0) / taxRates.length).toFixed(2)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Tax Collection Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="font-medium text-slate-900">Collect Taxes</p>
              <p className="text-sm text-slate-500">
                Enable tax collection on orders
              </p>
            </div>
            <Switch checked={collectTaxes} onCheckedChange={setCollectTaxes} />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-slate-900">Prices Include Tax</p>
              <p className="text-sm text-slate-500">
                Product prices already include tax (VAT-style)
              </p>
            </div>
            <Switch checked={pricesIncludeTax} onCheckedChange={setPricesIncludeTax} />
          </div>
        </div>
      </div>

      {/* Tax Rates */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Tax Rates</h3>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Tax Rate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Tax Rate</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddRate} className="space-y-4">
                <div>
                  <Label>Tax Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., State Sales Tax"
                    required
                  />
                </div>
                <div>
                  <Label>Region</Label>
                  <Input
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="e.g., California"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.rate}
                      onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                      placeholder="7.25"
                      required
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(v: typeof formData.type) => setFormData({ ...formData, type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Sales Tax</SelectItem>
                        <SelectItem value="vat">VAT</SelectItem>
                        <SelectItem value="gst">GST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Applies To</Label>
                  <Select
                    value={formData.applies_to}
                    onValueChange={(v: typeof formData.applies_to) =>
                      setFormData({ ...formData, applies_to: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="products">Products Only</SelectItem>
                      <SelectItem value="shipping">Shipping Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                    Add Rate
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : taxRates.length === 0 ? (
          <div className="text-center py-12">
            <Percent className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">No tax rates configured</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Tax Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Region
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Rate
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Applies To
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {taxRates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{rate.name}</span>
                        {rate.is_compound && (
                          <Badge variant="secondary" className="text-xs">
                            Compound
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{rate.region}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-900">{rate.rate}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{typeLabels[rate.type]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{appliesToLabels[rate.applies_to]}</td>
                    <td className="px-4 py-3">
                      <Switch
                        checked={rate.enabled}
                        onCheckedChange={() => handleToggleRate(rate.id)}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteRate(rate.id)}
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

      {/* Info Banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">Tax Compliance Note</p>
            <p className="text-sm text-blue-700">
              Tax rates are automatically applied based on the customer's shipping address.
              Please consult with a tax professional to ensure compliance with local tax laws.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
