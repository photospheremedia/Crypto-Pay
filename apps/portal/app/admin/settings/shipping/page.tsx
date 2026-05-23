"use client";

import { useState, useEffect } from "react";
import {
  Truck,
  Plus,
  MoreVertical,
  CheckCircle2,
  Loader2,
  Trash2,
  Edit2,
  MapPin,
  Clock,
  DollarSign,
  Package,
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

interface ShippingZone {
  id: string;
  name: string;
  regions: string[];
  methods: ShippingMethod[];
  enabled: boolean;
}

interface ShippingMethod {
  id: string;
  name: string;
  type: "flat" | "weight" | "free" | "local_pickup";
  price_cents: number;
  min_order_cents?: number;
  estimated_days: string;
  enabled: boolean;
}

export default function ShippingSettingsPage() {
  const { toast } = useToast();
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "flat" as "flat" | "weight" | "free" | "local_pickup",
    price: "",
    min_order: "",
    estimated_days: "1-2",
  });

  useEffect(() => {
    fetchShippingZones();
  }, []);

  const fetchShippingZones = async () => {
    try {
      setZones([
        {
          id: "zone-001",
          name: "Local Delivery",
          regions: ["Within 25 miles"],
          enabled: true,
          methods: [
            {
              id: "method-001",
              name: "Same Day Delivery",
              type: "flat",
              price_cents: 1500,
              estimated_days: "Same day",
              enabled: true,
            },
            {
              id: "method-002",
              name: "Next Day Delivery",
              type: "flat",
              price_cents: 999,
              estimated_days: "1 day",
              enabled: true,
            },
            {
              id: "method-003",
              name: "Free Delivery",
              type: "free",
              price_cents: 0,
              min_order_cents: 25000,
              estimated_days: "1-2 days",
              enabled: true,
            },
          ],
        },
        {
          id: "zone-002",
          name: "Regional",
          regions: ["California", "Nevada", "Arizona"],
          enabled: true,
          methods: [
            {
              id: "method-004",
              name: "Standard Shipping",
              type: "flat",
              price_cents: 2499,
              estimated_days: "3-5 days",
              enabled: true,
            },
            {
              id: "method-005",
              name: "Express Shipping",
              type: "flat",
              price_cents: 4999,
              estimated_days: "1-2 days",
              enabled: true,
            },
          ],
        },
        {
          id: "zone-003",
          name: "Store Pickup",
          regions: ["Warehouse locations"],
          enabled: true,
          methods: [
            {
              id: "method-006",
              name: "Pickup at Warehouse",
              type: "local_pickup",
              price_cents: 0,
              estimated_days: "Ready in 2 hours",
              enabled: true,
            },
          ],
        },
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load shipping settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleZone = (zoneId: string) => {
    setZones(
      zones.map((z) => (z.id === zoneId ? { ...z, enabled: !z.enabled } : z))
    );
    toast({ title: "Updated", description: "Shipping zone status updated." });
  };

  const handleToggleMethod = (zoneId: string, methodId: string) => {
    setZones(
      zones.map((z) =>
        z.id === zoneId
          ? {
              ...z,
              methods: z.methods.map((m) =>
                m.id === methodId ? { ...m, enabled: !m.enabled } : m
              ),
            }
          : z
      )
    );
    toast({ title: "Updated", description: "Shipping method status updated." });
  };

  const handleDeleteMethod = (zoneId: string, methodId: string) => {
    setZones(
      zones.map((z) =>
        z.id === zoneId
          ? { ...z, methods: z.methods.filter((m) => m.id !== methodId) }
          : z
      )
    );
    toast({ title: "Deleted", description: "Shipping method deleted." });
  };

  const handleAddMethod = (e: React.FormEvent) => {
    e.preventDefault();
    const newMethod: ShippingMethod = {
      id: `method-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      price_cents: formData.type === "free" ? 0 : Math.round(parseFloat(formData.price) * 100),
      min_order_cents: formData.min_order ? Math.round(parseFloat(formData.min_order) * 100) : undefined,
      estimated_days: formData.estimated_days,
      enabled: true,
    };
    // Add to first zone for demo
    setZones(
      zones.map((z, idx) =>
        idx === 0 ? { ...z, methods: [...z.methods, newMethod] } : z
      )
    );
    setDialogOpen(false);
    setFormData({ name: "", type: "flat", price: "", min_order: "", estimated_days: "1-2" });
    toast({ title: "Added", description: "New shipping method added." });
  };

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

  const typeLabels: Record<string, string> = {
    flat: "Flat Rate",
    weight: "Weight Based",
    free: "Free Shipping",
    local_pickup: "Local Pickup",
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Shipping Settings"
        description="Configure delivery zones and shipping methods"
        backHref="/admin/settings"
        backLabel="Settings"
      />

      {/* Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Shipping Zones</p>
              <p className="text-xl font-bold text-slate-900">
                {zones.filter((z) => z.enabled).length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <Truck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Shipping Methods</p>
              <p className="text-xl font-bold text-slate-900">
                {zones.reduce((sum, z) => sum + z.methods.filter((m) => m.enabled).length, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <Package className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Free Shipping</p>
              <p className="text-xl font-bold text-slate-900">
                {zones.reduce((sum, z) => sum + z.methods.filter((m) => m.type === "free" && m.enabled).length, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Method Button */}
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Shipping Method
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Shipping Method</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMethod} className="space-y-4">
              <div>
                <Label>Method Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Express Delivery"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                      <SelectItem value="flat">Flat Rate</SelectItem>
                      <SelectItem value="weight">Weight Based</SelectItem>
                      <SelectItem value="free">Free Shipping</SelectItem>
                      <SelectItem value="local_pickup">Local Pickup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    disabled={formData.type === "free" || formData.type === "local_pickup"}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Min Order for Free ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.min_order}
                    onChange={(e) => setFormData({ ...formData, min_order: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <Label>Estimated Delivery</Label>
                  <Input
                    value={formData.estimated_days}
                    onChange={(e) => setFormData({ ...formData, estimated_days: e.target.value })}
                    placeholder="e.g., 1-2 days"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                  Add Method
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Shipping Zones */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {zones.map((zone) => (
            <div key={zone.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-slate-500" />
                  <div>
                    <h3 className="font-semibold text-slate-900">{zone.name}</h3>
                    <p className="text-sm text-slate-500">{zone.regions.join(", ")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">{zone.enabled ? "Active" : "Inactive"}</span>
                  <Switch checked={zone.enabled} onCheckedChange={() => handleToggleZone(zone.id)} />
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {zone.methods.map((method) => (
                  <div key={method.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-slate-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900">{method.name}</p>
                          <Badge variant="secondary">{typeLabels[method.type]}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {method.type === "free" || method.type === "local_pickup"
                              ? "Free"
                              : formatCurrency(method.price_cents)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {method.estimated_days}
                          </span>
                          {method.min_order_cents && (
                            <span>Min order: {formatCurrency(method.min_order_cents)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Switch
                        checked={method.enabled}
                        onCheckedChange={() => handleToggleMethod(zone.id, method.id)}
                      />
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
                            onClick={() => handleDeleteMethod(zone.id, method.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
