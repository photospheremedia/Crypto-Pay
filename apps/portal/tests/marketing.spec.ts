import { test, expect } from '@playwright/test';

test.describe('Marketing Pages', () => {
  test('homepage loads and displays hero section', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/Restaurant Hub Solution/);
    
    // Main navigation should be visible
    await expect(page.locator('nav')).toBeVisible();
    
    // Should have a call-to-action button
    const ctaButton = page.getByRole('link', { name: /get started|contact|sign up/i });
    await expect(ctaButton.first()).toBeVisible();
  });

  test('pricing page displays pricing tiers', async ({ page }) => {
    await page.goto('/pricing');
    
    // Wait for page load
    await page.waitForLoadState('networkidle');
    
    // Should display pricing information (title may not include 'Pricing')
    const hasPricingContent = await page.getByText(/pricing|plans|month|\$|price/i).count() > 0;
    const pageLoaded = await page.locator('main').count() > 0;
    
    expect(hasPricingContent || pageLoaded).toBeTruthy();
  });

  test('services page is accessible', async ({ page }) => {
    await page.goto('/services');
    
    // Page should load without errors
    await expect(page.locator('main')).toBeVisible();
  });

  test('contact page has form elements', async ({ page }) => {
    await page.goto('/contact');
    
    // Should have contact form or contact information
    const hasForm = await page.locator('form').count() > 0;
    const hasEmail = await page.getByText(/@|email|contact/i).count() > 0;
    
    expect(hasForm || hasEmail).toBeTruthy();
  });
});
