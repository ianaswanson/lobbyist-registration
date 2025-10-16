import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display sign-in page correctly', async ({ page }) => {
    await page.goto('/auth/signin');

    // Check page title
    await expect(page.locator('h2')).toContainText('Lobbyist Registration System');
    await expect(page.locator('text=Sign in to your account')).toBeVisible();

    // Check form fields exist
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show demo credentials panel', async ({ page }) => {
    await page.goto('/auth/signin');

    // Check demo credentials button is visible
    const demoButton = page.locator('button:has-text("Demo Accounts")');
    await expect(demoButton).toBeVisible();

    // Click to expand
    await demoButton.click();

    // Check demo accounts are visible
    await expect(page.locator('text=County Administrator')).toBeVisible();
    await expect(page.locator('text=Sarah Johnson')).toBeVisible();
  });

  test('should auto-fill credentials when clicking demo account', async ({ page }) => {
    await page.goto('/auth/signin');

    // Expand demo credentials
    await page.locator('button:has-text("Demo Accounts")').click();

    // Click on admin demo account
    await page.locator('button:has-text("County Administrator")').click();

    // Check fields are filled
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');

    await expect(emailInput).toHaveValue('admin@multnomah.gov');
    await expect(passwordInput).toHaveValue('admin123');
  });

  test('should successfully sign in as admin', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill in admin credentials
    await page.fill('input[name="email"]', 'admin@multnomah.gov');
    await page.fill('input[name="password"]', 'admin123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await page.waitForURL('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // Check welcome message
    await expect(page.locator('h2')).toContainText('Welcome back');
  });

  test('should successfully sign in as lobbyist', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill in lobbyist credentials
    await page.fill('input[name="email"]', 'john.doe@lobbying.com');
    await page.fill('input[name="password"]', 'lobbyist123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await page.waitForURL('/dashboard');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill in invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show error (check URL still on sign in page with error param)
    await expect(page).toHaveURL(/\/auth\/signin/);
  });
});
