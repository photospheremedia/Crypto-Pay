"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  ExternalLink,
  Zap,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethod {
  id: string;
  name: string;
  provider: string;
  type: "card" | "bank" | "wallet" | "invoice";
  enabled: boolean;
  is_default: boolean;
  test_mode: boolean;
  last_four?: string;
  connected_at?: string;
}

const providerLogos: Record<string, string> = {
  stripe: "https://img.logo.dev/stripe.com?token=pk_X-1ZO13GSgeOoUrIuJ6GMQ",
  square: "https://img.logo.dev/squareup.com?token=pk_X-1ZO13GSgeOoUrIuJ6GMQ",
  paypal: "https://img.logo.dev/paypal.com?token=pk_X-1ZO13GSgeOoUrIuJ6GMQ",
};

export default function PaymentsSettingsPage() {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setPaymentMethods([
        {
          id: "pm-001",
          name: "Stripe",
          provider: "stripe",
          type: "card",
          enabled: true,
          is_default: true,
          test_mode: false,
          connected_at: "2024-01-15",
        },
        {
          id: "pm-002",
          name: "Square",
          provider: "square",
          type: "card",
          enabled: true,
          is_default: false,
          test_mode: true,
          connected_at: "2024-02-01",
        },
        {
          id: "pm-003",
          name: "PayPal",
          provider: "paypal",
          type: "wallet",
          enabled: false,
          is_default: false,
          test_mode: false,
        },
        {
          id: "pm-004",
          name: "Net 30 Invoice",
          provider: "internal",
          type: "invoice",
          enabled: true,
          is_default: false,
          test_mode: false,
        },
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((pm) => (pm.id === id ? { ...pm, enabled: !pm.enabled } : pm))
    );
    toast({ title: "Updated", description: "Payment method status updated." });
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((pm) => ({
        ...pm,
        is_default: pm.id === id,
      }))
    );
    toast({ title: "Updated", description: "Default payment method updated." });
  };

  const handleDisconnect = (id: string) => {
    setPaymentMethods(paymentMethods.filter((pm) => pm.id !== id));
    toast({ title: "Disconnected", description: "Payment provider has been disconnected." });
  };

  const typeLabels: Record<string, string> = {
    card: "Credit/Debit Card",
    bank: "Bank Transfer",
    wallet: "Digital Wallet",
    invoice: "Invoice",
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Payment Settings"
        description="Configure payment methods and processors"
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
              <p className="text-sm text-slate-500">Active Methods</p>
              <p className="text-xl font-bold text-slate-900">
                {paymentMethods.filter((pm) => pm.enabled).length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <CreditCard className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Card Processors</p>
              <p className="text-xl font-bold text-slate-900">
                {paymentMethods.filter((pm) => pm.type === "card" && pm.enabled).length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Test Mode</p>
              <p className="text-xl font-bold text-slate-900">
                {paymentMethods.filter((pm) => pm.test_mode).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Payment Methods</h3>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-slate-600">
                  Connect a payment processor to accept payments from your customers.
                </p>
                <div className="grid gap-3">
                  {[
                    { name: "Stripe", desc: "Accept cards worldwide", provider: "stripe" },
                    { name: "Square", desc: "In-person & online payments", provider: "square" },
                    { name: "PayPal", desc: "Digital wallet payments", provider: "paypal" },
                  ].map((option) => (
                    <button
                      key={option.provider}
                      className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-left transition"
                      onClick={() => {
                        toast({ title: "Connecting...", description: `Redirecting to ${option.name} setup.` });
                        setDialogOpen(false);
                      }}
                    >
                      <img
                        src={providerLogos[option.provider]}
                        alt={option.name}
                        className="h-10 w-10 rounded-lg object-contain"
                      />
                      <div>
                        <p className="font-medium text-slate-900">{option.name}</p>
                        <p className="text-sm text-slate-500">{option.desc}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-slate-400 ml-auto" />
                    </button>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paymentMethods.map((method) => (
              <div key={method.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {providerLogos[method.provider] ? (
                    <img
                      src={providerLogos[method.provider]}
                      alt={method.name}
                      className="h-12 w-12 rounded-lg object-contain bg-slate-50 p-2"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{method.name}</p>
                      {method.is_default && (
                        <Badge className="bg-emerald-100 text-emerald-700">Default</Badge>
                      )}
                      {method.test_mode && (
                        <Badge className="bg-yellow-100 text-yellow-700">Test Mode</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{typeLabels[method.type]}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">
                      {method.enabled ? "Enabled" : "Disabled"}
                    </span>
                    <Switch
                      checked={method.enabled}
                      onCheckedChange={() => handleToggleEnabled(method.id)}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Configure
                      </DropdownMenuItem>
                      {!method.is_default && (
                        <DropdownMenuItem onClick={() => handleSetDefault(method.id)}>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Set as Default
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDisconnect(method.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Disconnect
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-green-100">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">Payment Security</h3>
            <p className="text-sm text-slate-600 mb-3">
              All payment data is encrypted and processed securely through PCI-compliant payment processors.
              We never store full card numbers on our servers.
            </p>
            <div className="flex gap-2">
              <Badge variant="secondary">PCI DSS Compliant</Badge>
              <Badge variant="secondary">SSL Encrypted</Badge>
              <Badge variant="secondary">3D Secure</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
