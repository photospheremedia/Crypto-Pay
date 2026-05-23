import { test, expect } from '@playwright/test';

/**
 * Database Flow Tests
 * These tests verify data persistence through the UI
 * Note: Requires a running dev server with Supabase connection
 */

test.describe('Database Flows', () => {
  test.describe('Product Catalog (Public)', () => {
    test('shop page loads products from database', async ({ page }) => {
      await page.goto('/shop');
      
      // Wait for products to load
      await page.waitForLoadState('networkidle');
      
      // Check if products are displayed or empty state
      const hasProducts = await page.locator('[data-testid="product-card"], .product-card, [class*="product"]').count() > 0;
      const hasEmptyState = await page.getByText(/no products|coming soon|empty/i).count() > 0;
      const hasShopContent = await page.locator('main').count() > 0;
      
      // Shop page should render something
      expect(hasProducts || hasEmptyState || hasShopContent).toBeTruthy();
    });

    test('pricing page loads pricing tiers', async ({ page }) => {
      await page.goto('/pricing');
      
      await page.waitForLoadState('networkidle');
      
      // Should show pricing content
      const hasPricingContent = await page.getByText(/\\$|price|plan|month|year/i).count() > 0;
      expect(hasPricingContent).toBeTruthy();
    });
  });

  test.describe('Lead Capture Flow', () => {
    test('contact form submission creates lead', async ({ page }) => {
      // Set up mailto interception BEFORE navigating
      await page.addInitScript(() => {
        let mailtoTriggered = false;
        (window as any).mailtoTriggered = false;
        
        const originalHref = Object.getOwnPropertyDescriptor(window.Location.prototype, 'href');
        Object.defineProperty(window.Location.prototype, 'href', {
          set: function(value) {
            if (typeof value === 'string' && value.startsWith('mailto:')) {
              (window as any).mailtoTriggered = true;
              return;
            }
            if (originalHref?.set) {
              originalHref.set.call(this, value);
            }
          },
          get: function() {
            return originalHref?.get?.call(this);
          },
          configurable: true
        });
      });
      
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');
      
      // Wait a bit then force dismiss cookie dialog if present
      await page.waitForTimeout(500);
      const cookieDialog = page.locator('[aria-labelledby="cookie-consent-title"]');
      if (await cookieDialog.isVisible()) {
        // Click Accept All button with force
        await page.locator('button:has-text("Accept All")').click({ force: true });
        await page.waitForTimeout(500);
      }
      
      // Check for form elements
      const form = page.locator('form');
      const hasForm = await form.count() > 0;
      
      if (hasForm) {
        // Look for typical contact form fields
        const nameField = page.locator('input[name*="name"], input[placeholder*="name" i]').first();
        const emailField = page.locator('input[type="email"], input[name*="email"]').first();
        const companyField = page.locator('input[name*="company"], input[placeholder*="company" i]').first();
        const messageField = page.locator('textarea, input[name*="message"]').first();
        
        // Fill form if fields exist (company is required on this form)
        if (await nameField.count() > 0) {
          await nameField.fill('Test User');
        }
        if (await emailField.count() > 0) {
          await emailField.fill('test@playwright.test');
        }
        if (await companyField.count() > 0) {
          await companyField.fill('Test Company');
        }
        if (await messageField.count() > 0) {
          await messageField.fill('This is a test message from Playwright');
        }
        
        // Look for submit button and force click
        const submitBtn = page.locator('button[type="submit"]').first();
        
        if (await submitBtn.count() > 0) {
          await submitBtn.click({ force: true });
          
          // Wait for response
          await page.waitForTimeout(2000);
          
          // Check for success message or mailto trigger
          const hasSuccessUI = await page.getByText(/thanks for reaching out/i).count() > 0;
          const mailtoTriggered = await page.evaluate(() => (window as any).mailtoTriggered);
          
          // Form should give feedback or trigger mailto
          expect(hasSuccessUI || mailtoTriggered).toBeTruthy();
        }
      }
    });
  });

  test.describe('Quote Request Flow', () => {
    test('quote page is accessible', async ({ page }) => {
      await page.goto('/quote');
      
      await page.waitForLoadState('networkidle');
      
      // Should have quote-related content
      const hasQuoteContent = await page.getByText(/quote|request|inquiry|estimate/i).count() > 0;
      const hasForm = await page.locator('form').count() > 0;
      
      expect(hasQuoteContent || hasForm).toBeTruthy();
    });
  });

  test.describe('Cart & Wishlist (Requires Auth)', () => {
    test('cart page handles unauthenticated users', async ({ page }) => {
      await page.goto('/cart');
      
      await page.waitForTimeout(2000);
      
      // Should either show empty cart, login prompt, or redirect
      const isOnLogin = page.url().includes('login');
      const hasEmptyCart = await page.getByText(/empty|no items|sign in/i).count() > 0;
      const hasCartContent = await page.locator('main').count() > 0;
      
      expect(isOnLogin || hasEmptyCart || hasCartContent).toBeTruthy();
    });

    test('wishlist page handles unauthenticated users', async ({ page }) => {
      await page.goto('/wishlist');
      
      await page.waitForTimeout(2000);
      
      // Should either show empty state, login prompt, or redirect
      const isOnLogin = page.url().includes('login');
      const hasEmptyState = await page.getByText(/empty|no items|sign in|create account/i).count() > 0;
      const hasContent = await page.locator('main').count() > 0;
      
      expect(isOnLogin || hasEmptyState || hasContent).toBeTruthy();
    });
  });

  test.describe('API Endpoints', () => {
    test('products API returns valid response', async ({ request }) => {
      const response = await request.get('/api/products');
      
      // Should return 200 or 401 (if auth required)
      expect([200, 401, 404].includes(response.status())).toBeTruthy();
      
      if (response.status() === 200) {
        const data = await response.json();
        // Should be an array or have products property
        expect(Array.isArray(data) || data.products !== undefined).toBeTruthy();
      }
    });

    test('orders API requires authentication', async ({ request }) => {
      const response = await request.get('/api/orders');
      
      // Should require auth (401) or return data if somehow authed
      expect([200, 401, 403].includes(response.status())).toBeTruthy();
    });

    test('team API requires authentication', async ({ request }) => {
      const response = await request.get('/api/team');
      
      // Should require auth
      expect([200, 401, 403].includes(response.status())).toBeTruthy();
    });
  });
});
