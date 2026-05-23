import { z } from "zod";

export const SupplyProductCreateInputSchema = z.object({
  name: z.string().min(2).max(160),
  internal_sku: z.string().min(2).max(64),
  supplier: z.string().min(2).max(64).optional(),
  category: z.string().min(2).max(80).optional(),
  supplier_url: z.string().url().optional(),
  cost_estimate: z.number().nonnegative().optional(),
  resale_price: z.number().nonnegative(),
  notes: z.string().max(2000).optional(),
  is_active: z.boolean().optional(),
});

export const SupplyProductUpdateInputSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(2).max(160).optional(),
    internal_sku: z.string().min(2).max(64).optional(),
    supplier: z.string().min(2).max(64).optional(),
    category: z.string().min(2).max(80).optional(),
    supplier_url: z.string().url().optional(),
    cost_estimate: z.number().nonnegative().nullable().optional(),
    resale_price: z.number().nonnegative().optional(),
    notes: z.string().max(2000).nullable().optional(),
    is_active: z.boolean().optional(),
  })
  .refine(
    (data) => Object.keys(data).some((key) => key !== "id"),
    { message: "No updates provided" },
  );

export const SupplyQuoteStatusSchema = z.enum([
  "draft",
  "sent",
  "accepted",
  "fulfilled",
  "cancelled",
]);

export const SupplyQuoteCreateInputSchema = z.object({
  locationId: z.string().uuid().nullable().optional(),
  notes: z.string().max(2000).optional(),
});

export const SupplyQuoteUpdateInputSchema = z
  .object({
    id: z.string().uuid(),
    status: SupplyQuoteStatusSchema.optional(),
    shipping_estimate: z.number().nonnegative().nullable().optional(),
    tax_estimate: z.number().nonnegative().nullable().optional(),
    notes: z.string().max(2000).nullable().optional(),
  })
  .refine(
    (data) => Object.keys(data).some((key) => key !== "id"),
    { message: "No updates provided" },
  );

export const SupplyQuoteLineAddInputSchema = z.object({
  quoteId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unit_price: z.number().nonnegative().optional(),
});

export const SupplyQuoteLineUpdateInputSchema = z
  .object({
    id: z.string().uuid(),
    quantity: z.number().int().positive().optional(),
    unit_price: z.number().nonnegative().optional(),
  })
  .refine(
    (data) => Object.keys(data).some((key) => key !== "id"),
    { message: "No updates provided" },
  );

export const SupplyQuoteLineDeleteInputSchema = z.object({
  id: z.string().uuid(),
});

export const SupplyQuickAddInputSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1),
});
