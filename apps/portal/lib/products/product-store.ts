// Product data types and API client
// This module handles product data from either API or bulk import

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  manufacturer?: string;
  
  // Pricing
  priceCents: number;
  originalPriceCents?: number;
  wholesalePriceCents?: number;
  minOrderQuantity?: number;
  unitType?: string; // "each", "case", "pack", "box"
  unitsPerCase?: number;
  
  // Images
  image: string;
  images?: string[];
  
  // Inventory (from supplier API or import)
  inStock: boolean;
  stockQuantity?: number;
  leadTimeDays?: number;
  
  // Attributes
  badge?: string;
  rating?: number;
  reviewCount?: number;
  freeShipping?: boolean;
  ecoFriendly?: boolean;
  
  // Metadata
  tags?: string[];
  specifications?: Record<string, string>;
  supplierProductId?: string; // Original ID from supplier
  lastUpdated?: string;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  icon: string;
  image: string;
  productCount: number;
  subcategories: Subcategory[];
}

export interface Subcategory {
  slug: string;
  name: string;
  productCount: number;
  parentCategory: string;
}

export interface SupplierImportConfig {
  supplierId: string;
  supplierName: string;
  importType: "api" | "csv" | "xml" | "json";
  apiEndpoint?: string;
  apiKey?: string;
  fileUrl?: string;
  mappings: FieldMapping[];
  priceMarkupPercent: number;
  defaultCategory?: string;
  enabled: boolean;
  lastSync?: string;
  syncFrequencyHours?: number;
}

export interface FieldMapping {
  sourceField: string;
  targetField: keyof Product;
  transform?: "none" | "lowercase" | "uppercase" | "number" | "boolean" | "cents";
}

// Product data store
class ProductStore {
  private products: Map<string, Product> = new Map();
  private categories: Map<string, Category> = new Map();
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    // In production, this would load from database or API
    this.initialized = true;
  }

  // Get all products
  async getProducts(filters?: {
    category?: string;
    subcategory?: string;
    search?: string;
    inStock?: boolean;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    sortBy?: "price-asc" | "price-desc" | "rating" | "newest" | "relevance";
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; total: number; page: number; totalPages: number }> {
    await this.initialize();
    
    let results = Array.from(this.products.values());
    
    // Apply filters
    if (filters?.category) {
      results = results.filter(p => p.category === filters.category);
    }
    if (filters?.subcategory) {
      results = results.filter(p => p.subcategory === filters.subcategory);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.brand?.toLowerCase().includes(searchLower)
      );
    }
    if (filters?.inStock !== undefined) {
      results = results.filter(p => p.inStock === filters.inStock);
    }
    if (filters?.minPrice !== undefined) {
      results = results.filter(p => p.priceCents >= filters.minPrice!);
    }
    if (filters?.maxPrice !== undefined) {
      results = results.filter(p => p.priceCents <= filters.maxPrice!);
    }
    if (filters?.brand) {
      results = results.filter(p => p.brand === filters.brand);
    }
    
    // Apply sorting
    switch (filters?.sortBy) {
      case "price-asc":
        results.sort((a, b) => a.priceCents - b.priceCents);
        break;
      case "price-desc":
        results.sort((a, b) => b.priceCents - a.priceCents);
        break;
      case "rating":
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        results.sort((a, b) => new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime());
        break;
    }
    
    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 24;
    const total = results.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedResults = results.slice(start, start + limit);
    
    return {
      products: paginatedResults,
      total,
      page,
      totalPages
    };
  }

  // Get single product by ID
  async getProduct(id: string): Promise<Product | null> {
    await this.initialize();
    return this.products.get(id) || null;
  }

  // Get categories with counts
  async getCategories(): Promise<Category[]> {
    await this.initialize();
    return Array.from(this.categories.values());
  }

  // Bulk import products
  async importProducts(products: Product[], options?: {
    upsert?: boolean;
    clearExisting?: boolean;
  }): Promise<{ imported: number; updated: number; errors: string[] }> {
    const errors: string[] = [];
    let imported = 0;
    let updated = 0;

    if (options?.clearExisting) {
      this.products.clear();
    }

    for (const product of products) {
      try {
        // Validate required fields
        if (!product.id || !product.name || !product.priceCents) {
          errors.push(`Invalid product: missing required fields (id, name, or priceCents)`);
          continue;
        }

        const exists = this.products.has(product.id);
        if (exists && !options?.upsert) {
          errors.push(`Product ${product.id} already exists`);
          continue;
        }

        this.products.set(product.id, {
          ...product,
          lastUpdated: new Date().toISOString()
        });

        if (exists) {
          updated++;
        } else {
          imported++;
        }
      } catch (err) {
        errors.push(`Error importing product ${product.id}: ${err}`);
      }
    }

    // Update category counts
    this.updateCategoryCounts();

    return { imported, updated, errors };
  }

  // Update category product counts
  private updateCategoryCounts() {
    const categoryCounts = new Map<string, number>();
    const subcategoryCounts = new Map<string, number>();

    for (const product of this.products.values()) {
      const cat = product.category;
      const subcat = product.subcategory;
      
      categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
      if (subcat) {
        subcategoryCounts.set(`${cat}:${subcat}`, (subcategoryCounts.get(`${cat}:${subcat}`) || 0) + 1);
      }
    }

    // Update category objects
    for (const category of this.categories.values()) {
      category.productCount = categoryCounts.get(category.slug) || 0;
      for (const subcat of category.subcategories) {
        subcat.productCount = subcategoryCounts.get(`${category.slug}:${subcat.slug}`) || 0;
      }
    }
  }

  // Parse CSV import
  async importFromCSV(csvContent: string, config: SupplierImportConfig): Promise<{ imported: number; errors: string[] }> {
    const lines = csvContent.split('\n');
    if (lines.length < 2) {
      return { imported: 0, errors: ['CSV file is empty or has no data rows'] };
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const products: Product[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: column count mismatch`);
        continue;
      }

      try {
        const rawData: Record<string, string> = {};
        headers.forEach((h, idx) => {
          rawData[h] = values[idx];
        });

        // Apply mappings
        const product: Partial<Product> = {
          id: `${config.supplierId}-${rawData['sku'] || rawData['id'] || i}`,
          supplierProductId: rawData['sku'] || rawData['id'],
        };

        for (const mapping of config.mappings) {
          const sourceValue = rawData[mapping.sourceField.toLowerCase()];
          if (sourceValue !== undefined) {
            let transformedValue: any = sourceValue;
            
            switch (mapping.transform) {
              case 'lowercase':
                transformedValue = sourceValue.toLowerCase();
                break;
              case 'uppercase':
                transformedValue = sourceValue.toUpperCase();
                break;
              case 'number':
                transformedValue = parseFloat(sourceValue) || 0;
                break;
              case 'boolean':
                transformedValue = sourceValue.toLowerCase() === 'true' || sourceValue === '1';
                break;
              case 'cents':
                transformedValue = Math.round(parseFloat(sourceValue) * 100) || 0;
                break;
            }
            
            (product as any)[mapping.targetField] = transformedValue;
          }
        }

        // Apply markup
        if (product.priceCents && config.priceMarkupPercent > 0) {
          product.priceCents = Math.round(product.priceCents * (1 + config.priceMarkupPercent / 100));
        }

        // Set defaults
        product.category = product.category || config.defaultCategory || 'uncategorized';
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

    const result = await this.importProducts(products, { upsert: true });
    return {
      imported: result.imported + result.updated,
      errors: [...errors, ...result.errors]
    };
  }
}

// Singleton instance
export const productStore = new ProductStore();

// API route handlers (for use with Next.js API routes)
export const productAPI = {
  async list(searchParams: URLSearchParams) {
    const filters = {
      category: searchParams.get('category') || undefined,
      subcategory: searchParams.get('subcategory') || undefined,
      search: searchParams.get('search') || undefined,
      inStock: searchParams.get('inStock') === 'true',
      minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
      brand: searchParams.get('brand') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 24,
    };
    
    return productStore.getProducts(filters);
  },
  
  async get(id: string) {
    return productStore.getProduct(id);
  },
  
  async categories() {
    return productStore.getCategories();
  },
  
  async import(data: any) {
    const { products, config } = data;
    if (config?.importType === 'csv') {
      return productStore.importFromCSV(products, config);
    }
    return productStore.importProducts(products, { upsert: true });
  }
};
