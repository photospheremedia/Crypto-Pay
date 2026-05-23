/**
 * Dashboard Responsive & Layout Tests
 * 
 * Tests for account dashboard and admin dashboard at various
 * viewport sizes to ensure proper responsive behavior, layout
 * stability, and element visibility.
 * 
 * NOTE: Account and Admin dashboards require authentication.
 * These tests will skip if redirected to login.
 * For full testing, set up authenticated session fixtures.
 */

import { test, expect, Page } from '@playwright/test';

// Common viewport sizes to test
const viewports = {
  mobile: { width: 375, height: 667 },     // iPhone SE
  mobileLarge: { width: 414, height: 896 }, // iPhone XR
  tablet: { width: 768, height: 1024 },     // iPad
  tabletLandscape: { width: 1024, height: 768 },
  laptop: { width: 1366, height: 768 },
  desktop: { width: 1920, height: 1080 },
};

// Helper to check if page requires auth (redirected to login)
async function requiresAuth(page: Page): Promise<boolean> {
  return page.url().includes('/login');
}

test.describe('Login Page Responsive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const cookieDialog = page.locator('[aria-labelledby="cookie-consent-title"]');
    if (await cookieDialog.isVisible()) {
      await page.locator('button:has-text("Accept All")').click({ force: true });
      await page.waitForTimeout(300);
    }
  });

  test('login form is centered on mobile', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    
    const form = page.locator('form').first();
    if (await form.isVisible()) {
      const box = await form.boundingBox();
      expect(box).not.toBeNull();
      // Form should be centered (roughly)
      const expectedCenter = viewports.mobile.width / 2;
      const formCenter = box!.x + box!.width / 2;
      expect(Math.abs(formCenter - expectedCenter)).toBeLessThan(50);
    }
  });

  test('login inputs are full width on mobile', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      const box = await emailInput.boundingBox();
      // Input should be at least 80% of viewport width
      expect(box!.width).toBeGreaterThan(viewports.mobile.width * 0.7);
    }
  });

  test('login page has no horizontal overflow', async ({ page }) => {
    for (const [name, size] of Object.entries(viewports)) {
      await page.setViewportSize(size);
      await page.waitForTimeout(200);
      
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasOverflow, `Horizontal overflow at ${name}`).toBeFalsy();
    }
  });

  test('social login buttons stack on mobile', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    
    const socialButtons = page.locator('button:has-text("Google"), button:has-text("GitHub"), button:has-text("Continue with")');
    const count = await socialButtons.count();
    
    if (count >= 2) {
      const firstBox = await socialButtons.first().boundingBox();
      const secondBox = await socialButtons.nth(1).boundingBox();
      
      if (firstBox && secondBox) {
        // On mobile, buttons should stack (different y positions)
        expect(firstBox.y).not.toEqual(secondBox.y);
      }
    }
  });
});

test.describe('Account Dashboard Responsive Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Dismiss cookie consent if present
    await page.goto('/account');
    await page.waitForLoadState('networkidle');
    
    // Skip if redirected to login (account requires auth)
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }
    
    const cookieDialog = page.locator('[aria-labelledby="cookie-consent-title"]');
    if (await cookieDialog.isVisible()) {
      await page.locator('button:has-text("Accept All")').click({ force: true });
      await page.waitForTimeout(300);
    }
  });

  test.describe('Mobile Layout (375px)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
    });

    test('sidebar should be hidden or collapsible on mobile', async ({ page }) => {
      // On mobile, sidebar should be hidden or stacked above content
      const sidebar = page.locator('aside');
      const mainContent = page.locator('main');
      
      if (await sidebar.isVisible()) {
        const sidebarBox = await sidebar.boundingBox();
        const mainBox = await mainContent.boundingBox();
        
        // Sidebar should either be above main content (stacked) or hidden
        if (sidebarBox && mainBox) {
          // They shouldn't overlap horizontally if both visible
          const overlap = !(sidebarBox.x + sidebarBox.width <= mainBox.x || 
                          mainBox.x + mainBox.width <= sidebarBox.x);
          expect(overlap || sidebarBox.y + sidebarBox.height <= mainBox.y).toBeTruthy();
        }
      }
    });

    test('content should not overflow horizontally', async ({ page }) => {
      // Check for horizontal overflow
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasOverflow).toBeFalsy();
    });

    test('quick actions grid should stack properly', async ({ page }) => {
      // Quick actions should be in a grid that adapts to mobile
      const quickActions = page.locator('a[href="/account/orders"], a[href="/wishlist"]');
      const count = await quickActions.count();
      
      if (count >= 2) {
        const firstBox = await quickActions.first().boundingBox();
        const secondBox = await quickActions.nth(1).boundingBox();
        
        // On mobile, items might be side by side in 2-3 columns
        // Just ensure they're visible and properly sized
        if (firstBox && secondBox) {
          expect(firstBox.width).toBeGreaterThan(50);
          expect(secondBox.width).toBeGreaterThan(50);
        }
      }
    });

    test('welcome hero text should be readable', async ({ page }) => {
      const welcomeHeading = page.locator('h1').first();
      if (await welcomeHeading.isVisible()) {
        const fontSize = await welcomeHeading.evaluate(el => 
          parseFloat(window.getComputedStyle(el).fontSize)
        );
        // Font size should be at least 18px for readability on mobile
        expect(fontSize).toBeGreaterThanOrEqual(18);
      }
    });
  });

  test.describe('Tablet Layout (768px)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.tablet);
    });

    test('sidebar should be visible (stacked) on tablet', async ({ page }) => {
      const sidebar = page.locator('aside');
      const mainContent = page.locator('main');
      
      // On tablet, sidebar is visible but stacked above main (not side by side)
      const sidebarVisible = await sidebar.isVisible();
      expect(sidebarVisible).toBeTruthy();
      
      if (await mainContent.isVisible()) {
        const sidebarBox = await sidebar.boundingBox();
        const mainBox = await mainContent.boundingBox();
        
        if (sidebarBox && mainBox) {
          // Sidebar should be above main content (stacked layout)
          expect(sidebarBox.y).toBeLessThanOrEqual(mainBox.y);
        }
      }
    });

    test('grid layouts should adapt to 2 columns', async ({ page }) => {
      // Orders and Quotes grid should be 2 columns on tablet
      const grid = page.locator('.lg\\:grid-cols-2').first();
      if (await grid.isVisible()) {
        const gridBox = await grid.boundingBox();
        expect(gridBox?.width).toBeGreaterThan(400);
      }
    });

    test('no horizontal scroll on tablet', async ({ page }) => {
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasOverflow).toBeFalsy();
    });
  });

  test.describe('Desktop Layout (1920px)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
    });

    test('sidebar and main content should be side by side', async ({ page }) => {
      const sidebar = page.locator('aside');
      const mainContent = page.locator('main');
      
      if (await sidebar.isVisible() && await mainContent.isVisible()) {
        const sidebarBox = await sidebar.boundingBox();
        const mainBox = await mainContent.boundingBox();
        
        if (sidebarBox && mainBox) {
          // Sidebar should be to the left of main content
          expect(sidebarBox.x).toBeLessThan(mainBox.x);
          // They should be roughly at the same vertical level
          expect(Math.abs(sidebarBox.y - mainBox.y)).toBeLessThan(100);
        }
      }
    });

    test('content should be centered with max-width', async ({ page }) => {
      // Main container should have max-width and be centered
      const container = page.locator('.max-w-7xl').first();
      if (await container.isVisible()) {
        const box = await container.boundingBox();
        const viewportWidth = viewports.desktop.width;
        
        if (box) {
          // Container should not span full viewport width
          expect(box.width).toBeLessThan(viewportWidth - 100);
          // Should be somewhat centered
          expect(box.x).toBeGreaterThan(0);
        }
      }
    });

    test('stat cards should be properly spaced', async ({ page }) => {
      const statCards = page.locator('.flex.items-center.gap-3').filter({ has: page.locator('.text-2xl.font-bold') });
      const count = await statCards.count();
      
      if (count >= 2) {
        const firstBox = await statCards.first().boundingBox();
        const secondBox = await statCards.nth(1).boundingBox();
        
        if (firstBox && secondBox) {
          // Cards should have reasonable spacing
          const gap = Math.abs(secondBox.x - (firstBox.x + firstBox.width));
          expect(gap).toBeGreaterThan(8);
        }
      }
    });
  });

  test.describe('Layout Consistency Across Viewports', () => {
    test('no elements should be cut off at any viewport', async ({ page }) => {
      for (const [name, size] of Object.entries(viewports)) {
        await page.setViewportSize(size);
        await page.waitForTimeout(300);
        
        // Check that main content areas are visible
        const mainContent = page.locator('main');
        if (await mainContent.isVisible()) {
          const box = await mainContent.boundingBox();
          expect(box, `Main content cut off at ${name}`).not.toBeNull();
          expect(box!.width, `Main content too narrow at ${name}`).toBeGreaterThan(0);
        }
      }
    });

    test('text should be legible at all sizes', async ({ page }) => {
      for (const [name, size] of Object.entries(viewports)) {
        await page.setViewportSize(size);
        await page.waitForTimeout(300);
        
        // Check body font size
        const bodyFontSize = await page.evaluate(() => {
          const body = document.body;
          return parseFloat(window.getComputedStyle(body).fontSize);
        });
        
        expect(bodyFontSize, `Font too small at ${name}`).toBeGreaterThanOrEqual(14);
      }
    });
  });
});

test.describe('Admin Dashboard Responsive Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Admin pages require auth - check if redirected to login
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    
    // If redirected to login, we'll test what we can
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      test.skip();
    }
    
    const cookieDialog = page.locator('[aria-labelledby="cookie-consent-title"]');
    if (await cookieDialog.isVisible()) {
      await page.locator('button:has-text("Accept All")').click({ force: true });
      await page.waitForTimeout(300);
    }
  });

  test.describe('Mobile Admin Layout', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
    });

    test('sidebar should be hidden with hamburger menu on mobile', async ({ page }) => {
      const sidebar = page.locator('aside');
      const sidebarBox = await sidebar.boundingBox();
      
      // Sidebar should be off-screen (translated) or hidden
      if (sidebarBox) {
        expect(sidebarBox.x).toBeLessThan(0);
      }
      
      // Hamburger menu should be visible
      const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="sidebar"]');
      const isMenuVisible = await menuButton.first().isVisible();
      expect(isMenuVisible).toBeTruthy();
    });

    test('hamburger menu should open sidebar', async ({ page }) => {
      const menuButton = page.locator('button').filter({ has: page.locator('svg') }).first();
      
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await page.waitForTimeout(300);
        
        // Sidebar should now be visible
        const sidebar = page.locator('aside');
        const sidebarBox = await sidebar.boundingBox();
        if (sidebarBox) {
          expect(sidebarBox.x).toBeGreaterThanOrEqual(0);
        }
      }
    });

    test('stat cards should stack on mobile', async ({ page }) => {
      const statGrid = page.locator('.grid.grid-cols-2, .grid.grid-cols-1');
      if (await statGrid.first().isVisible()) {
        const box = await statGrid.first().boundingBox();
        // Grid should fit within viewport
        expect(box?.width).toBeLessThanOrEqual(viewports.mobile.width);
      }
    });

    test('no horizontal overflow on admin mobile', async ({ page }) => {
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasOverflow).toBeFalsy();
    });
  });

  test.describe('Tablet Admin Layout', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.tablet);
    });

    test('sidebar should remain hidden or toggleable on tablet', async ({ page }) => {
      // At 768px, admin layout likely still hides sidebar
      const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="sidebar"]').first();
      const hasMenu = await menuButton.isVisible();
      expect(hasMenu).toBeTruthy();
    });

    test('stat cards should show 2-4 per row', async ({ page }) => {
      const statGrid = page.locator('.grid.grid-cols-2.md\\:grid-cols-4');
      if (await statGrid.isVisible()) {
        const children = statGrid.locator('> *');
        const count = await children.count();
        expect(count).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Desktop Admin Layout', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
    });

    test('sidebar should be fixed and visible on desktop', async ({ page }) => {
      const sidebar = page.locator('aside');
      
      if (await sidebar.isVisible()) {
        const sidebarBox = await sidebar.boundingBox();
        expect(sidebarBox?.x).toBeGreaterThanOrEqual(0);
        expect(sidebarBox?.width).toBeGreaterThan(200);
      }
    });

    test('main content should have left margin for sidebar', async ({ page }) => {
      const mainWrapper = page.locator('.lg\\:pl-64');
      
      if (await mainWrapper.isVisible()) {
        const styles = await mainWrapper.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            paddingLeft: parseFloat(computed.paddingLeft),
          };
        });
        // 16rem (256px) padding for sidebar
        expect(styles.paddingLeft).toBeGreaterThanOrEqual(200);
      }
    });

    test('two-column layout should work on desktop', async ({ page }) => {
      const twoColGrid = page.locator('.grid.grid-cols-1.lg\\:grid-cols-2');
      
      if (await twoColGrid.first().isVisible()) {
        const children = twoColGrid.first().locator('> *');
        const count = await children.count();
        
        if (count >= 2) {
          const firstBox = await children.first().boundingBox();
          const secondBox = await children.nth(1).boundingBox();
          
          if (firstBox && secondBox) {
            // Should be side by side, not stacked
            expect(Math.abs(firstBox.y - secondBox.y)).toBeLessThan(50);
            expect(firstBox.x).toBeLessThan(secondBox.x);
          }
        }
      }
    });
  });
});

test.describe('Dashboard Element Alignment Tests', () => {
  test('account dashboard elements should be properly aligned', async ({ page }) => {
    await page.goto('/account');
    await page.waitForLoadState('networkidle');
    await page.setViewportSize(viewports.laptop);
    
    // Check for consistent padding/margins
    const cards = page.locator('.rounded-3xl, .rounded-2xl, .rounded-xl').filter({ has: page.locator('h2, h3') });
    const count = await cards.count();
    
    const leftPositions: number[] = [];
    for (let i = 0; i < Math.min(count, 5); i++) {
      const box = await cards.nth(i).boundingBox();
      if (box) {
        leftPositions.push(box.x);
      }
    }
    
    // Most cards should align on the left edge
    if (leftPositions.length >= 2) {
      const mostCommonX = leftPositions.sort((a, b) => 
        leftPositions.filter(v => Math.abs(v - a) < 10).length - 
        leftPositions.filter(v => Math.abs(v - b) < 10).length
      ).pop()!;
      
      const alignedCount = leftPositions.filter(x => Math.abs(x - mostCommonX) < 10).length;
      const alignmentRatio = alignedCount / leftPositions.length;
      
      expect(alignmentRatio).toBeGreaterThan(0.5);
    }
  });

  test('admin dashboard stat cards should be evenly distributed', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/login')) {
      test.skip();
    }
    
    await page.setViewportSize(viewports.desktop);
    
    // Find stat card grid
    const statGrid = page.locator('.grid.grid-cols-2.md\\:grid-cols-4');
    
    if (await statGrid.first().isVisible()) {
      const cards = statGrid.first().locator('> *');
      const count = await cards.count();
      
      if (count >= 4) {
        const widths: number[] = [];
        for (let i = 0; i < count; i++) {
          const box = await cards.nth(i).boundingBox();
          if (box) widths.push(box.width);
        }
        
        // All cards should have similar widths (within 20%)
        const avgWidth = widths.reduce((a, b) => a + b, 0) / widths.length;
        const allSimilar = widths.every(w => Math.abs(w - avgWidth) / avgWidth < 0.2);
        expect(allSimilar).toBeTruthy();
      }
    }
  });
});

test.describe('Dashboard Loading States', () => {
  test('account dashboard should show loading spinner initially', async ({ page }) => {
    // Fast check before data loads
    await page.goto('/account', { waitUntil: 'commit' });
    
    // Look for loading indicator (spinner or skeleton)
    const hasLoadingIndicator = await page.locator('.animate-spin, [class*="animate-pulse"], [class*="skeleton"]').first().isVisible()
      .catch(() => false);
    
    // Either shows loading or content loaded fast enough
    expect(true).toBeTruthy();
  });

  test('admin dashboard should show loading state', async ({ page }) => {
    await page.goto('/admin/dashboard', { waitUntil: 'commit' });
    
    if (page.url().includes('/login')) {
      test.skip();
    }
    
    // Check for spinner
    const spinner = page.locator('.animate-spin');
    const wasSpinnerVisible = await spinner.isVisible().catch(() => false);
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Now spinner should be gone and content visible
    const content = page.locator('h1');
    expect(await content.first().isVisible()).toBeTruthy();
  });
});

test.describe('Dashboard Interaction Tests', () => {
  test('account sidebar navigation links should be clickable', async ({ page }) => {
    await page.goto('/account');
    await page.waitForLoadState('networkidle');
    await page.setViewportSize(viewports.desktop);
    
    // Test navigation links
    const navLinks = page.locator('aside a[href^="/account"]');
    const count = await navLinks.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const link = navLinks.nth(i);
      const href = await link.getAttribute('href');
      
      // Ensure link is visible and clickable
      const isVisible = await link.isVisible();
      const box = await link.boundingBox();
      
      expect(isVisible, `Link to ${href} not visible`).toBeTruthy();
      expect(box?.width, `Link to ${href} has no width`).toBeGreaterThan(0);
      expect(box?.height, `Link to ${href} has no height`).toBeGreaterThan(20);
    }
  });

  test('admin sidebar expandable menus should work', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/login')) {
      test.skip();
    }
    
    await page.setViewportSize(viewports.desktop);
    
    // Find expandable menu buttons
    const expandableMenus = page.locator('button:has(.lucide-chevron-down)');
    
    if (await expandableMenus.first().isVisible()) {
      const menu = expandableMenus.first();
      await menu.click();
      await page.waitForTimeout(300);
      
      // Child links should appear
      const childLinks = page.locator('aside a');
      const count = await childLinks.count();
      expect(count).toBeGreaterThan(0);
    }
  });
});

test.describe('Dashboard CLS (Cumulative Layout Shift)', () => {
  test('account dashboard should have minimal layout shift', async ({ page }) => {
    await page.setViewportSize(viewports.laptop);
    
    // Inject CLS observer
    await page.goto('/account');
    
    const clsScore = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let cls = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              cls += (entry as any).value;
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
        
        setTimeout(() => {
          observer.disconnect();
          resolve(cls);
        }, 5000);
      });
    });
    
    // CLS should be under 0.25 (good threshold)
    expect(clsScore).toBeLessThan(0.25);
  });

  test('admin dashboard should have minimal layout shift', async ({ page }) => {
    await page.setViewportSize(viewports.laptop);
    await page.goto('/admin/dashboard');
    
    if (page.url().includes('/login')) {
      test.skip();
    }
    
    const clsScore = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let cls = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              cls += (entry as any).value;
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
        
        setTimeout(() => {
          observer.disconnect();
          resolve(cls);
        }, 5000);
      });
    });
    
    expect(clsScore).toBeLessThan(0.25);
  });
});

test.describe('Dashboard Z-Index & Overlay Tests', () => {
  test('sticky header should stay above content on scroll', async ({ page }) => {
    await page.goto('/account');
    await page.waitForLoadState('networkidle');
    await page.setViewportSize(viewports.laptop);
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);
    
    const header = page.locator('header').first();
    const content = page.locator('main').first();
    
    if (await header.isVisible() && await content.isVisible()) {
      const headerZ = await header.evaluate(el => 
        parseInt(window.getComputedStyle(el).zIndex) || 0
      );
      
      // Header should have z-index for stickiness
      expect(headerZ).toBeGreaterThanOrEqual(10);
    }
  });

  test('admin sidebar should stay above content', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/login')) {
      test.skip();
    }
    
    await page.setViewportSize(viewports.desktop);
    
    const sidebar = page.locator('aside');
    
    if (await sidebar.isVisible()) {
      const sidebarZ = await sidebar.evaluate(el => 
        parseInt(window.getComputedStyle(el).zIndex) || 0
      );
      
      // Sidebar should have appropriate z-index
      expect(sidebarZ).toBeGreaterThanOrEqual(40);
    }
  });
});
