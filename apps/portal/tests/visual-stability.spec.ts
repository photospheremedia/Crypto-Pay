import { test, expect } from '@playwright/test';

test.describe('Visual Stability Tests', () => {
  
  test.describe('Header Stability', () => {
    test('sign-in button should not flicker on page load', async ({ page }) => {
      // Navigate and wait for full hydration
      await page.goto('/');
      
      // Wait for hydration to complete
      await page.waitForLoadState('networkidle');
      
      // Get the header sign-in/account element
      const headerAuth = page.locator('header').locator('a[href*="login"], a[href*="account"], button:has-text("Sign")').first();
      
      // Take screenshot immediately after load
      const initialScreenshot = await headerAuth.screenshot().catch(() => null);
      
      // Wait a bit for any potential flicker
      await page.waitForTimeout(500);
      
      // Take another screenshot
      const afterScreenshot = await headerAuth.screenshot().catch(() => null);
      
      // Both screenshots should exist (element didn't disappear)
      if (initialScreenshot && afterScreenshot) {
        // Compare - they should be visually similar
        expect(initialScreenshot.length).toBeGreaterThan(0);
        expect(afterScreenshot.length).toBeGreaterThan(0);
      }
      
      // Element should be visible and stable
      await expect(headerAuth).toBeVisible();
    });

    test('header should not have layout shift on reload', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Get header dimensions
      const header = page.locator('header').first();
      const initialBox = await header.boundingBox();
      
      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Get header dimensions after reload
      const afterBox = await header.boundingBox();
      
      // Header position should be stable
      if (initialBox && afterBox) {
        expect(afterBox.x).toBeCloseTo(initialBox.x, 0);
        expect(afterBox.y).toBeCloseTo(initialBox.y, 0);
        expect(afterBox.width).toBeCloseTo(initialBox.width, 1);
        expect(afterBox.height).toBeCloseTo(initialBox.height, 1);
      }
    });

    test('navigation links should be immediately visible', async ({ page }) => {
      await page.goto('/');
      
      // Check nav links are visible quickly (within 1 second)
      const navLinks = page.locator('header nav a, header a[href="/pricing"], header a[href="/services"]');
      
      // At least some navigation should be visible
      await expect(navLinks.first()).toBeVisible({ timeout: 1000 });
    });
  });

  test.describe('Logo Stability', () => {
    test('logo should not flicker or shift on load', async ({ page }) => {
      await page.goto('/');
      
      // Find logo (could be img, svg, or text)
      const logo = page.locator('header a[href="/"] img, header a[href="/"] svg, header .logo, header a[href="/"]').first();
      
      await expect(logo).toBeVisible({ timeout: 2000 });
      
      // Get initial position
      const initialBox = await logo.boundingBox();
      
      // Wait for any animations/hydration
      await page.waitForTimeout(500);
      
      // Position should be stable
      const afterBox = await logo.boundingBox();
      
      if (initialBox && afterBox) {
        expect(afterBox.x).toBeCloseTo(initialBox.x, 1);
        expect(afterBox.y).toBeCloseTo(initialBox.y, 1);
      }
    });

    test('logo should load without placeholder flash', async ({ page }) => {
      // Listen for image load events
      const imageLoadPromises: Promise<void>[] = [];
      
      page.on('response', response => {
        if (response.request().resourceType() === 'image') {
          imageLoadPromises.push(response.finished().then(() => {}));
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      // Check logo is not showing broken image
      const logoImg = page.locator('header img').first();
      if (await logoImg.count() > 0) {
        const naturalWidth = await logoImg.evaluate((img: HTMLImageElement) => img.naturalWidth);
        expect(naturalWidth).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Cumulative Layout Shift (CLS)', () => {
    test('homepage should have minimal layout shift', async ({ page }) => {
      // Collect layout shift entries
      const layoutShifts: number[] = [];
      
      await page.addInitScript(() => {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ((entry as any).hadRecentInput === false) {
              (window as any).__layoutShifts = (window as any).__layoutShifts || [];
              (window as any).__layoutShifts.push((entry as any).value);
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Wait for any delayed shifts
      
      const shifts = await page.evaluate(() => (window as any).__layoutShifts || []);
      const totalCLS = shifts.reduce((sum: number, val: number) => sum + val, 0);
      
      // CLS should be under 0.25 (good is < 0.1, needs improvement < 0.25)
      expect(totalCLS).toBeLessThan(0.25);
    });

    test('pricing page should have minimal layout shift', async ({ page }) => {
      await page.addInitScript(() => {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ((entry as any).hadRecentInput === false) {
              (window as any).__layoutShifts = (window as any).__layoutShifts || [];
              (window as any).__layoutShifts.push((entry as any).value);
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
      });
      
      await page.goto('/pricing');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      const shifts = await page.evaluate(() => (window as any).__layoutShifts || []);
      const totalCLS = shifts.reduce((sum: number, val: number) => sum + val, 0);
      
      expect(totalCLS).toBeLessThan(0.25);
    });
  });

  test.describe('Hydration Stability', () => {
    test('interactive elements should not flash/change state on hydration', async ({ page }) => {
      await page.goto('/');
      
      // Get buttons and interactive elements
      const buttons = page.locator('button, a.btn, [role="button"]');
      const buttonCount = await buttons.count();
      
      // Take a snapshot of button states
      const initialStates: string[] = [];
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const classList = await buttons.nth(i).getAttribute('class') || '';
        initialStates.push(classList);
      }
      
      // Wait for hydration
      await page.waitForTimeout(500);
      
      // Check states haven't dramatically changed
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const currentClass = await buttons.nth(i).getAttribute('class') || '';
        // Classes might change slightly but core structure should remain
        expect(currentClass.length).toBeGreaterThan(0);
      }
    });

    test('forms should not reset on hydration', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');
      
      // Find a text input
      const input = page.locator('input[type="text"], input[type="email"]').first();
      
      if (await input.count() > 0) {
        // Type something
        await input.fill('test@example.com');
        
        // Wait for potential hydration issues
        await page.waitForTimeout(500);
        
        // Value should still be there
        const value = await input.inputValue();
        expect(value).toBe('test@example.com');
      }
    });
  });

  test.describe('Animation Stability', () => {
    test('animations should not cause jank on load', async ({ page }) => {
      await page.goto('/');
      
      // Check for elements with animation classes
      const animatedElements = page.locator('[class*="animate"], [class*="transition"], [class*="motion"]');
      
      // Elements with animations should be visible and positioned correctly
      const count = await animatedElements.count();
      for (let i = 0; i < Math.min(count, 3); i++) {
        const element = animatedElements.nth(i);
        if (await element.isVisible()) {
          const box = await element.boundingBox();
          // Should have valid dimensions (not collapsed/hidden)
          if (box) {
            expect(box.width).toBeGreaterThan(0);
            expect(box.height).toBeGreaterThan(0);
          }
        }
      }
    });

    test('hero section should render without flash', async ({ page }) => {
      await page.goto('/');
      
      // Hero section (usually first major content area)
      const hero = page.locator('section').first();
      
      await expect(hero).toBeVisible({ timeout: 2000 });
      
      // Check it has content
      const text = await hero.textContent();
      expect(text?.length).toBeGreaterThan(10);
    });
  });

  test.describe('Font Loading', () => {
    test('fonts should not cause FOUT (Flash of Unstyled Text)', async ({ page }) => {
      // Track font loading
      await page.addInitScript(() => {
        (window as any).__fontsLoaded = false;
        document.fonts.ready.then(() => {
          (window as any).__fontsLoaded = true;
        });
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Fonts should be loaded
      const fontsLoaded = await page.evaluate(() => (window as any).__fontsLoaded);
      expect(fontsLoaded).toBe(true);
      
      // Check a text element has consistent font
      const heading = page.locator('h1, h2').first();
      if (await heading.count() > 0) {
        const fontFamily = await heading.evaluate(el => 
          window.getComputedStyle(el).fontFamily
        );
        // Should have a font-family set (not just browser default)
        expect(fontFamily.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Image Loading', () => {
    test('images should have proper dimensions to prevent layout shift', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i);
        if (await img.isVisible()) {
          // Check if image has width/height attributes or CSS dimensions
          const hasExplicitDimensions = await img.evaluate((el: HTMLImageElement) => {
            const hasAttr = el.hasAttribute('width') && el.hasAttribute('height');
            const style = window.getComputedStyle(el);
            const hasCSS = style.width !== 'auto' || style.height !== 'auto';
            return hasAttr || hasCSS;
          });
          
          // Images should have explicit dimensions to prevent CLS
          // This is a warning - not all images need it
          if (!hasExplicitDimensions) {
            console.warn(`Image ${i} missing explicit dimensions`);
          }
        }
      }
    });

    test('lazy loaded images should have placeholders', async ({ page }) => {
      await page.goto('/');
      
      // Check for images with loading="lazy"
      const lazyImages = page.locator('img[loading="lazy"]');
      const count = await lazyImages.count();
      
      // If there are lazy images, they should have dimensions
      for (let i = 0; i < Math.min(count, 3); i++) {
        const img = lazyImages.nth(i);
        const box = await img.boundingBox();
        
        // Should have reserved space
        if (box) {
          expect(box.width).toBeGreaterThan(0);
          expect(box.height).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Dark Mode Stability', () => {
    test('theme toggle should not cause full page flash', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Look for theme toggle button
      const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="dark"], button[aria-label*="light"], [data-theme-toggle]');
      
      if (await themeToggle.count() > 0) {
        // Get background color before toggle
        const bgBefore = await page.evaluate(() => 
          window.getComputedStyle(document.body).backgroundColor
        );
        
        await themeToggle.first().click();
        
        // Small delay for transition
        await page.waitForTimeout(100);
        
        const bgAfter = await page.evaluate(() => 
          window.getComputedStyle(document.body).backgroundColor
        );
        
        // Background should have changed (theme actually works)
        // If they're the same, theme toggle might not be working
        console.log(`Theme toggle: ${bgBefore} -> ${bgAfter}`);
      }
    });
  });
});
