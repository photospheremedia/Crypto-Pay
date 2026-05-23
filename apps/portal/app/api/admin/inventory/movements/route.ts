import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import { withAdminAuth, checkAdminAccess } from "@/lib/admin-auth";

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/inventory/movements
 * Fetch recent stock movements
 */
export const GET = withAdminAuth(async (req, { user }) => {
  try {
    const supabase = await createClient();

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const inventoryItemId = url.searchParams.get('inventory_item_id');

    let query = supabase
      .from('stock_movements')
      .select(`
        *,
        inventory_item:inventory_items!stock_movements_inventory_item_id_fkey (
          id,
          product:products!inventory_items_product_id_fkey (
            sku,
            name
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (inventoryItemId) {
      query = query.eq('inventory_item_id', inventoryItemId);
    }

    const { data: movements, error } = await query;

    if (error) {
      console.error('Error fetching movements:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedMovements = movements?.map(m => ({
      id: m.id,
      sku: m.inventory_item?.product?.sku || 'N/A',
      productName: m.inventory_item?.product?.name || 'Unknown',
      type: m.movement_type,
      quantity: m.quantity,
      reason: m.notes || `${m.reference_type}: ${m.reference_id}`,
      date: m.created_at,
      user: m.performed_by || 'System',
    })) || [];

    return NextResponse.json({
      movements: formattedMovements,
      total: formattedMovements.length,
    });

  } catch (error) {
    console.error('Movements fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock movements' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/admin/inventory/movements
 * Create stock movement (adjust inventory)
 */
export async function POST(request: NextRequest) {
  try {
    const { user } = await checkAdminAccess();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();
    const {
      inventory_item_id,
      movement_type,
      quantity,
      reference_type,
      reference_id,
      notes,
    } = body;

    // Validate
    if (!inventory_item_id || !movement_type || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current inventory item
    const { data: item, error: itemError } = await supabase
      .from('inventory_items')
      .select('current_stock, reserved_stock, reorder_point')
      .eq('id', inventory_item_id)
      .single();

    if (itemError) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    // Calculate new stock
    let newStock = item.current_stock;
    if (movement_type === 'in') {
      newStock += quantity;
    } else if (movement_type === 'out') {
      newStock -= quantity;
      if (newStock < 0) {
        return NextResponse.json(
          { error: 'Insufficient stock' },
          { status: 400 }
        );
      }
    } else if (movement_type === 'adjustment') {
      newStock = quantity; // Direct set
    }

    // Determine new status
    let newStatus = 'in_stock';
    if (newStock === 0) {
      newStatus = 'out_of_stock';
    } else if (item.reorder_point && newStock <= item.reorder_point) {
      newStatus = 'low_stock';
    }

    // Update inventory
    const { error: updateError } = await supabase
      .from('inventory_items')
      .update({
        current_stock: newStock,
        status: newStatus,
      })
      .eq('id', inventory_item_id);

    if (updateError) {
      console.error('Error updating inventory:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Create movement record
    const { data: movement, error: movementError } = await supabase
      .from('stock_movements')
      .insert({
        inventory_item_id,
        movement_type,
        quantity: Math.abs(quantity),
        reference_type: reference_type || 'manual',
        reference_id: reference_id || inventory_item_id,
        notes: notes || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (movementError) {
      console.error('Error creating movement:', movementError);
      return NextResponse.json({ error: movementError.message }, { status: 500 });
    }

    return NextResponse.json({
      movement,
      new_stock: newStock,
      new_status: newStatus,
    }, { status: 201 });

  } catch (error) {
    console.error('Movement creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create stock movement' },
      { status: 500 }
    );
  }
}
