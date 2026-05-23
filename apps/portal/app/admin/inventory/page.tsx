"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  Filter,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Edit2,
  History,
  ChevronDown,
  ArrowUpDown,
  Bell,
  Settings,
  Truck,
  Box,
} from "lucide-react";

type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "backorder";

type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  reorderPoint: number;
  reorderQty: number;
  unit: string;
  status: StockStatus;
  lastUpdated: string;
  leadTimeDays: number;
  supplier: string;
  avgDailySales: number;
  daysOfStock: number;
  incomingStock: number;
  incomingDate: string | null;
  cost: number;
};

type StockMovement = {
  id: string;
  sku: string;
  productName: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  reason: string;
  date: string;
  user: string;
};

// Sample data - Replaced with API calls
// const inventoryItems: InventoryItem[] = [ ... ];
// const recentMovements: StockMovement[] = [ ... ];

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StockStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "stock" | "days">("days");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [activeTab, setActiveTab] = useState<"inventory" | "movements" | "alerts">("inventory");

  // Fetch inventory data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch inventory items
        const itemsRes = await fetch(`/api/admin/inventory?status=${statusFilter}`);
        if (itemsRes.ok) {
          const itemsData = await itemsRes.json();
          setInventoryItems(itemsData.items || []);
        }

        // Fetch recent movements
        const movementsRes = await fetch('/api/admin/inventory/movements?limit=50');
        if (movementsRes.ok) {
          const movementsData = await movementsRes.json();
          setRecentMovements(movementsData.movements || []);
        }
      } catch (error) {
        console.error('Failed to fetch inventory data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [statusFilter]); // Refetch when filter changes

  const categories = [...new Set(inventoryItems.map((i) => i.category))];

  const filteredItems = inventoryItems
    .filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") comparison = a.name.localeCompare(b.name);
      else if (sortBy === "stock") comparison = a.currentStock - b.currentStock;
      else if (sortBy === "days") comparison = a.daysOfStock - b.daysOfStock;
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const statusConfig: Record<StockStatus, { label: string; color: string; icon: React.ReactNode }> = {
    in_stock: { label: "In Stock", color: "orange", icon: <CheckCircle className="h-4 w-4" /> },
    low_stock: { label: "Low Stock", color: "amber", icon: <AlertTriangle className="h-4 w-4" /> },
    out_of_stock: { label: "Out of Stock", color: "red", icon: <XCircle className="h-4 w-4" /> },
    backorder: { label: "Backorder", color: "purple", icon: <Clock className="h-4 w-4" /> },
  };

  const outOfStockCount = inventoryItems.filter((i) => i.status === "out_of_stock").length;
  const lowStockCount = inventoryItems.filter((i) => i.status === "low_stock").length;
  const totalInventoryValue = inventoryItems.reduce((sum, i) => sum + i.currentStock * i.cost, 0);

  // Refresh data
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const itemsRes = await fetch(`/api/admin/inventory?status=${statusFilter}`);
      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        setInventoryItems(itemsData.items || []);
      }

      const movementsRes = await fetch('/api/admin/inventory/movements?limit=50');
      if (movementsRes.ok) {
        const movementsData = await movementsRes.json();
        setRecentMovements(movementsData.movements || []);
      }
    } catch (error) {
      console.error('Failed to refresh inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && inventoryItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-2" />
          <p className="text-slate-500">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
          <p className="text-sm text-slate-500">
            Real-time stock levels and inventory tracking
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Upload className="h-4 w-4" />
            Import Stock
          </button>
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Inventory
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total SKUs</p>
              <p className="text-2xl font-bold text-slate-900">{inventoryItems.length}</p>
            </div>
            <div className="rounded-lg bg-slate-100 p-2">
              <Package className="h-5 w-5 text-slate-600" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-700">{outOfStockCount}</p>
            </div>
            <div className="rounded-lg bg-red-100 p-2">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600">Low Stock</p>
              <p className="text-2xl font-bold text-amber-700">{lowStockCount}</p>
            </div>
            <div className="rounded-lg bg-amber-100 p-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Inventory Value</p>
              <p className="text-2xl font-bold text-slate-900">${totalInventoryValue.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-orange-100 p-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "inventory"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Package className="inline h-4 w-4 mr-2" />
            Inventory
          </button>
          <button
            onClick={() => setActiveTab("movements")}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "movements"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <History className="inline h-4 w-4 mr-2" />
            Stock Movements
          </button>
          <button
            onClick={() => setActiveTab("alerts")}
            className={`relative px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "alerts"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Bell className="inline h-4 w-4 mr-2" />
            Alerts
            {(outOfStockCount + lowStockCount) > 0 && (
              <span className="absolute top-2 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {outOfStockCount + lowStockCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Inventory Tab */}
      {activeTab === "inventory" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by SKU or product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StockStatus | "all")}
              className="rounded-lg border border-slate-200 px-3 py-2.5 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="backorder">Backorder</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2.5 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Inventory Table */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                    <button
                      onClick={() => {
                        setSortBy("stock");
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      }}
                      className="flex items-center gap-1 hover:text-slate-900"
                    >
                      Stock Level
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                    <button
                      onClick={() => {
                        setSortBy("days");
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      }}
                      className="flex items-center gap-1 hover:text-slate-900"
                    >
                      Days of Stock
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Incoming</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Supplier</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const statusInfo = statusConfig[item.status];
                  const stockPercentage = Math.min((item.currentStock / item.reorderQty) * 100, 100);
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Box className="h-5 w-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{item.name}</p>
                            <p className="text-sm text-slate-500">{item.sku} • {item.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-32">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-slate-900">{item.currentStock}</span>
                            <span className="text-slate-400">{item.unit}</span>
                          </div>
                          <div className="mt-1 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                item.status === "out_of_stock"
                                  ? "bg-red-500"
                                  : item.status === "low_stock"
                                  ? "bg-amber-500"
                                  : "bg-orange-500"
                              }`}
                              style={{ width: `${stockPercentage}%` }}
                            />
                          </div>
                          <p className="mt-1 text-xs text-slate-400">
                            Reorder at {item.reorderPoint}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                            statusInfo.color === "orange"
                              ? "bg-orange-100 text-orange-600"
                              : statusInfo.color === "amber"
                              ? "bg-amber-100 text-amber-700"
                              : statusInfo.color === "red"
                              ? "bg-red-100 text-red-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {item.daysOfStock <= 7 ? (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          ) : item.daysOfStock <= 14 ? (
                            <TrendingDown className="h-4 w-4 text-amber-500" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-orange-500" />
                          )}
                          <span
                            className={`font-medium ${
                              item.daysOfStock <= 7
                                ? "text-red-600"
                                : item.daysOfStock <= 14
                                ? "text-amber-600"
                                : "text-slate-700"
                            }`}
                          >
                            {item.daysOfStock} days
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {item.incomingStock > 0 ? (
                          <div className="flex items-center gap-2 text-sm">
                            <Truck className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="font-medium text-blue-600">+{item.incomingStock}</p>
                              <p className="text-xs text-slate-400">
                                {item.incomingDate && new Date(item.incomingDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-600">{item.supplier}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowAdjustModal(true);
                          }}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Movements Tab */}
      {activeTab === "movements" && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Product</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Quantity</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Reason</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentMovements.map((movement) => (
                <tr key={movement.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {new Date(movement.date).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{movement.productName}</p>
                    <p className="text-sm text-slate-500">{movement.sku}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        movement.type === "in"
                          ? "bg-orange-100 text-orange-600"
                          : movement.type === "out"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {movement.type === "in" ? "Stock In" : movement.type === "out" ? "Stock Out" : "Adjustment"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-semibold ${
                        movement.quantity > 0 ? "text-orange-500" : "text-red-600"
                      }`}
                    >
                      {movement.quantity > 0 ? "+" : ""}{movement.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{movement.reason}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{movement.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === "alerts" && (
        <div className="space-y-4">
          {inventoryItems
            .filter((i) => i.status === "out_of_stock" || i.status === "low_stock")
            .map((item) => {
              const statusInfo = statusConfig[item.status];
              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-4 ${
                    item.status === "out_of_stock"
                      ? "border-red-200 bg-red-50"
                      : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`rounded-lg p-2 ${
                          item.status === "out_of_stock" ? "bg-red-100" : "bg-amber-100"
                        }`}
                      >
                        {statusInfo.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">
                          {item.sku} • Current: {item.currentStock} {item.unit} • Reorder Point: {item.reorderPoint}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.incomingStock > 0 ? (
                        <span className="text-sm text-blue-600 flex items-center gap-1">
                          <Truck className="h-4 w-4" />
                          {item.incomingStock} incoming {item.incomingDate && `(${new Date(item.incomingDate).toLocaleDateString()})`}
                        </span>
                      ) : (
                        <button className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600">
                          Create PO
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Adjust Stock</h3>
            <p className="text-sm text-slate-500 mt-1">{selectedItem.name}</p>
            
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Stock</label>
                <p className="text-lg font-semibold text-slate-900">
                  {selectedItem.currentStock} {selectedItem.unit}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adjustment Type</label>
                <select className="w-full rounded-lg border border-slate-200 px-3 py-2">
                  <option value="add">Add Stock</option>
                  <option value="remove">Remove Stock</option>
                  <option value="set">Set Stock Level</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                <select className="w-full rounded-lg border border-slate-200 px-3 py-2">
                  <option value="received">Stock Received</option>
                  <option value="damaged">Damaged Goods</option>
                  <option value="count">Inventory Count</option>
                  <option value="return">Customer Return</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
                <textarea
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  rows={2}
                  placeholder="Add any notes..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAdjustModal(false);
                  setSelectedItem(null);
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button className="rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600">
                Save Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
