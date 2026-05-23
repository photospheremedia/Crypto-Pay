import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@crypto-pay/db/supabaseServer';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/inventory/[id]
 * Fetch single inventory item with movement history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch inventory item
    const { data: item, error: itemError } = await supabase
      .from('inventory_items')
      .select(`
        *,
        product:products!inventory_items_product_id_fkey (
          id,
          sku,
          name,
          category,
          unit_of_measure,
          unit_cost
        )
      `)  
      .eq('id', id)
      .single();

    if (itemError) {
      return NextResponse.json({ error: itemError.message }, { status: 404 });
    }

    // Fetch stock movements
    const { data: movements, error: movementsError } = await supabase
      .from('stock_movements')
      .select('*')
      .eq('inventory_item_id', id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (movementsError) {
      console.error('Error fetching movements:', movementsError);
    }

    return NextResponse.json({
      item,
      movements: movements || [],
    });

  } catch (error) {
    console.error('Inventory item fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory item' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/inventory/[id]
 * Update inventory item
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      current_stock,
      reorder_point,
      reorder_quantity,
      lead_time_days,
      supplier_name,
      location,
      adjustment_reason,
    } = body;

    // Get current item for comparison
    const { data: currentItem } = await supabase
      .from('inventory_items')
      .select('current_stock, reserved_stock')
      .eq('id', id)
      .single();

    // Update inventory item
    const updateData: any = {};
    if (current_stock !== undefined) updateData.current_stock = current_stock;
    if (reorder_point !== undefined) updateData.reorder_point = reorder_point;
    if (reorder_quantity !== undefined) updateData.reorder_quantity = reorder_quantity;
    if (lead_time_days !== undefined) updateData.lead_time_days = lead_time_days;
    if (supplier_name !== undefined) updateData.supplier_name = supplier_name;
    if (location !== undefined) updateData.location = location;

    // Calculate new status
    if (current_stock !== undefined && reorder_point !== undefined) {
      if (current_stock === 0) {
        updateData.status = 'out_of_stock';
      } else if (current_stock <= reorder_point) {
        updateData.status = 'low_stock';
      } else {
        updateData.status = 'in_stock';
      }
    }

    const { data: item, error } = await supabase
      .from('inventory_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating inventory item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create stock movement if quantity changed
    if (current_stock !== undefined && currentItem && current_stock !== currentItem.current_stock) {
      const difference = current_stock - currentItem.current_stock;
      await supabase.from('stock_movements').insert({
        inventory_item_id: id,
        movement_type: difference > 0 ? 'in' : 'out',
        quantity: Math.abs(difference),
        reference_type: 'adjustment',
        reference_id: id,
        notes: adjustment_reason || 'Manual adjustment',
        created_by: user.id,
      });
    }

    return NextResponse.json({ item });

  } catch (error) {
    console.error('Inventory update error:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/inventory/[id]
 * Delete inventory item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete stock movements first (foreign key constraint)
    await supabase
      .from('stock_movements')
      .delete()
      .eq('inventory_item_id', id);

    // Delete inventory item
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting inventory item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Inventory deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
}
