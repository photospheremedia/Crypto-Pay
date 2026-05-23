import type { Product } from "@/lib/products/product-store";

type CategoryRef = {
  slug?: string | null;
  name?: string | null;
} | null;

type ProductRow = {
  id: string;
  name?: string | null;
  category?: string | null;
  subcategory?: string | null;
  brand?: string | null;
  description?: string | null;
  short_description?: string | null;
  long_description?: string | null;
  price_cents?: number | null;
  compare_at_price_cents?: number | null;
  wholesale_price_cents?: number | null;
  min_order_quantity?: number | null;
  unit_type?: string | null;
  units_per_case?: number | null;
  stock_quantity?: number | null;
  track_inventory?: boolean | null;
  allow_backorder?: boolean | null;
  ships_free?: boolean | null;
  is_eco_friendly?: boolean | null;
  attributes?: any;
  specifications?: Record<string, string> | null;
  images?: string[] | null;
  thumbnail_url?: string | null;
  average_rating?: number | null;
  review_count?: number | null;
  tags?: string[] | null;
  supplier_product_id?: string | null;
  sku?: string | null;
  internal_sku?: string | null;
  status?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  product_categories?: CategoryRef;
};

export function mapProductRow(row: ProductRow): Product {
  const trackInventory = row.track_inventory ?? false;
  const allowBackorder = row.allow_backorder ?? false;
  const stockQuantity = row.stock_quantity ?? undefined;

  let inStock = true;
  if (trackInventory) {
    if (typeof stockQuantity === "number") {
      inStock = stockQuantity > 0 || allowBackorder;
    } else {
      inStock = allowBackorder;
    }
  }

  if (row.status && row.status !== "active") {
    inStock = false;
  }
  if (row.is_active === false) {
    inStock = false;
  }

  const badge =
    row.attributes && typeof row.attributes === "object"
      ? row.attributes.badge
      : undefined;

  const images =
    Array.isArray(row.images) && row.images.length > 0
      ? row.images
      : row.thumbnail_url
        ? [row.thumbnail_url]
        : [];

  return {
    id: row.id,
    sku: row.sku || row.internal_sku || "",
    name: row.name || "",
    description: row.description || row.short_description || "",
    longDescription: row.long_description || undefined,
    category: row.category || row.product_categories?.slug || "",
    subcategory: row.subcategory || undefined,
    brand: row.brand || undefined,
    priceCents: row.price_cents ?? 0,
    originalPriceCents: row.compare_at_price_cents ?? undefined,
    wholesalePriceCents: row.wholesale_price_cents ?? undefined,
    minOrderQuantity: row.min_order_quantity ?? undefined,
    unitType: row.unit_type ?? undefined,
    unitsPerCase: row.units_per_case ?? undefined,
    image: row.thumbnail_url || images[0] || "",
    images: images.length > 0 ? images : undefined,
    inStock,
    stockQuantity,
    leadTimeDays: undefined,
    badge: badge || undefined,
    rating: row.average_rating ?? undefined,
    reviewCount: row.review_count ?? undefined,
    freeShipping: row.ships_free ?? undefined,
    ecoFriendly: row.is_eco_friendly ?? undefined,
    tags: row.tags ?? undefined,
    specifications: row.specifications ?? undefined,
    supplierProductId: row.supplier_product_id ?? undefined,
    lastUpdated: row.updated_at || row.created_at || undefined,
  };
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
