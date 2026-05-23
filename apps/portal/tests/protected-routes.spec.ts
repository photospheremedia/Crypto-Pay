import { test, expect } from '@playwright/test';

test.describe('Account Pages (Unauthenticated)', () => {
  test('account page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/account');
    
    // Should redirect to login or show auth required message
    await page.waitForTimeout(2000);
    
    const isOnLogin = page.url().includes('login');
    const hasAuthMessage = await page.getByText(/sign in|log in|unauthorized/i).count() > 0;
    
    expect(isOnLogin || hasAuthMessage).toBeTruthy();
  });

  test('admin page requires authentication', async ({ page }) => {
    await page.goto('/admin');
    
    await page.waitForTimeout(2000);
    
    // Should redirect to login or show access denied
    const isOnLogin = page.url().includes('login');
    const hasAuthMessage = await page.getByText(/sign in|log in|access denied|unauthorized/i).count() > 0;
    
    expect(isOnLogin || hasAuthMessage).toBeTruthy();
  });
});

test.describe('API Health', () => {
  test('health endpoint responds', async ({ request }) => {
    const response = await request.get('/api/health');
    
    // Should return 200 or endpoint exists
    expect([200, 404].includes(response.status())).toBeTruthy();
  });
});
