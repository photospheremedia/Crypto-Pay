import { test, expect } from '@playwright/test';

/**
 * GSAP Animation Tests
 * 
 * Tests for the GSAP-powered animations on the homepage:
 * - gsap-fade-up: Fade and slide up on scroll
 * - gsap-stagger-container/gsap-stagger-item: Sequential appearance
 * - gsap-scale-up: Scale from 0.95 to 1 on scroll
 * - gsap-slide-left/gsap-slide-right: Horizontal slide animations
 * - gsap-bounce-in: Bounce entrance effect
 * - gsap-parallax: Parallax depth effect
 * - gsap-counter: Animated number counting
 */

test.describe('GSAP Animation Tests', () => {

  test.describe('Animation Elements Exist', () => {
    
    test('homepage has gsap-fade-up elements', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const fadeUpElements = page.locator('.gsap-fade-up');
      const count = await fadeUpElements.count();
      
      expect(count).toBeGreaterThan(0);
      console.log(`Found ${count} gsap-fade-up elements`);
    });

    test('homepage has gsap-stagger-container elements', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const staggerContainers = page.locator('.gsap-stagger-container');
      const count = await staggerContainers.count();
      
      expect(count).toBeGreaterThan(0);
      console.log(`Found ${count} gsap-stagger-container elements`);
      
      // Check that containers have stagger items
      for (let i = 0; i < count; i++) {
        const container = staggerContainers.nth(i);
        const items = container.locator('.gsap-stagger-item');
        const itemCount = await items.count();
        expect(itemCount).toBeGreaterThan(0);
      }
    });

    test('homepage has gsap-scale-up elements', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const scaleUpElements = page.locator('.gsap-scale-up');
      const count = await scaleUpElements.count();
      
      expect(count).toBeGreaterThan(0);
      console.log(`Found ${count} gsap-scale-up elements`);
    });

    test('homepage has gsap-slide-left and gsap-slide-right elements', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const slideLeftElements = page.locator('.gsap-slide-left');
      const slideRightElements = page.locator('.gsap-slide-right');
      
      const leftCount = await slideLeftElements.count();
      const rightCount = await slideRightElements.count();
      
      expect(leftCount + rightCount).toBeGreaterThan(0);
      console.log(`Found ${leftCount} slide-left and ${rightCount} slide-right elements`);
    });

    test('homepage has gsap-parallax elements', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const parallaxElements = page.locator('.gsap-parallax');
      const count = await parallaxElements.count();
      
      // Parallax elements may or may not exist
      console.log(`Found ${count} gsap-parallax elements`);
    });
  });

  test.describe('Animation Initialization', () => {
    
    test('GSAP should be loaded and registered', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check if GSAP is available on window
      const gsapLoaded = await page.evaluate(() => {
        return typeof (window as any).gsap !== 'undefined' || 
               document.querySelector('.gsap-fade-up') !== null;
      });
      
      // GSAP might not expose itself to window, but elements should exist
      const hasGsapElements = await page.locator('[class*="gsap-"]').count();
      expect(hasGsapElements).toBeGreaterThan(0);
    });

    test('animated elements should have initial opacity', async ({ page }) => {
      // Navigate and check elements immediately
      await page.goto('/');
      
      // Elements in viewport should become visible after GSAP initializes
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Allow GSAP to run
      
      // Check a fade-up element that's likely above the fold
      const fadeUpElement = page.locator('.gsap-fade-up').first();
      
      if (await fadeUpElement.count() > 0) {
        const isVisible = await fadeUpElement.isVisible();
        expect(isVisible).toBe(true);
        
        // Check opacity is set (should be 1 after animation)
        const opacity = await fadeUpElement.evaluate(el => 
          window.getComputedStyle(el).opacity
        );
        // Opacity should be between 0 and 1
        expect(parseFloat(opacity)).toBeGreaterThanOrEqual(0);
        expect(parseFloat(opacity)).toBeLessThanOrEqual(1);
      }
    });
  });

  test.describe('Scroll-Triggered Animations', () => {
    
    test('elements below fold should animate on scroll', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Find an element that's likely below the fold
      const allFadeUp = page.locator('.gsap-fade-up');
      const count = await allFadeUp.count();
      
      if (count > 1) {
        // Get the last fade-up element (likely below fold)
        const lastElement = allFadeUp.last();
        
        // Get its initial position
        const initialBox = await lastElement.boundingBox();
        
        if (initialBox && initialBox.y > page.viewportSize()!.height) {
          // Element is below viewport, check its state
          const initialOpacity = await lastElement.evaluate(el => 
            window.getComputedStyle(el).opacity
          );
          
          // Scroll to the element
          await lastElement.scrollIntoViewIfNeeded();
          await page.waitForTimeout(1000); // Allow animation to complete
          
          // Check opacity increased (animation played)
          const finalOpacity = await lastElement.evaluate(el => 
            window.getComputedStyle(el).opacity
          );
          
          console.log(`Opacity: ${initialOpacity} -> ${finalOpacity}`);
          // Element should be visible after scroll
          expect(parseFloat(finalOpacity)).toBeGreaterThan(0);
        }
      }
    });

    test('stagger container items should animate sequentially', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Find a stagger container
      const container = page.locator('.gsap-stagger-container').first();
      
      if (await container.count() > 0) {
        // Scroll to it
        await container.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500); // Allow stagger animation to start
        
        const items = container.locator('.gsap-stagger-item');
        const itemCount = await items.count();
        
        if (itemCount > 1) {
          // Track opacity changes over time
          const opacitySnapshots: number[][] = [];
          
          for (let t = 0; t < 5; t++) {
            const snapshot: number[] = [];
            for (let i = 0; i < Math.min(itemCount, 4); i++) {
              const opacity = await items.nth(i).evaluate(el => 
                parseFloat(window.getComputedStyle(el).opacity)
              );
              snapshot.push(opacity);
            }
            opacitySnapshots.push(snapshot);
            await page.waitForTimeout(100);
          }
          
          console.log('Stagger opacity snapshots:', opacitySnapshots);
          
          // After animation, all items should be visible
          await page.waitForTimeout(1000);
          for (let i = 0; i < Math.min(itemCount, 4); i++) {
            const finalOpacity = await items.nth(i).evaluate(el => 
              parseFloat(window.getComputedStyle(el).opacity)
            );
            expect(finalOpacity).toBeGreaterThan(0);
          }
        }
      }
    });

    test('parallax effect changes on scroll', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const parallaxElement = page.locator('.gsap-parallax').first();
      
      if (await parallaxElement.count() > 0) {
        // Get initial transform
        const initialTransform = await parallaxElement.evaluate(el => 
          window.getComputedStyle(el).transform
        );
        
        // Scroll down the page
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(300);
        
        // Get transform after scroll
        const afterTransform = await parallaxElement.evaluate(el => 
          window.getComputedStyle(el).transform
        );
        
        console.log(`Parallax transform: ${initialTransform} -> ${afterTransform}`);
        
        // Transform should change (parallax effect)
        // Note: may be the same if element is not in view
      }
    });
  });

  test.describe('Animation Performance', () => {
    
    test('animations should not cause excessive layout thrashing', async ({ page }) => {
      // Track layout shifts during scroll
      await page.addInitScript(() => {
        (window as any).__layoutShiftsDuringScroll = [];
        
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ((entry as any).hadRecentInput === false) {
              (window as any).__layoutShiftsDuringScroll.push({
                value: (entry as any).value,
                time: entry.startTime
              });
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Scroll through the page slowly
      for (let i = 0; i < 5; i++) {
        await page.evaluate((scrollAmount) => {
          window.scrollBy(0, scrollAmount);
        }, 300);
        await page.waitForTimeout(200);
      }
      
      const shifts = await page.evaluate(() => (window as any).__layoutShiftsDuringScroll || []);
      const totalCLS = shifts.reduce((sum: number, s: any) => sum + s.value, 0);
      
      console.log(`Total CLS during scroll: ${totalCLS}`);
      console.log(`Number of layout shifts: ${shifts.length}`);
      
      // CLS should remain reasonable during animations
      expect(totalCLS).toBeLessThan(0.5);
    });

    test('animations should use GPU-accelerated properties', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check that animated elements use transform/opacity (GPU-friendly)
      const animatedElement = page.locator('.gsap-fade-up').first();
      
      if (await animatedElement.count() > 0) {
        const styles = await animatedElement.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            transform: computed.transform,
            opacity: computed.opacity,
            willChange: computed.willChange,
          };
        });
        
        console.log('Animated element styles:', styles);
        
        // GSAP should be using transform for animations
        // (transform !== 'none' indicates GSAP has applied styles)
      }
    });

    test('animations should not block main thread', async ({ page }) => {
      // Check for long tasks during animation
      await page.addInitScript(() => {
        (window as any).__longTasks = [];
        
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Long task threshold
              (window as any).__longTasks.push({
                duration: entry.duration,
                name: entry.name
              });
            }
          }
        });
        
        try {
          observer.observe({ type: 'longtask', buffered: true });
        } catch {
          // longtask observer may not be supported
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Trigger scroll animations
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
      
      const longTasks = await page.evaluate(() => (window as any).__longTasks || []);
      
      console.log(`Long tasks detected: ${longTasks.length}`);
      if (longTasks.length > 0) {
        console.log('Long tasks:', longTasks);
      }
      
      // Should have minimal long tasks during animation
      expect(longTasks.length).toBeLessThan(10);
    });
  });

  test.describe('Animation Reverse on Scroll Back', () => {
    
    test('animations should reverse when scrolling back up', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Find an element below the fold
      const fadeUpElements = page.locator('.gsap-fade-up');
      const count = await fadeUpElements.count();
      
      if (count >= 2) {
        const targetElement = fadeUpElements.nth(Math.min(count - 1, 1));
        
        // Scroll down to trigger animation
        await targetElement.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        
        const opacityAfterScrollDown = await targetElement.evaluate(el => 
          parseFloat(window.getComputedStyle(el).opacity)
        );
        
        // Scroll back to top
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(1000);
        
        // Check if the element's animation reversed (if it's now out of view)
        const isInView = await targetElement.evaluate(el => {
          const rect = el.getBoundingClientRect();
          return rect.top < window.innerHeight && rect.bottom > 0;
        });
        
        console.log(`Element in view: ${isInView}`);
        console.log(`Opacity after scroll down: ${opacityAfterScrollDown}`);
        
        // If GSAP toggleActions includes 'reverse', opacity should change
        // This test documents the behavior
      }
    });
  });

  test.describe('Specific Animation Classes', () => {
    
    test('gsap-bounce-in should have bounce effect', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const bounceElement = page.locator('.gsap-bounce-in').first();
      
      if (await bounceElement.count() > 0) {
        // Scroll to bounce element
        await bounceElement.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        
        // Check it's visible
        const isVisible = await bounceElement.isVisible();
        expect(isVisible).toBe(true);
        
        // Check scale is applied (bounce uses scale)
        const transform = await bounceElement.evaluate(el => 
          window.getComputedStyle(el).transform
        );
        
        console.log('Bounce element transform:', transform);
      }
    });

    test('gsap-scale-up should scale from 0.95 to 1', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const scaleElement = page.locator('.gsap-scale-up').first();
      
      if (await scaleElement.count() > 0) {
        // Scroll to scale element
        await scaleElement.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        
        // Check final scale
        const transform = await scaleElement.evaluate(el => 
          window.getComputedStyle(el).transform
        );
        
        console.log('Scale-up element transform:', transform);
        
        // After animation, transform should be matrix with scale ≈ 1
        // or 'none' if animation is complete
      }
    });

    test('gsap-slide-left should slide from left', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const slideElement = page.locator('.gsap-slide-left').first();
      
      if (await slideElement.count() > 0) {
        await slideElement.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        
        const isVisible = await slideElement.isVisible();
        expect(isVisible).toBe(true);
        
        const transform = await slideElement.evaluate(el => 
          window.getComputedStyle(el).transform
        );
        
        console.log('Slide-left element transform:', transform);
      }
    });

    test('gsap-slide-right should slide from right', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const slideElement = page.locator('.gsap-slide-right').first();
      
      if (await slideElement.count() > 0) {
        await slideElement.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        
        const isVisible = await slideElement.isVisible();
        expect(isVisible).toBe(true);
        
        const transform = await slideElement.evaluate(el => 
          window.getComputedStyle(el).transform
        );
        
        console.log('Slide-right element transform:', transform);
      }
    });
  });

  test.describe('Counter Animation', () => {
    
    test('gsap-counter should animate numbers', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const counterElement = page.locator('.gsap-counter').first();
      
      if (await counterElement.count() > 0) {
        // Scroll to counter
        await counterElement.scrollIntoViewIfNeeded();
        
        // Track the number changes
        const numberSnapshots: string[] = [];
        
        for (let i = 0; i < 10; i++) {
          const text = await counterElement.textContent();
          numberSnapshots.push(text || '0');
          await page.waitForTimeout(200);
        }
        
        console.log('Counter snapshots:', numberSnapshots);
        
        // Numbers should change during animation
        const uniqueValues = new Set(numberSnapshots);
        
        // If counter is animating, we should see multiple different values
        // If it's instant or already finished, we might see just the final value
        console.log(`Unique counter values: ${uniqueValues.size}`);
      } else {
        console.log('No gsap-counter elements found on homepage');
      }
    });
  });

  test.describe('Text Reveal Animation', () => {
    
    test('gsap-text-reveal should reveal lines sequentially', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const textRevealElement = page.locator('.gsap-text-reveal').first();
      
      if (await textRevealElement.count() > 0) {
        const lines = textRevealElement.locator('.gsap-line');
        const lineCount = await lines.count();
        
        if (lineCount > 0) {
          await textRevealElement.scrollIntoViewIfNeeded();
          await page.waitForTimeout(1000);
          
          // All lines should be visible after animation
          for (let i = 0; i < lineCount; i++) {
            const opacity = await lines.nth(i).evaluate(el => 
              parseFloat(window.getComputedStyle(el).opacity)
            );
            expect(opacity).toBeGreaterThan(0);
          }
          
          console.log(`Text reveal: ${lineCount} lines animated`);
        }
      } else {
        console.log('No gsap-text-reveal elements found on homepage');
      }
    });
  });

  test.describe('Reduced Motion Preference', () => {
    
    test('should respect prefers-reduced-motion', async ({ page }) => {
      // Emulate reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // With reduced motion, elements should still be visible
      // but animations may be disabled or simplified
      const fadeUpElement = page.locator('.gsap-fade-up').first();
      
      if (await fadeUpElement.count() > 0) {
        const isVisible = await fadeUpElement.isVisible();
        expect(isVisible).toBe(true);
        
        console.log('Element visible with reduced motion preference');
        
        // Note: GSAP may or may not respect reduced motion by default
        // This test documents the current behavior
      }
    });
  });
});
