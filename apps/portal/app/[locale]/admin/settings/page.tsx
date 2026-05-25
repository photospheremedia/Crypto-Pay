"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Store,
  Mail,
  Bell,
  Lock,
  CreditCard,
  Truck,
  Globe,
  Save,
  RefreshCw,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

interface SettingsData {
  store: {
    name: string;
    email: string;
    phone: string;
    address: string;
    timezone: string;
    currency: string;
  };
  notifications: {
    email_orders: boolean;
    email_low_stock: boolean;
    email_new_customers: boolean;
    push_orders: boolean;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    store: {
      name: "",
      email: "",
      phone: "",
      address: "",
      timezone: "America/New_York",
      currency: "USD",
    },
    notifications: {
      email_orders: true,
      email_low_stock: true,
      email_new_customers: false,
      push_orders: true,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "general", name: "General", icon: Store },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "payments", name: "Payments", icon: CreditCard },
    { id: "shipping", name: "Shipping", icon: Truck },
    { id: "security", name: "Security", icon: Lock },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="Configure your store settings"
        actions={
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : saved ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-64 shrink-0">
            <nav className="bg-white rounded-xl border border-slate-200 p-2 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                    activeTab === tab.id
                      ? "bg-emerald-50 text-emerald-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            {activeTab === "general" && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">General Settings</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Store Name
                    </label>
                    <Input
                      value={settings.store.name}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          store: { ...settings.store, name: e.target.value },
                        })
                      }
                      placeholder="Your Store Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Contact Email
                    </label>
                    <Input
                      type="email"
                      value={settings.store.email}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          store: { ...settings.store, email: e.target.value },
                        })
                      }
                      placeholder="contact@store.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={settings.store.phone}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          store: { ...settings.store, phone: e.target.value },
                        })
                      }
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Address
                    </label>
                    <Input
                      value={settings.store.address}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          store: { ...settings.store, address: e.target.value },
                        })
                      }
                      placeholder="123 Main Street, City, State 12345"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.store.timezone}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            store: { ...settings.store, timezone: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        aria-label="Select timezone"
                      >
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Currency
                      </label>
                      <select
                        value={settings.store.currency}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            store: { ...settings.store, currency: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        aria-label="Select currency"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD ($)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  {[
                    { key: "email_orders", label: "New order notifications", desc: "Receive an email when a new order is placed" },
                    { key: "email_low_stock", label: "Low stock alerts", desc: "Get notified when products are running low" },
                    { key: "email_new_customers", label: "New customer signups", desc: "Get notified when new customers register" },
                    { key: "push_orders", label: "Push notifications for orders", desc: "Receive browser push notifications for new orders" },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              [item.key]: e.target.checked,
                            },
                          })
                        }
                        className="mt-1 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                      />
                      <div>
                        <p className="font-medium text-slate-900">{item.label}</p>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "payments" && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Payment Settings</h3>
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500">
                    Payment settings will be available in a future update
                  </p>
                </div>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Shipping Settings</h3>
                <div className="text-center py-8">
                  <Truck className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500">
                    Shipping settings will be available in a future update
                  </p>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Security Settings</h3>
                <div className="text-center py-8">
                  <Lock className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500">
                    Security settings will be available in a future update
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
