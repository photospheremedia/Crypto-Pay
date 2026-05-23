"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  Users,
  Tag,
  Percent,
  Search,
  Plus,
  Edit2,
  Trash2,
  Building2,
  Crown,
  Award,
  Shield,
  Star,
  Settings,
  Package,
  Calendar,
  Filter,
  Download,
  X,
  Check,
  ArrowLeft,
  AlertCircle,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

type PriceTier = {
  id: string;
  name: string;
  description: string;
  discountType: "percentage" | "fixed" | "custom";
  discountValue: number | null;
  priority: number;
  customerCount: number;
  isActive: boolean;
  color: string;
  icon: React.ReactNode;
};

type CustomerPricing = {
  id: string;
  customerId: string;
  customerName: string;
  companyName: string;
  email: string;
  tier: string;
  tierColor: string;
  customPriceCount: number;
  paymentTerms: string;
  creditLimit: number;
  totalSpent: number;
  lastOrder: string;
};

type CustomPrice = {
  id: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  sku: string;
  basePrice: number;
  customPrice: number;
  minQuantity: number;
  startDate: string;
  endDate: string | null;
  contractRef: string;
};

// Sample data
const priceTiers: PriceTier[] = [
  { id: "1", name: "Standard", description: "Default pricing for all customers", discountType: "percentage", discountValue: 0, priority: 0, customerCount: 1250, isActive: true, color: "slate", icon: <Users className="h-5 w-5" /> },
  { id: "2", name: "Bronze", description: "5% discount for small businesses", discountType: "percentage", discountValue: 5, priority: 10, customerCount: 234, isActive: true, color: "amber", icon: <Award className="h-5 w-5" /> },
  { id: "3", name: "Silver", description: "10% discount for regular customers", discountType: "percentage", discountValue: 10, priority: 20, customerCount: 156, isActive: true, color: "slate", icon: <Shield className="h-5 w-5" /> },
  { id: "4", name: "Gold", description: "15% discount for high-volume customers", discountType: "percentage", discountValue: 15, priority: 30, customerCount: 89, isActive: true, color: "yellow", icon: <Star className="h-5 w-5" /> },
  { id: "5", name: "Platinum", description: "20% discount for enterprise accounts", discountType: "percentage", discountValue: 20, priority: 40, customerCount: 23, isActive: true, color: "purple", icon: <Crown className="h-5 w-5" /> },
  { id: "6", name: "Contract", description: "Custom contract pricing", discountType: "custom", discountValue: null, priority: 100, customerCount: 12, isActive: true, color: "orange", icon: <Building2 className="h-5 w-5" /> },
];

const customerPricings: CustomerPricing[] = [
  { id: "1", customerId: "c1", customerName: "John Smith", companyName: "Downtown Diner", email: "john@downtowndiner.com", tier: "Gold", tierColor: "yellow", customPriceCount: 5, paymentTerms: "Net 30", creditLimit: 10000, totalSpent: 45230, lastOrder: "2024-01-15" },
  { id: "2", customerId: "c2", customerName: "Maria Garcia", companyName: "Taco Express Chain", email: "maria@tacoexpress.com", tier: "Platinum", tierColor: "purple", customPriceCount: 12, paymentTerms: "Net 60", creditLimit: 50000, totalSpent: 125780, lastOrder: "2024-01-18" },
  { id: "3", customerId: "c3", customerName: "Robert Chen", companyName: "Golden Dragon Restaurant", email: "robert@goldendragon.com", tier: "Silver", tierColor: "slate", customPriceCount: 0, paymentTerms: "Net 15", creditLimit: 5000, totalSpent: 18920, lastOrder: "2024-01-10" },
  { id: "4", customerId: "c4", customerName: "Sarah Johnson", companyName: "Fresh Eats Cafe", email: "sarah@fresheats.com", tier: "Bronze", tierColor: "amber", customPriceCount: 2, paymentTerms: "Immediate", creditLimit: 0, totalSpent: 8450, lastOrder: "2024-01-12" },
  { id: "5", customerId: "c5", customerName: "Mike Wilson", companyName: "Campus Food Services", email: "mike@campusfood.edu", tier: "Contract", tierColor: "orange", customPriceCount: 45, paymentTerms: "Net 45", creditLimit: 100000, totalSpent: 287650, lastOrder: "2024-01-19" },
];

const customPrices: CustomPrice[] = [
  { id: "1", customerId: "c5", customerName: "Campus Food Services", productId: "p1", productName: "Takeout Container 32oz", sku: "PKG-001", basePrice: 45.99, customPrice: 38.50, minQuantity: 10, startDate: "2024-01-01", endDate: "2024-12-31", contractRef: "CONT-2024-001" },
  { id: "2", customerId: "c5", customerName: "Campus Food Services", productId: "p2", productName: "Heavy Duty Fork - Black", sku: "CUT-001", basePrice: 24.99, customPrice: 19.99, minQuantity: 5, startDate: "2024-01-01", endDate: "2024-12-31", contractRef: "CONT-2024-001" },
  { id: "3", customerId: "c2", customerName: "Taco Express Chain", productId: "p1", productName: "Takeout Container 32oz", sku: "PKG-001", basePrice: 45.99, customPrice: 39.99, minQuantity: 20, startDate: "2024-01-01", endDate: null, contractRef: "CONT-2024-002" },
];

export default function CustomerPricingPage() {
  const [activeTab, setActiveTab] = useState<"tiers" | "customers" | "custom">("tiers");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"tier" | "assign" | "price">("tier");
  const [customerTiers, setCustomerTiers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTiers() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/pricing/customers');
        if (res.ok) {
          const data = await res.json();
          setCustomerTiers(data.tiers || []);
        }
      } catch (error) {
        console.error('Failed to fetch customer tiers:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTiers();
  }, []);

  const filteredCustomers = customerPricings.filter(
    (c) =>
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tierColorMap: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    orange: "bg-orange-100 text-orange-600 border-orange-200",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/pricing"
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Customer-Specific Pricing</h1>
          <p className="text-sm text-slate-500">
            Manage B2B pricing tiers, contracts, and payment terms
          </p>
        </div>
        <button
          onClick={() => {
            setModalType(activeTab === "tiers" ? "tier" : activeTab === "customers" ? "assign" : "price");
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          {activeTab === "tiers" ? "New Tier" : activeTab === "customers" ? "Assign Tier" : "Add Custom Price"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Active Tiers</p>
              <p className="text-2xl font-bold text-slate-900">{priceTiers.filter((t) => t.isActive).length}</p>
            </div>
            <div className="rounded-lg bg-orange-100 p-2">
              <Tag className="h-5 w-5 text-orange-500" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Custom Prices</p>
              <p className="text-2xl font-bold text-slate-900">{customPrices.length}</p>
            </div>
            <div className="rounded-lg bg-blue-100 p-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">B2B Customers</p>
              <p className="text-2xl font-bold text-slate-900">{customerPricings.length}</p>
            </div>
            <div className="rounded-lg bg-purple-100 p-2">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Credit Extended</p>
              <p className="text-2xl font-bold text-slate-900">
                ${customerPricings.reduce((sum, c) => sum + c.creditLimit, 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-amber-100 p-2">
              <Percent className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("tiers")}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "tiers"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Tag className="inline h-4 w-4 mr-2" />
            Price Tiers
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "customers"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Users className="inline h-4 w-4 mr-2" />
            Customer Assignments
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "custom"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <DollarSign className="inline h-4 w-4 mr-2" />
            Custom Prices
          </button>
        </div>
      </div>

      {/* Price Tiers Tab */}
      {activeTab === "tiers" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {priceTiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-xl border bg-white p-5 hover:shadow-md transition-shadow ${
                selectedTier === tier.id ? "ring-2 ring-orange-500" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`rounded-lg p-2 ${tierColorMap[tier.color] || tierColorMap.slate}`}>
                  {tier.icon}
                </div>
                <div className="flex gap-1">
                  <button className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button className="rounded p-1 text-slate-400 hover:bg-red-100 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">{tier.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{tier.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {tier.discountType === "custom" ? (
                    <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-sm font-medium text-orange-600">
                      Custom
                    </span>
                  ) : (
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-700">
                      {tier.discountValue}% Off
                    </span>
                  )}
                </div>
                <span className="text-sm text-slate-500">
                  {tier.customerCount.toLocaleString()} customers
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Priority: {tier.priority}</span>
                <span className={`font-medium ${tier.isActive ? "text-orange-500" : "text-red-500"}`}>
                  {tier.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Assignments Tab */}
      {activeTab === "customers" && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-700 hover:bg-slate-50">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-700 hover:bg-slate-50">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          {/* Customers Table */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Tier</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Payment Terms</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Credit Limit</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Total Spent</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Custom Prices</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">{customer.companyName}</p>
                        <p className="text-sm text-slate-500">{customer.customerName} • {customer.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-medium ${tierColorMap[customer.tierColor]}`}>
                        {customer.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-700">{customer.paymentTerms}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900">${customer.creditLimit.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-700">${customer.totalSpent.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      {customer.customPriceCount > 0 ? (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-sm font-medium text-blue-700">
                          {customer.customPriceCount} items
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <Settings className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Custom Prices Tab */}
      {activeTab === "custom" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by product, customer, or contract..."
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Custom Prices Table */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Base Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Custom Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Discount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Min Qty</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Valid Period</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Contract</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customPrices.map((price) => {
                  const discountPercent = ((price.basePrice - price.customPrice) / price.basePrice * 100).toFixed(1);
                  return (
                    <tr key={price.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{price.productName}</p>
                            <p className="text-sm text-slate-500">{price.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-700">{price.customerName}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-500 line-through">${price.basePrice.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-orange-500">${price.customPrice.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-sm font-medium text-orange-600">
                          -{discountPercent}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-700">{price.minQuantity}+</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                          <Calendar className="h-3.5 w-3.5" />
                          {price.startDate} - {price.endDate || "No end"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-blue-600">{price.contractRef}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button className="rounded p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {modalType === "tier" && "Create New Tier"}
                {modalType === "assign" && "Assign Customer Tier"}
                {modalType === "price" && "Add Custom Price"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {modalType === "tier" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tier Name</label>
                  <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="e.g., Diamond" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="e.g., 25% discount for VIP accounts" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Discount Type</label>
                    <select className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500">
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                      <option value="custom">Custom (Contract)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Discount Value</label>
                    <input type="number" className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="25" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority (higher = applied first)</label>
                  <input type="number" className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="50" />
                </div>
              </div>
            )}

            {modalType === "assign" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
                  <select className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500">
                    <option value="">Select customer...</option>
                    {customerPricings.map((c) => (
                      <option key={c.id} value={c.customerId}>{c.companyName} - {c.customerName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price Tier</label>
                  <select className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500">
                    {priceTiers.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.discountType === "custom" ? "Custom" : `${t.discountValue}% off`})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Payment Terms</label>
                    <select className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500">
                      <option value="immediate">Immediate</option>
                      <option value="net15">Net 15</option>
                      <option value="net30">Net 30</option>
                      <option value="net45">Net 45</option>
                      <option value="net60">Net 60</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Credit Limit</label>
                    <input type="number" className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="10000" />
                  </div>
                </div>
              </div>
            )}

            {modalType === "price" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
                  <select className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500">
                    <option value="">Select customer...</option>
                    {customerPricings.map((c) => (
                      <option key={c.id} value={c.customerId}>{c.companyName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product</label>
                  <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="Search products..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Custom Price</label>
                    <input type="number" step="0.01" className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="38.50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Min Quantity</label>
                    <input type="number" className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                    <input type="date" className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date (optional)</label>
                    <input type="date" className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contract Reference</label>
                  <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="CONT-2024-XXX" />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600">
                <Check className="h-4 w-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
