import { NextRequest, NextResponse } from "next/server";
import {
  Product,
  SupplierImportConfig,
} from "@/lib/products/product-store";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";
import { requireRhsAdmin } from "@/lib/admin";
import { isUuid } from "@/lib/products/product-mapper";

// POST /api/products/import - Bulk import products
export async function POST(request: NextRequest) {
  try {
    const adminUserId = await requireRhsAdmin();
    if (!adminUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = getSupabaseServiceClient();
    const contentType = request.headers.get('content-type') || '';
    
    // Handle CSV file upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const configStr = formData.get('config') as string;
      
      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }
      
      const config: SupplierImportConfig = configStr
        ? JSON.parse(configStr)
        : getDefaultImportConfig();

      const csvContent = await file.text();
      const parsed = parseCsvProducts(csvContent, config);

      const categoryMap = await loadCategoryMap();
      const result = await upsertProducts(
        supabase,
        parsed.products,
        config,
        categoryMap,
        false,
      );

      return NextResponse.json({
        success: true,
        message: `Import complete: ${result.imported} products imported`,
        imported: result.imported,
        errors: [...parsed.errors, ...result.errors].slice(0, 10), // Limit error messages
      });
    }
    
    // Handle JSON import
    const body = await request.json();
    
    if (body.type === 'csv' && body.content) {
      // CSV content as string in JSON body
      const config: SupplierImportConfig = body.config || getDefaultImportConfig();
      const parsed = parseCsvProducts(body.content, config);
      const categoryMap = await loadCategoryMap();
      const result = await upsertProducts(
        supabase,
        parsed.products,
        config,
        categoryMap,
        false,
      );

      return NextResponse.json({
        success: true,
        message: `Import complete: ${result.imported} products imported`,
        imported: result.imported,
        errors: [...parsed.errors, ...result.errors].slice(0, 10),
      });
    }
    
    if (body.products && Array.isArray(body.products)) {
      // Direct product array import
      const categoryMap = await loadCategoryMap();
      const result = await upsertProducts(
        supabase,
        body.products,
        body.config || getDefaultImportConfig(),
        categoryMap,
        body.clearExisting ?? false,
        body.upsert ?? true,
      );

      return NextResponse.json({
        success: true,
        message: `Import complete: ${result.imported} products imported`,
        imported: result.imported,
        updated: result.updated,
        errors: result.errors.slice(0, 10),
      });
    }
    
    return NextResponse.json(
      {
        error:
          "Invalid import format. Provide either a CSV file or JSON with products array.",
      },
      { status: 400 },
    );
    
  } catch (error) {
    console.error("Error importing products:", error);
    return NextResponse.json(
      { error: "Failed to import products: " + (error as Error).message },
      { status: 500 },
    );
  }
}

// GET /api/products/import - Get import template and mapping info
export async function GET() {
  return NextResponse.json({
    csvTemplate: {
      headers: [
        'sku',
        'name', 
        'description',
        'price',
        'category',
        'subcategory',
        'brand',
        'stock_quantity',
        'image_url',
        'unit_type',
        'units_per_case',
        'eco_friendly'
      ],
      example: [
        'PKG-001',
        'Kraft Paper Bags 10lb',
        'Eco-friendly kraft paper bags for takeout',
        '24.99',
        'packaging-takeout',
        'paper-bags',
        'EcoPack',
        '500',
        'https://example.com/image.jpg',
        'case',
        '500',
        'true'
      ]
    },
    supportedMappings: [
      { sourceField: 'sku', targetField: 'sku', description: 'Product SKU' },
      { sourceField: 'name', targetField: 'name', description: 'Product name (required)' },
      { sourceField: 'description', targetField: 'description', description: 'Short description' },
      { sourceField: 'price', targetField: 'priceCents', transform: 'cents', description: 'Price in dollars (converted to cents)' },
      { sourceField: 'category', targetField: 'category', description: 'Main category slug' },
      { sourceField: 'subcategory', targetField: 'subcategory', description: 'Subcategory slug' },
      { sourceField: 'brand', targetField: 'brand', description: 'Brand name' },
      { sourceField: 'stock_quantity', targetField: 'stockQuantity', transform: 'number', description: 'Available stock' },
      { sourceField: 'image_url', targetField: 'image', description: 'Product image URL' },
      { sourceField: 'unit_type', targetField: 'unitType', description: 'Unit type (each, case, pack)' },
      { sourceField: 'units_per_case', targetField: 'unitsPerCase', transform: 'number', description: 'Units per case' },
      { sourceField: 'eco_friendly', targetField: 'ecoFriendly', transform: 'boolean', description: 'Is eco-friendly' }
    ],
    categories: [
      { slug: 'packaging-takeout', name: 'Packaging & Takeout' },
      { slug: 'cutlery-utensils', name: 'Cutlery & Utensils' },
      { slug: 'beverages-cups', name: 'Beverages & Cups' },
      { slug: 'labels-stickers', name: 'Labels & Stickers' },
      { slug: 'cleaning-safety', name: 'Cleaning & Safety' },
      { slug: 'paper-products', name: 'Paper Products' },
      { slug: 'kitchen-equipment', name: 'Kitchen Equipment' },
      { slug: 'furniture-fixtures', name: 'Furniture & Fixtures' }
    ]
  });
}

function getDefaultImportConfig(): SupplierImportConfig {
  return {
    supplierId: 'manual-import',
    supplierName: 'Manual Import',
    importType: 'csv',
    priceMarkupPercent: 0,
    enabled: true,
    mappings: [
      { sourceField: 'sku', targetField: 'sku', transform: 'none' },
      { sourceField: 'name', targetField: 'name', transform: 'none' },
      { sourceField: 'description', targetField: 'description', transform: 'none' },
      { sourceField: 'price', targetField: 'priceCents', transform: 'cents' },
      { sourceField: 'category', targetField: 'category', transform: 'lowercase' },
      { sourceField: 'subcategory', targetField: 'subcategory', transform: 'lowercase' },
      { sourceField: 'brand', targetField: 'brand', transform: 'none' },
      { sourceField: 'stock_quantity', targetField: 'stockQuantity', transform: 'number' },
      { sourceField: 'image_url', targetField: 'image', transform: 'none' },
      { sourceField: 'unit_type', targetField: 'unitType', transform: 'lowercase' },
      { sourceField: 'units_per_case', targetField: 'unitsPerCase', transform: 'number' },
      { sourceField: 'eco_friendly', targetField: 'ecoFriendly', transform: 'boolean' }
    ]
  };
}

function parseCsvProducts(csvContent: string, config: SupplierImportConfig) {
  const lines = csvContent.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    return { products: [], errors: ["CSV file is empty or has no data rows"] };
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const products: Product[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    if (values.length !== headers.length) {
      errors.push(`Row ${i + 1}: column count mismatch`);
      continue;
    }

    try {
      const rawData: Record<string, string> = {};
      headers.forEach((h, idx) => {
        rawData[h] = values[idx];
      });

      const product: Partial<Product> = {
        id: rawData["id"] || undefined,
        supplierProductId: rawData["supplier_product_id"] || rawData["id"],
      };

      for (const mapping of config.mappings) {
        const sourceValue = rawData[mapping.sourceField.toLowerCase()];
        if (sourceValue !== undefined) {
          let transformedValue: any = sourceValue;

          switch (mapping.transform) {
            case "lowercase":
              transformedValue = sourceValue.toLowerCase();
              break;
            case "uppercase":
              transformedValue = sourceValue.toUpperCase();
              break;
            case "number":
              transformedValue = parseFloat(sourceValue) || 0;
              break;
            case "boolean":
              transformedValue =
                sourceValue.toLowerCase() === "true" || sourceValue === "1";
              break;
            case "cents":
              transformedValue = Math.round(parseFloat(sourceValue) * 100) || 0;
              break;
          }

          (product as any)[mapping.targetField] = transformedValue;
        }
      }

      if (product.priceCents && config.priceMarkupPercent > 0) {
        product.priceCents = Math.round(
          product.priceCents * (1 + config.priceMarkupPercent / 100),
        );
      }

      product.category = product.category || config.defaultCategory || "uncategorized";
      product.inStock = product.inStock ?? true;

      if (product.name && product.priceCents) {
        products.push(product as Product);
      } else {
        errors.push(`Row ${i + 1}: missing name or price`);
      }
    } catch (err) {
      errors.push(`Row ${i + 1}: ${err}`);
    }
  }

  return { products, errors };
}

async function loadCategoryMap() {
  const supabase = getSupabaseServiceClient();
  const { data } = await supabase
    .from("product_categories")
    .select("id, slug");
  const categoryMap = new Map<string, string>();
  (data || []).forEach((row) => {
    if (row.slug) {
      categoryMap.set(row.slug, row.id);
    }
  });
  return categoryMap;
}

function mapProductToRow(
  product: Product,
  config: SupplierImportConfig,
  categoryMap: Map<string, string>,
) {
  const sku = product.sku || product.supplierProductId || product.id;
  if (!sku) {
    return { error: "Missing SKU", row: null };
  }
  if (!product.name || !product.priceCents) {
    return { error: `Missing name or price for SKU ${sku}`, row: null };
  }

  const categoryId = product.category ? categoryMap.get(product.category) : null;
  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

  const stockQuantity =
    product.stockQuantity !== undefined
      ? product.stockQuantity
      : product.inStock === false
        ? 0
        : null;

  const trackInventory =
    product.stockQuantity !== undefined || product.inStock === false;

  const row: Record<string, any> = {
    supplier: config.supplierId || "supplier",
    name: product.name,
    category: product.category || null,
    category_id: categoryId || null,
    subcategory: product.subcategory || null,
    brand: product.brand || null,
    internal_sku: sku,
    sku,
    description: product.description || null,
    long_description: product.longDescription || null,
    price_cents: product.priceCents,
    compare_at_price_cents: product.originalPriceCents || null,
    wholesale_price_cents: product.wholesalePriceCents || null,
    min_order_quantity: product.minOrderQuantity || null,
    unit_type: product.unitType || null,
    units_per_case: product.unitsPerCase || null,
    stock_quantity: stockQuantity,
    track_inventory: trackInventory,
    ships_free: product.freeShipping ?? null,
    is_eco_friendly: product.ecoFriendly ?? null,
    attributes: product.badge ? { badge: product.badge } : {},
    specifications: product.specifications || {},
    images,
    thumbnail_url: product.image || null,
    average_rating: product.rating || null,
    review_count: product.reviewCount || null,
    tags: product.tags || [],
    supplier_product_id: product.supplierProductId || null,
    status: "active",
    is_active: true,
    resale_price: product.priceCents / 100,
    cost_estimate:
      product.wholesalePriceCents !== undefined
        ? product.wholesalePriceCents / 100
        : null,
  };

  if (product.id && isUuid(product.id)) {
    row.id = product.id;
  }

  return { error: null, row };
}

async function upsertProducts(
  supabase: ReturnType<typeof getSupabaseServiceClient>,
  products: Product[],
  config: SupplierImportConfig,
  categoryMap: Map<string, string>,
  clearExisting: boolean,
  upsert = true,
) {
  const errors: string[] = [];
  if (clearExisting) {
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (deleteError) {
      errors.push(`Failed to clear existing products: ${deleteError.message}`);
    }
  }

  const rows: Record<string, any>[] = [];
  products.forEach((product) => {
    const { error, row } = mapProductToRow(product, config, categoryMap);
    if (error) {
      errors.push(error);
      return;
    }
    rows.push(row!);
  });

  if (rows.length === 0) {
    return { imported: 0, updated: 0, errors };
  }

  const insertQuery = supabase.from("products").upsert(rows, {
    onConflict: "internal_sku",
    ignoreDuplicates: !upsert,
  });

  const { data, error } = await insertQuery.select("id");

  if (error) {
    errors.push(error.message);
    return { imported: 0, updated: 0, errors };
  }

  return { imported: data?.length || 0, updated: 0, errors };
}
