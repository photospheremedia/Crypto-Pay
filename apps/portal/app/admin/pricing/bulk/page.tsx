"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface PriceUpdate {
  sku: string;
  name: string;
  current_price: number;
  new_price: number;
  change: number;
  change_percent: number;
}

export default function BulkPricingPage() {
  const { toast } = useToast();
  const [step, setStep] = useState<"upload" | "preview" | "complete">("upload");
  const [updateType, setUpdateType] = useState<"percentage" | "fixed" | "csv">("percentage");
  const [adjustmentValue, setAdjustmentValue] = useState("");
  const [adjustmentDirection, setAdjustmentDirection] = useState<"increase" | "decrease">("increase");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [previewData, setPreviewData] = useState<PriceUpdate[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "meat", name: "Meat & Poultry" },
    { id: "seafood", name: "Seafood" },
    { id: "produce", name: "Produce" },
    { id: "dairy", name: "Dairy & Eggs" },
    { id: "dry-goods", name: "Dry Goods" },
  ];

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/pricing/history?limit=50');
        if (res.ok) {
          const data = await res.json();
          setPriceHistory(data.history || []);
        }
      } catch (error) {
        console.error('Failed to fetch price history:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const handlePreview = async () => {
    if (!adjustmentValue && updateType !== "csv") {
      toast({ title: "Error", description: "Please enter an adjustment value", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    try {
      // Fetch real products from API
      const query = new URLSearchParams({
        limit: "100",
        ...(categoryFilter !== "all" && { category: categoryFilter }),
      });

      const res = await fetch(`/api/admin/products?${query}`);
      if (!res.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await res.json();
      const products = data.products || [];

      if (products.length === 0) {
        toast({ title: "Error", description: "No products found for selected category", variant: "destructive" });
        setIsProcessing(false);
        return;
      }

      const adjustment = parseFloat(adjustmentValue);
      const multiplier = adjustmentDirection === "increase" ? 1 : -1;

      // Calculate new prices for real products
      const updatedProducts: PriceUpdate[] = products.map((item: any) => {
        const currentPrice = item.price || 0;
        let newPrice: number;
        let change: number;

        if (updateType === "percentage") {
          change = Math.round((currentPrice * adjustment) / 100) * multiplier;
          newPrice = currentPrice + change;
        } else {
          change = Math.round(adjustment * 100) * multiplier;
          newPrice = currentPrice + change;
        }

        return {
          sku: item.sku || item.id,
          name: item.name,
          current_price: currentPrice,
          new_price: Math.max(0, newPrice),
          change,
          change_percent: currentPrice > 0 ? (change / currentPrice) * 100 : 0,
        };
      });

      setPreviewData(updatedProducts);
      setStep("preview");
    } catch (error) {
      console.error("Error generating price preview:", error);
      toast({
        title: "Error",
        description: "Failed to generate price preview",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyChanges = async () => {
    setIsProcessing(true);

    try {
      // Call API to apply bulk price changes
      const response = await fetch("/api/admin/pricing/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: previewData.map((item) => ({
            sku: item.sku,
            new_price: item.new_price,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to apply price changes");
      }

      setStep("complete");
      toast({
        title: "Prices Updated",
        description: `Successfully updated ${previewData.length} products.`,
      });
    } catch (error) {
      console.error("Error applying price changes:", error);
      toast({
        title: "Error",
        description: "Failed to apply price changes",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

  const handleDownloadTemplate = () => {
    const csvContent = "SKU,Current Price,New Price\nMEAT-001,24.99,26.99\nMEAT-002,8.99,9.49";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "price_update_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setStep("upload");
    setPreviewData([]);
    setAdjustmentValue("");
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Bulk Price Update"
        description="Update prices for multiple products at once"
        backHref="/admin/pricing"
        backLabel="Pricing"
      />

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {["Configure", "Preview", "Complete"].map((label, index) => {
          const stepNames = ["upload", "preview", "complete"];
          const isActive = stepNames.indexOf(step) >= index;
          const isCurrent = stepNames[index] === step;
          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  isActive
                    ? "bg-orange-500 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {index + 1}
              </div>
              <span className={isCurrent ? "font-medium text-slate-900" : "text-slate-500"}>
                {label}
              </span>
              {index < 2 && <ArrowRight className="h-4 w-4 text-slate-300 ml-2" />}
            </div>
          );
        })}
      </div>

      {step === "upload" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Update Method</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { id: "percentage", label: "Percentage", desc: "Adjust by %" },
                { id: "fixed", label: "Fixed Amount", desc: "Adjust by $" },
                { id: "csv", label: "CSV Upload", desc: "Import file" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setUpdateType(option.id as typeof updateType)}
                  className={`p-4 rounded-lg border-2 text-left transition ${
                    updateType === option.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <p className="font-medium text-slate-900">{option.label}</p>
                  <p className="text-sm text-slate-500">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {updateType !== "csv" && (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Adjustment Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label>Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Direction</Label>
                    <Select
                      value={adjustmentDirection}
                      onValueChange={(v: "increase" | "decrease") => setAdjustmentDirection(v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="increase">Increase Prices</SelectItem>
                        <SelectItem value="decrease">Decrease Prices</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{updateType === "percentage" ? "Percentage (%)" : "Amount ($)"}</Label>
                    <Input
                      type="number"
                      min="0"
                      step={updateType === "percentage" ? "1" : "0.01"}
                      value={adjustmentValue}
                      onChange={(e) => setAdjustmentValue(e.target.value)}
                      placeholder={updateType === "percentage" ? "10" : "1.00"}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {updateType === "csv" && (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Upload CSV File</h3>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <FileSpreadsheet className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                <p className="text-sm text-slate-600 mb-1">Drop your CSV file here or click to browse</p>
                <p className="text-xs text-slate-500 mb-4">CSV should have columns: SKU, New Price</p>
                <div className="flex justify-center gap-3">
                  <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handlePreview}
              disabled={isProcessing || (!adjustmentValue && updateType !== "csv")}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Preview...
                </>
              ) : (
                <>
                  Preview Changes
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Review Changes Carefully</p>
                <p className="text-sm text-yellow-700">
                  You are about to update prices for {previewData.length} products. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">SKU</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Current Price</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">New Price</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewData.map((item) => (
                  <tr key={item.sku} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-sm text-slate-600">{item.sku}</td>
                    <td className="px-4 py-3 text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(item.current_price)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatCurrency(item.new_price)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={item.change >= 0 ? "text-green-600" : "text-red-600"}>
                        {item.change >= 0 ? "+" : ""}
                        {formatCurrency(item.change)} ({item.change_percent.toFixed(1)}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={resetForm}>
              Back to Settings
            </Button>
            <Button
              onClick={handleApplyChanges}
              disabled={isProcessing}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Applying Changes...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Apply {previewData.length} Price Updates
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {step === "complete" && (
        <div className="max-w-md mx-auto text-center py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Prices Updated Successfully</h3>
          <p className="text-slate-600 mb-6">
            {previewData.length} products have been updated with new prices.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={resetForm}>
              Update More Prices
            </Button>
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <a href="/admin/products">View Products</a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
