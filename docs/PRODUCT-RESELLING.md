# Product Reselling (Supplies)

## Scope
Restaurant Hub Solution resells restaurant supplies sourced from trusted suppliers. The portal stores a curated internal catalog and manages quotes manually. This is not an ecommerce checkout.

## Product Selection
- Choose items that are frequently reordered (packaging, labels, gloves, paper goods, smallwares).
- Prioritize products with stable availability and clear shipping requirements.
- Add each product manually with a supplier URL and internal SKU.

## Pricing + Margin
- Resale price is set manually.
- Margin is calculated as: `resale_price - cost_estimate`.
- If cost is unknown, leave `cost_estimate` empty and revisit when supplier pricing is confirmed.

## Quote Workflow (MVP)
1. Create a draft quote for a tenant/location.
2. Add supply products as line items with quantity and unit price.
3. Set manual shipping + tax estimates.
4. Update status: `draft -> sent -> accepted -> fulfilled`.
5. Fulfillment is manual (place the supplier order outside the portal).

## Fulfillment (Manual)
- Place the supplier order with the chosen vendor.
- Record any adjustments or tracking notes in the quote notes.
- Mark quote as `fulfilled` once delivered.

## Compliance
- Do not claim or imply affiliation with any supplier.
- Provide supplier links for reference only.
- Avoid promising real-time inventory or pricing in the MVP.
