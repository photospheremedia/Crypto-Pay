"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  FileText,
  Table,
  Eye,
  Save,
  RefreshCw,
  HelpCircle,
  Package,
} from "lucide-react";

type ImportStep = "upload" | "mapping" | "preview" | "importing" | "complete";

type ColumnMapping = {
  sourceColumn: string;
  targetField: string;
};

type ProductRow = {
  [key: string]: string | number;
};

type ImportError = {
  row: number;
  field: string;
  message: string;
};

const targetFields = [
  { key: "sku", label: "SKU *", required: true },
  { key: "name", label: "Product Name *", required: true },
  { key: "description", label: "Description", required: false },
  { key: "category", label: "Category", required: false },
  { key: "subcategory", label: "Subcategory", required: false },
  { key: "brand", label: "Brand", required: false },
  { key: "price", label: "Price *", required: true },
  { key: "cost", label: "Cost", required: false },
  { key: "unit", label: "Unit (each, case, lb)", required: false },
  { key: "case_size", label: "Case Size", required: false },
  { key: "weight", label: "Weight", required: false },
  { key: "dimensions", label: "Dimensions", required: false },
  { key: "stock_quantity", label: "Stock Quantity", required: false },
  { key: "min_order_qty", label: "Min Order Qty", required: false },
  { key: "lead_time_days", label: "Lead Time (Days)", required: false },
  { key: "image_url", label: "Image URL", required: false },
  { key: "barcode", label: "Barcode/UPC", required: false },
  { key: "supplier", label: "Supplier", required: false },
  { key: "status", label: "Status (active/draft)", required: false },
  { key: "tags", label: "Tags (comma-separated)", required: false },
];

// Sample data for template download
const sampleData = [
  {
    sku: "PKG-001",
    name: "Takeout Container 32oz",
    description: "Microwavable PP container with lid",
    category: "Packaging & Takeout",
    subcategory: "Takeout Containers",
    brand: "EcoChoice",
    price: 45.99,
    cost: 28.50,
    unit: "case",
    case_size: 250,
    stock_quantity: 500,
    min_order_qty: 1,
    image_url: "https://example.com/container.jpg",
    status: "active",
  },
  {
    sku: "CUT-001",
    name: "Heavy Duty Fork - Black",
    description: "Polypropylene fork, recyclable",
    category: "Cutlery & Utensils",
    subcategory: "Plastic Cutlery",
    brand: "Dixie",
    price: 24.99,
    cost: 15.00,
    unit: "case",
    case_size: 1000,
    stock_quantity: 1200,
    min_order_qty: 1,
    image_url: "https://example.com/fork.jpg",
    status: "active",
  },
];

export default function ProductImportPage() {
  const [step, setStep] = useState<ImportStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ProductRow[]>([]);
  const [sourceColumns, setSourceColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping[]>([]);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState({ success: 0, failed: 0, skipped: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith(".csv") || droppedFile.name.endsWith(".xlsx"))) {
      handleFileSelect(droppedFile);
    }
  }, []);

  // Handle file selection
  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    
    // Parse CSV (simplified - in production use a proper CSV parser)
    const text = await selectedFile.text();
    const lines = text.split("\n").filter((line) => line.trim());
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    
    const rows: ProductRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
      const row: ProductRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      rows.push(row);
    }

    setSourceColumns(headers);
    setParsedData(rows);

    // Auto-map columns with matching names
    const autoMapping: ColumnMapping[] = headers.map((header) => {
      const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const matchedField = targetFields.find(
        (f) =>
          f.key === normalizedHeader ||
          f.label.toLowerCase().replace(/[^a-z0-9]/g, "_").includes(normalizedHeader) ||
          normalizedHeader.includes(f.key)
      );
      return {
        sourceColumn: header,
        targetField: matchedField?.key || "",
      };
    });

    setColumnMapping(autoMapping);
    setStep("mapping");
  };

  // Update column mapping
  const updateMapping = (sourceColumn: string, targetField: string) => {
    setColumnMapping((prev) =>
      prev.map((m) =>
        m.sourceColumn === sourceColumn ? { ...m, targetField } : m
      )
    );
  };

  // Validate data
  const validateData = (): ImportError[] => {
    const newErrors: ImportError[] = [];
    const requiredFields = targetFields.filter((f) => f.required).map((f) => f.key);
    const mappedRequired = columnMapping
      .filter((m) => requiredFields.includes(m.targetField))
      .map((m) => m.targetField);

    // Check if all required fields are mapped
    requiredFields.forEach((field) => {
      if (!mappedRequired.includes(field)) {
        newErrors.push({
          row: 0,
          field,
          message: `Required field "${targetFields.find((f) => f.key === field)?.label}" is not mapped`,
        });
      }
    });

    // Validate each row
    parsedData.forEach((row, index) => {
      columnMapping.forEach((mapping) => {
        if (!mapping.targetField) return;
        
        const value = row[mapping.sourceColumn];
        
        // Check required fields
        if (requiredFields.includes(mapping.targetField) && !value) {
          newErrors.push({
            row: index + 2, // +2 for header row and 0-index
            field: mapping.targetField,
            message: `Missing required value`,
          });
        }

        // Validate price/cost are numbers
        if (["price", "cost", "stock_quantity", "min_order_qty", "case_size"].includes(mapping.targetField)) {
          if (value && isNaN(Number(value))) {
            newErrors.push({
              row: index + 2,
              field: mapping.targetField,
              message: `Must be a number`,
            });
          }
        }
      });
    });

    setErrors(newErrors);
    return newErrors;
  };

  // Proceed to preview
  const proceedToPreview = () => {
    const validationErrors = validateData();
    if (validationErrors.filter((e) => e.row === 0).length === 0) {
      setStep("preview");
    }
  };

  // Start import
  const startImport = async () => {
    setStep("importing");
    setImportProgress(0);
    
    const results = { success: 0, failed: 0, skipped: 0 };
    const totalRows = parsedData.length;

    // Simulate import process (in production, this would call your API)
    for (let i = 0; i < totalRows; i++) {
      await new Promise((resolve) => setTimeout(resolve, 50)); // Simulate API call
      
      const rowErrors = errors.filter((e) => e.row === i + 2);
      if (rowErrors.length > 0) {
        results.failed++;
      } else {
        results.success++;
      }

      setImportProgress(Math.round(((i + 1) / totalRows) * 100));
      setImportResults({ ...results, skipped: 0 });
    }

    setStep("complete");
  };

  // Download template
  const downloadTemplate = () => {
    const headers = targetFields.map((f) => f.key);
    const csvContent = [
      headers.join(","),
      ...sampleData.map((row) =>
        headers.map((h) => `"${(row as Record<string, unknown>)[h] || ""}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset import
  const resetImport = () => {
    setStep("upload");
    setFile(null);
    setParsedData([]);
    setSourceColumns([]);
    setColumnMapping([]);
    setErrors([]);
    setImportProgress(0);
    setImportResults({ success: 0, failed: 0, skipped: 0 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bulk Product Import</h1>
          <p className="text-sm text-slate-500">
            Import products from CSV or Excel files
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {["upload", "mapping", "preview", "importing", "complete"].map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step === s
                  ? "bg-orange-500 text-white"
                  : ["upload", "mapping", "preview", "importing", "complete"].indexOf(step) > i
                  ? "bg-orange-100 text-orange-500"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {i + 1}
            </div>
            {i < 4 && (
              <div
                className={`h-0.5 w-12 ${
                  ["upload", "mapping", "preview", "importing", "complete"].indexOf(step) > i
                    ? "bg-orange-500"
                    : "bg-slate-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div className="space-y-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
              isDragging
                ? "border-orange-500 bg-orange-50"
                : "border-slate-300 bg-slate-50 hover:border-slate-400"
            }`}
          >
            <Upload className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Drop your file here, or browse
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Supports CSV and Excel (.xlsx) files
            </p>
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-medium text-white hover:bg-orange-600"
            >
              <FileSpreadsheet className="h-5 w-5" />
              Select File
            </label>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <HelpCircle className="h-5 w-5 text-slate-400" />
              Import Instructions
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="font-medium text-orange-500">1.</span>
                Download our template to see the required format
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-orange-500">2.</span>
                Required fields: SKU, Product Name, Price
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-orange-500">3.</span>
                First row must contain column headers
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-orange-500">4.</span>
                Max 10,000 products per import
              </li>
            </ul>
            <button
              onClick={downloadTemplate}
              className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Download Template
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Column Mapping */}
      {step === "mapping" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Map Columns</h3>
                <p className="text-sm text-slate-500">
                  Match your columns to our product fields
                </p>
              </div>
              <div className="text-sm text-slate-500">
                <FileText className="mr-1 inline h-4 w-4" />
                {file?.name} ({parsedData.length} rows)
              </div>
            </div>

            {errors.filter((e) => e.row === 0).length > 0 && (
              <div className="mb-4 rounded-lg bg-red-50 p-4">
                <h4 className="flex items-center gap-2 font-medium text-red-800">
                  <AlertTriangle className="h-4 w-4" />
                  Mapping Errors
                </h4>
                <ul className="mt-2 text-sm text-red-600">
                  {errors
                    .filter((e) => e.row === 0)
                    .map((error, i) => (
                      <li key={i}>{error.message}</li>
                    ))}
                </ul>
              </div>
            )}

            <div className="space-y-3">
              {sourceColumns.map((col) => {
                const mapping = columnMapping.find((m) => m.sourceColumn === col);
                return (
                  <div
                    key={col}
                    className="flex items-center gap-4 rounded-lg border border-slate-200 p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-700">{col}</p>
                      <p className="text-xs text-slate-400">
                        Sample: {String(parsedData[0]?.[col] || "").substring(0, 50)}
                      </p>
                    </div>
                    <div className="text-slate-400">→</div>
                    <select
                      value={mapping?.targetField || ""}
                      onChange={(e) => updateMapping(col, e.target.value)}
                      className="w-48 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="">-- Skip this column --</option>
                      {targetFields.map((field) => (
                        <option key={field.key} value={field.key}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={resetImport}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Start Over
            </button>
            <button
              onClick={proceedToPreview}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-2 font-medium text-white hover:bg-orange-600"
            >
              <Eye className="h-4 w-4" />
              Preview Import
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === "preview" && (
        <div className="space-y-6">
          {errors.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h4 className="flex items-center gap-2 font-medium text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                {errors.length} validation warning(s)
              </h4>
              <p className="mt-1 text-sm text-amber-600">
                Rows with errors will be skipped during import
              </p>
              <div className="mt-3 max-h-32 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="text-amber-700">
                    <tr>
                      <th className="px-2 py-1 text-left">Row</th>
                      <th className="px-2 py-1 text-left">Field</th>
                      <th className="px-2 py-1 text-left">Issue</th>
                    </tr>
                  </thead>
                  <tbody className="text-amber-600">
                    {errors.slice(0, 10).map((error, i) => (
                      <tr key={i}>
                        <td className="px-2 py-1">{error.row}</td>
                        <td className="px-2 py-1">{error.field}</td>
                        <td className="px-2 py-1">{error.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {errors.length > 10 && (
                  <p className="mt-2 text-xs text-amber-600">
                    + {errors.length - 10} more errors
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 p-4">
              <h3 className="font-semibold text-slate-900">Preview Data</h3>
              <p className="text-sm text-slate-500">
                First 10 rows of {parsedData.length} total
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">#</th>
                    {columnMapping
                      .filter((m) => m.targetField)
                      .map((m) => (
                        <th key={m.targetField} className="px-4 py-3 font-medium">
                          {targetFields.find((f) => f.key === m.targetField)?.label}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedData.slice(0, 10).map((row, i) => {
                    const rowHasError = errors.some((e) => e.row === i + 2);
                    return (
                      <tr
                        key={i}
                        className={rowHasError ? "bg-red-50" : "hover:bg-slate-50"}
                      >
                        <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                        {columnMapping
                          .filter((m) => m.targetField)
                          .map((m) => (
                            <td key={m.targetField} className="px-4 py-3 text-slate-700">
                              {String(row[m.sourceColumn] || "").substring(0, 30)}
                              {String(row[m.sourceColumn] || "").length > 30 && "..."}
                            </td>
                          ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-orange-800">Ready to Import</h4>
                <p className="text-sm text-orange-500">
                  {parsedData.length - errors.filter((e) => e.row > 0).length} products will be imported
                  {errors.filter((e) => e.row > 0).length > 0 &&
                    `, ${errors.filter((e) => e.row > 0).length} will be skipped`}
                </p>
              </div>
              <Package className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep("mapping")}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Back to Mapping
            </button>
            <button
              onClick={startImport}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-2 font-medium text-white hover:bg-orange-600"
            >
              <Save className="h-4 w-4" />
              Start Import
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Importing */}
      {step === "importing" && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-orange-500" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            Importing Products...
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Please don't close this page
          </p>
          <div className="mx-auto mt-6 max-w-md">
            <div className="flex justify-between text-sm text-slate-600">
              <span>{importProgress}% complete</span>
              <span>
                {importResults.success} imported, {importResults.failed} failed
              </span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-orange-500 transition-all duration-300"
                style={{ width: `${importProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Complete */}
      {step === "complete" && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
            <CheckCircle className="h-8 w-8 text-orange-500" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            Import Complete!
          </h3>
          <div className="mt-6 flex justify-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-500">{importResults.success}</p>
              <p className="text-sm text-slate-500">Imported</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-500">{importResults.failed}</p>
              <p className="text-sm text-slate-500">Failed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-500">{importResults.skipped}</p>
              <p className="text-sm text-slate-500">Skipped</p>
            </div>
          </div>
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={resetImport}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Import More
            </button>
            <Link
              href="/admin/products"
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-2 font-medium text-white hover:bg-orange-600"
            >
              View Products
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
