import { NextResponse } from 'next/server';
import { withAdminAuth, checkAdminAccess } from '@/lib/admin-auth';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/inventory
 * Fetch all inventory items with stock movements
 * Uses withAdminAuth HOF for single auth check
 */
export const GET = withAdminAuth(async (req) => {
  try {
    const supabase = await createClient();

    // Get query parameters using standard URL API
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    // Build query with explicit filters for query planner optimization
    let query = supabase
      .from('inventory_items')
      .select(`
        *,
        product:products!inventory_items_product_id_fkey (
          id,
          sku,
          name,
          category,
          unit_type,
          cost_estimate,
          lead_time_days,
          supplier
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters - explicit filters help query planner even with RLS
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`product.name.ilike.%${search}%,product.sku.ilike.%${search}%`);
    }

    const { data: items, error } = await query;

    if (error) {
      console.error('Error fetching inventory:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate derived fields
    const enrichedItems = items?.map(item => {
      const unitCost = item.unit_cost || item.product?.cost_estimate || 0;
      const daysOfStock = unitCost > 0 && item.available_stock
        ? Math.floor(item.available_stock / (unitCost * 0.1)) // rough estimate
        : 0;

      return {
        id: item.id,
        sku: item.product?.sku || 'N/A',
        name: item.product?.name || 'Unknown',
        category: item.product?.category || 'Uncategorized',
        currentStock: item.current_stock,
        reservedStock: item.reserved_stock,
        availableStock: item.available_stock,
        reorderPoint: item.reorder_point,
        reorderQty: item.reorder_quantity,
        unit: item.product?.unit_type || 'units',
        status: item.status,
        lastUpdated: item.updated_at,
        leadTimeDays: item.product?.lead_time_days || 0,
        supplier: item.product?.supplier || null,
        cost: unitCost,
        location: item.warehouse_location,
        daysOfStock,
        productId: item.product_id,
      };
    }) || [];

    return NextResponse.json({
      items: enrichedItems,
      total: enrichedItems.length,
    });

  } catch (error) {
    console.error('Inventory fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/admin/inventory
 * Create new inventory item
 */
export async function POST(request: Request) {
  try {
    // Use checkAdminAccess for POST since we need user.id
    const { user, isAdmin } = await checkAdminAccess();
    if (!user || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    const body = await request.json();
    const {
      product_id,
      current_stock,
      reorder_point,
      reorder_quantity,
      unit_cost,
      warehouse_location,
    } = body;

    // Validate required fields
    if (!product_id || current_stock === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: product_id, current_stock' },
        { status: 400 }
      );
    }

    // Create inventory item
    const { data: item, error } = await supabase
      .from('inventory_items')
      .insert({
        product_id,
        current_stock,
        reserved_stock: 0,
        reorder_point: reorder_point || 0,
        reorder_quantity: reorder_quantity || 0,
        unit_cost: unit_cost || null,
        warehouse_location: warehouse_location || null,
        status: current_stock > (reorder_point || 0) ? 'in_stock' : 'low_stock',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating inventory item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create stock movement record
    await supabase.from('stock_movements').insert({
      inventory_item_id: item.id,
      movement_type: 'in',
      quantity: current_stock,
      reference_type: 'initial_stock',
      reference_id: item.id,
      notes: 'Initial stock entry',
      performed_by: user.id,
    });

    return NextResponse.json({ item }, { status: 201 });

  } catch (error) {
    console.error('Inventory creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}
