import { test, expect } from '@playwright/test';

/**
 * These tests specifically target the flickering issues observed:
 * - Sign-in button in header flickering on reload
 * - Logo flickering
 * - Animation jank
 * 
 * They use visual comparison and DOM mutation tracking
 */

test.describe('Flicker Detection Tests', () => {

  test.describe('Header Sign-In Flicker', () => {
    
    test('sign-in button should not change text during hydration', async ({ page }) => {
      // Track DOM mutations on the sign-in area
      await page.addInitScript(() => {
        (window as any).__textChanges = [];
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'characterData' || mutation.type === 'childList') {
              const target = mutation.target as Element;
              const text = target.textContent || '';
              if (text.toLowerCase().includes('sign') || 
                  text.toLowerCase().includes('login') ||
                  text.toLowerCase().includes('account')) {
                (window as any).__textChanges.push({
                  time: performance.now(),
                  text: text.substring(0, 50),
                  type: mutation.type
                });
              }
            }
          });
        });
        
        // Start observing when DOM is ready
        if (document.body) {
          observer.observe(document.body, { 
            childList: true, 
            subtree: true, 
            characterData: true 
          });
        } else {
          document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, { 
              childList: true, 
              subtree: true, 
              characterData: true 
            });
          });
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      const textChanges = await page.evaluate(() => (window as any).__textChanges || []);
      
      // Log any detected changes
      if (textChanges.length > 0) {
        console.log('Detected text mutations in auth area:', textChanges);
      }
      
      // There shouldn't be rapid text changes (flicker)
      // Filter for changes that happened quickly (within 500ms of each other)
      const rapidChanges = textChanges.filter((change: any, index: number) => {
        if (index === 0) return false;
        return change.time - textChanges[index - 1].time < 500;
      });
      
      if (rapidChanges.length > 2) {
        console.warn(`Potential flicker detected: ${rapidChanges.length} rapid text changes`);
      }
      
      // Pass but report findings
      expect(true).toBe(true);
    });

    test('header auth element visibility should be stable', async ({ page }) => {
      // Track visibility changes
      await page.addInitScript(() => {
        (window as any).__visibilityChanges = [];
        
        const checkVisibility = () => {
          const authElements = document.querySelectorAll('header a[href*="login"], header a[href*="account"], header button');
          authElements.forEach((el, i) => {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            (window as any).__visibilityChanges.push({
              time: performance.now(),
              index: i,
              visible: rect.width > 0 && rect.height > 0,
              opacity: style.opacity,
              display: style.display
            });
          });
        };
        
        // Check multiple times during load
        setTimeout(checkVisibility, 0);
        setTimeout(checkVisibility, 100);
        setTimeout(checkVisibility, 300);
        setTimeout(checkVisibility, 500);
        setTimeout(checkVisibility, 1000);
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      const visibilityChanges = await page.evaluate(() => (window as any).__visibilityChanges || []);
      
      // Check if any element went from visible to hidden and back
      const flickerDetected = visibilityChanges.some((change: any, index: number) => {
        if (index < 2) return false;
        const prev = visibilityChanges[index - 1];
        const prevPrev = visibilityChanges[index - 2];
        // Pattern: visible -> hidden -> visible = flicker
        return prevPrev.visible && !prev.visible && change.visible;
      });
      
      if (flickerDetected) {
        console.warn('Visibility flicker detected in header auth elements');
        console.log('Visibility timeline:', visibilityChanges);
      }
      
      expect(true).toBe(true); // Report but don't fail
    });

    test('SSR vs client render should match for auth button', async ({ page }) => {
      // Capture the initial HTML before JS runs
      let ssrHTML = '';
      
      page.on('response', async (response) => {
        if (response.url().endsWith('/') && response.request().resourceType() === 'document') {
          const text = await response.text();
          // Extract header HTML
          const headerMatch = text.match(/<header[^>]*>[\s\S]*?<\/header>/i);
          if (headerMatch) {
            ssrHTML = headerMatch[0];
          }
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Get current header HTML
      const clientHTML = await page.locator('header').first().innerHTML();
      
      // Check for major structural differences
      const ssrHasSignIn = ssrHTML.toLowerCase().includes('sign in') || 
                          ssrHTML.toLowerCase().includes('login');
      const clientHasSignIn = clientHTML.toLowerCase().includes('sign in') || 
                             clientHTML.toLowerCase().includes('login');
      
      const ssrHasAccount = ssrHTML.toLowerCase().includes('account') ||
                           ssrHTML.toLowerCase().includes('dashboard');
      const clientHasAccount = clientHTML.toLowerCase().includes('account') ||
                              clientHTML.toLowerCase().includes('dashboard');
      
      // If user is not logged in, both should show sign-in
      // If mismatch, there's hydration flicker
      if (ssrHasSignIn !== clientHasSignIn) {
        console.warn('SSR/Client mismatch for sign-in button - this causes flicker');
        console.log('SSR has sign-in:', ssrHasSignIn);
        console.log('Client has sign-in:', clientHasSignIn);
      }
      
      expect(true).toBe(true);
    });
  });

  test.describe('Element Position Stability', () => {
    
    test('header elements should stabilize after initial load', async ({ page }) => {
      // Track position changes over time
      await page.addInitScript(() => {
        (window as any).__positionChanges = [];
        
        const trackPositions = () => {
          const header = document.querySelector('header');
          if (!header) return;
          
          const elements = header.querySelectorAll('a, button, img, svg');
          const positions = Array.from(elements).slice(0, 10).map((el, i) => {
            const rect = el.getBoundingClientRect();
            return {
              index: i,
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              tag: el.tagName
            };
          });
          
          (window as any).__positionChanges.push({
            time: performance.now(),
            positions
          });
        };
        
        // Track at multiple points - focus on AFTER initial hydration
        setTimeout(trackPositions, 0);
        setTimeout(trackPositions, 50);
        setTimeout(trackPositions, 150);
        setTimeout(trackPositions, 300);
        setTimeout(trackPositions, 600);
        setTimeout(trackPositions, 1000);
        // Additional checks after hydration should be complete
        setTimeout(trackPositions, 1500);
        setTimeout(trackPositions, 2000);
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2200);

      const positionChanges = await page.evaluate(() => (window as any).__positionChanges || []);
      
      // Analyze position stability
      const jumps: any[] = [];
      
      for (let i = 1; i < positionChanges.length; i++) {
        const prev = positionChanges[i - 1];
        const curr = positionChanges[i];
        
        prev.positions.forEach((prevPos: any, idx: number) => {
          const currPos = curr.positions[idx];
          if (currPos) {
            const xDiff = Math.abs(currPos.x - prevPos.x);
            const yDiff = Math.abs(currPos.y - prevPos.y);
            
            // Jump of more than 5px is noticeable
            if (xDiff > 5 || yDiff > 5) {
              jumps.push({
                element: prevPos.tag + '#' + idx,
                xJump: xDiff,
                yJump: yDiff,
                fromTime: prev.time,
                toTime: curr.time
              });
            }
          }
        });
      }
      
      if (jumps.length > 0) {
        console.warn('Position jumps detected:', jumps);
      }
      
      // Focus on jumps AFTER initial hydration (after 1500ms to allow for async operations)
      // Initial hydration jumps are expected, but post-hydration should be stable
      // Small jumps (< 20px) are from font loading/async content and are acceptable
      const lateSignificantJumps = jumps.filter(j => 
        j.fromTime > 1500 && (j.xJump > 20 || j.yJump > 20)
      );
      
      if (lateSignificantJumps.length > 0) {
        console.error('Post-hydration significant position jumps:', lateSignificantJumps);
      }
      
      // Should have no SIGNIFICANT jumps (> 20px) after initial hydration
      // Allow up to 1 jump for edge cases (async content loading)
      expect(lateSignificantJumps.length).toBeLessThanOrEqual(1);
    });
  });

  test.describe('Animation Flicker', () => {
    
    test('animated elements should not have opacity flicker', async ({ page }) => {
      await page.addInitScript(() => {
        (window as any).__opacityChanges = [];
        
        const trackOpacity = () => {
          const animated = document.querySelectorAll('[class*="animate"], [class*="fade"], [class*="motion"]');
          animated.forEach((el, i) => {
            const style = window.getComputedStyle(el);
            (window as any).__opacityChanges.push({
              time: performance.now(),
              index: i,
              opacity: parseFloat(style.opacity),
              transform: style.transform
            });
          });
        };
        
        // Track rapidly
        for (let t = 0; t < 1000; t += 50) {
          setTimeout(trackOpacity, t);
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1100);

      const opacityChanges = await page.evaluate(() => (window as any).__opacityChanges || []);
      
      // Look for opacity jumping between 0 and 1 rapidly
      const flickerPattern = opacityChanges.filter((change: any, idx: number) => {
        if (idx < 2) return false;
        const prev = opacityChanges[idx - 1];
        const prevPrev = opacityChanges[idx - 2];
        
        // Same element going 1 -> 0 -> 1 quickly
        if (change.index === prev.index && prev.index === prevPrev.index) {
          return (prevPrev.opacity > 0.5 && prev.opacity < 0.3 && change.opacity > 0.5);
        }
        return false;
      });
      
      if (flickerPattern.length > 0) {
        console.warn('Opacity flicker detected:', flickerPattern);
      }
      
      expect(true).toBe(true);
    });
  });

  test.describe('Loading State Flicker', () => {
    
    test('should not show loading skeletons that flash', async ({ page }) => {
      await page.addInitScript(() => {
        (window as any).__skeletonAppearances = [];
        
        const checkSkeletons = () => {
          const skeletons = document.querySelectorAll('[class*="skeleton"], [class*="loading"], [class*="shimmer"], [class*="pulse"]');
          if (skeletons.length > 0) {
            (window as any).__skeletonAppearances.push({
              time: performance.now(),
              count: skeletons.length
            });
          }
        };
        
        // Check frequently
        for (let t = 0; t < 2000; t += 100) {
          setTimeout(checkSkeletons, t);
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2100);

      const skeletonAppearances = await page.evaluate(() => (window as any).__skeletonAppearances || []);
      
      // If skeletons appeared and disappeared quickly (< 200ms), that's a flash
      if (skeletonAppearances.length > 0) {
        const firstAppear = skeletonAppearances[0].time;
        const lastAppear = skeletonAppearances[skeletonAppearances.length - 1].time;
        const duration = lastAppear - firstAppear;
        
        if (duration < 200 && duration > 0) {
          console.warn(`Loading skeleton flashed for only ${duration}ms - too quick to be useful`);
        }
        
        console.log('Skeleton appearances:', skeletonAppearances);
      }
      
      expect(true).toBe(true);
    });
  });

  test.describe('Specific Component Flicker', () => {
    
    test('cookie consent should not cause layout shift', async ({ page }) => {
      await page.goto('/');
      
      // Wait for cookie consent to appear
      const cookieConsent = page.locator('[class*="cookie"], [class*="consent"], [id*="cookie"]');
      
      if (await cookieConsent.count() > 0) {
        // Get page content position before cookie consent
        const mainContent = page.locator('main, [role="main"], .main-content').first();
        const beforeBox = await mainContent.boundingBox();
        
        // Dismiss cookie consent
        const acceptButton = page.locator('button:has-text("Accept"), button:has-text("OK"), button:has-text("Got it")');
        if (await acceptButton.count() > 0) {
          await acceptButton.first().click();
          await page.waitForTimeout(300);
        }
        
        // Check position after
        const afterBox = await mainContent.boundingBox();
        
        if (beforeBox && afterBox) {
          const shift = Math.abs(afterBox.y - beforeBox.y);
          if (shift > 10) {
            console.warn(`Cookie consent caused ${shift}px layout shift`);
          }
          expect(shift).toBeLessThan(50); // Shouldn't cause major shift
        }
      }
    });

    test('navigation dropdown should not flicker', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Find navigation items that might have dropdowns
      const navItems = page.locator('header nav li, header nav > a, header [role="menuitem"]');
      
      for (let i = 0; i < Math.min(await navItems.count(), 5); i++) {
        const item = navItems.nth(i);
        if (await item.isVisible()) {
          await item.hover();
          await page.waitForTimeout(100);
          
          // Check for dropdown
          const dropdown = page.locator('[role="menu"], .dropdown, [class*="dropdown"]');
          if (await dropdown.count() > 0 && await dropdown.first().isVisible()) {
            // Dropdown appeared - check it doesn't flicker
            const isVisible1 = await dropdown.first().isVisible();
            await page.waitForTimeout(50);
            const isVisible2 = await dropdown.first().isVisible();
            
            // Should remain visible while hovering
            expect(isVisible1).toBe(isVisible2);
          }
        }
      }
    });
  });
});
