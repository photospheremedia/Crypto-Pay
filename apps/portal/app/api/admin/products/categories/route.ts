import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@crypto-pay/db/supabaseServer';
import { checkAdminAccess } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/products/categories
 * Fetch all product categories
 */
export async function GET() {
  try {
    const { user, isAdmin } = await checkAdminAccess();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabase = await getSupabaseServerClient();

    const { data: categories, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Build hierarchy
    const categoryMap = new Map();
    const rootCategories: any[] = [];

    categories?.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    categories?.forEach(cat => {
      const category = categoryMap.get(cat.id);
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.children.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    return NextResponse.json({ 
      categories: categories || [],
      hierarchy: rootCategories 
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

/**
 * POST /api/admin/products/categories
 * Create new product category
 */
export async function POST(request: NextRequest) {
  try {
    const { user, isAdmin } = await checkAdminAccess();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabase = await getSupabaseServerClient();

    const body = await request.json();
    const { name, slug, description, parent_id, display_order } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields: name, slug' },
        { status: 400 }
      );
    }

    const { data: category, error } = await supabase
      .from('product_categories')
      .insert({
        name,
        slug,
        description,
        parent_id: parent_id || null,
        display_order: display_order || 0,
        active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Category creation error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
