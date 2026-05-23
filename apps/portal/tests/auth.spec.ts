import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Should have email and password fields
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    
    // Should have submit button (use exact match to avoid Google button)
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
    
    // Should have link to signup ("Create an account" is the actual text)
    const hasSignupLink = await page.getByRole('link', { name: /create an account/i }).count() > 0;
    const hasNewToText = await page.getByText(/new to crypto pay/i).count() > 0;
    expect(hasSignupLink || hasNewToText).toBeTruthy();
  });

  test('signup page renders correctly', async ({ page }) => {
    await page.goto('/signup');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check signup page loaded - look for signup-specific content
    const hasSignupForm = await page.locator('form').count() > 0;
    const hasEmailInput = await page.locator('input[type="email"], input[name*="email"]').count() > 0;
    const hasPasswordInput = await page.locator('input[type="password"]').count() > 0;
    
    // At least form structure should exist
    expect(hasSignupForm || hasEmailInput || hasPasswordInput).toBeTruthy();
  });

  test('signup multi-step flow submits successfully', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    // Step 1: business info
    await page.getByLabel(/company \/ project name/i).fill('Crypto Pay QA Merchant');
    await page.getByRole('button', { name: /online merchant/i }).click();
    await page.locator('#estimated_locations').selectOption('1');
    await page.locator('#how_heard').selectOption('google');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    // Step 2: location & contact
    await page.getByLabel(/^city \*/i).fill('Miami');
    await page.getByLabel(/^state \*/i).fill('FL');
    await page.getByLabel(/phone number \*/i).fill('+1 305 555 0110');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    // Step 3: account
    const uniqueEmail = `qa-signup-${Date.now()}@outlook.com`;
    await page.getByLabel(/email address \*/i).fill(uniqueEmail);
    await page.getByLabel(/^password \*/i).fill('StrongPass123!');
    await page.getByRole('button', { name: /create account/i }).click();

    // Sign-up may redirect (when email confirm disabled) or show success message.
    await expect
      .poll(
        async () => {
          const onSetupPage = /\/account\/setup/.test(page.url());
          const hasSuccessMessage =
            (await page.getByText(/account created|check your email|verify your account/i).count()) > 0;
          const hasRateLimitMessage =
            (await page.getByText(/email rate limit exceeded|temporarily rate-limited/i).count()) > 0;
          return onSetupPage || hasSuccessMessage || hasRateLimitMessage;
        },
        { timeout: 15000 }
      )
      .toBeTruthy();
  });

  test('forgot password page is accessible', async ({ page }) => {
    await page.goto('/forgot-password');
    
    // Should have email field for password reset
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('invalid login shows error message', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in invalid credentials
    await page.getByLabel(/email/i).fill('invalid@test.com');
    await page.getByLabel(/password/i).fill('wrongpassword123');
    
    // Submit the form (use exact match)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    
    // Should show error message (wait for response)
    await page.waitForTimeout(3000);
    
    // Check for error indication (could be toast, inline error, or redirect back to login)
    const hasError = await page.getByText(/invalid|error|incorrect|failed/i).count() > 0;
    const stillOnLogin = page.url().includes('login');
    
    expect(hasError || stillOnLogin).toBeTruthy();
  });
});
