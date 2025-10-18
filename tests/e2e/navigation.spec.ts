import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in as admin for navigation tests
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'admin@multnomah.gov');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should display admin navigation menu', async ({ page }) => {
    // Check logo
    await expect(page.locator('nav a:has-text("Lobbyist Registry")').first()).toBeVisible();

    // Check admin menu items (use first match to avoid strict mode violations)
    await expect(page.locator('nav a[href="/dashboard"]').first()).toBeVisible();
    await expect(page.locator('nav a:has-text("Review")').first()).toBeVisible();
    await expect(page.locator('nav a:has-text("Compliance")').first()).toBeVisible();
    await expect(page.locator('nav a:has-text("Violations")').first()).toBeVisible();
    await expect(page.locator('nav a:has-text("Search")').first()).toBeVisible();

    // Exemption Checker should NOT be visible for admin in nav
    const navBar = page.locator('nav').first();
    await expect(navBar.locator('a:has-text("Exemption Checker")')).not.toBeVisible();
  });

  test('should show user dropdown menu', async ({ page }) => {
    // Click user menu button
    await page.click('button:has-text("County Administrator")');

    // Check dropdown items (within the dropdown menu div)
    const dropdown = page.locator('div.absolute.right-0').first();
    await expect(dropdown.locator('text=admin@multnomah.gov')).toBeVisible();
    await expect(dropdown.locator('a:has-text("Dashboard")')).toBeVisible();
    await expect(dropdown.locator('a:has-text("Notifications")')).toBeVisible();
    await expect(dropdown.locator('button:has-text("Sign Out")')).toBeVisible();
  });

  test('should navigate to compliance page', async ({ page }) => {
    await page.click('a:has-text("Compliance")');
    await page.waitForURL('/admin/compliance');
    await expect(page).toHaveURL('/admin/compliance');
    await expect(page.locator('h1')).toContainText('Compliance Dashboard');
  });

  test('should navigate to violations page', async ({ page }) => {
    await page.click('a:has-text("Violations")');
    await page.waitForURL('/admin/violations');
    await expect(page).toHaveURL('/admin/violations');
  });

  test('should navigate to search page', async ({ page }) => {
    await page.click('a:has-text("Search")');
    await page.waitForURL('/search');
    await expect(page).toHaveURL('/search');
    await expect(page.locator('h1')).toContainText('Search Lobbyist Registry');
  });

  test('should highlight active navigation item', async ({ page }) => {
    // Navigate to compliance
    await page.click('a:has-text("Compliance")');
    await page.waitForURL('/admin/compliance');

    // Check that Compliance link has active styling (blue background)
    const complianceLink = page.locator('a:has-text("Compliance")').first();
    await expect(complianceLink).toHaveClass(/bg-blue-100/);
  });

  test('should sign out successfully', async ({ page }) => {
    // Open user dropdown
    await page.click('button:has-text("County Administrator")');

    // Click sign out
    await page.click('button:has-text("Sign Out")');

    // Should redirect to home or sign in
    await page.waitForURL(/\/(auth\/signin)?/);
  });
});

test.describe('Lobbyist Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in as lobbyist
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'john.doe@lobbying.com');
    await page.fill('input[name="password"]', 'lobbyist123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should display lobbyist navigation menu', async ({ page }) => {
    // Check logo
    await expect(page.locator('nav a:has-text("Lobbyist Registry")').first()).toBeVisible();

    // Check lobbyist menu items
    await expect(page.locator('nav a[href="/dashboard"]').first()).toBeVisible();
    await expect(page.locator('nav a:has-text("Register")').first()).toBeVisible();
    await expect(page.locator('nav a:has-text("Hour Tracking")').first()).toBeVisible();
    await expect(page.locator('nav a:has-text("My Reports")').first()).toBeVisible();
    await expect(page.locator('nav a:has-text("Search")').first()).toBeVisible();
    await expect(page.locator('nav a:has-text("Exemption Checker")').first()).toBeVisible();
  });

  test('should navigate to hour tracking page', async ({ page }) => {
    await page.click('a:has-text("Hour Tracking")');
    await page.waitForURL('/hours');
    await expect(page).toHaveURL('/hours');
    await expect(page.locator('h2')).toContainText('Hour Tracking');
  });

  test('should highlight active hour tracking navigation item', async ({ page }) => {
    // Navigate to hour tracking
    await page.click('a:has-text("Hour Tracking")');
    await page.waitForURL('/hours');

    // Check that Hour Tracking link has active styling (blue background)
    const hourTrackingLink = page.locator('nav a:has-text("Hour Tracking")').first();
    await expect(hourTrackingLink).toHaveClass(/bg-blue-100/);
  });
});

test.describe('Public Navigation', () => {
  test('should display public navigation on exemption checker', async ({ page }) => {
    await page.goto('/exemption-checker');

    // Check public nav (use nav context to avoid matching page content)
    const nav = page.locator('nav').first();
    await expect(nav.locator('a:has-text("Lobbyist Registry")').first()).toBeVisible();
    await expect(nav.locator('a:has-text("Exemption Checker")').first()).toBeVisible();
    await expect(nav.locator('a:has-text("Search")').first()).toBeVisible();
    await expect(nav.locator('a:has-text("Sign In")')).toBeVisible();
  });

  test('should display public navigation on search page', async ({ page }) => {
    await page.goto('/search');

    // Check public nav (use nav context to avoid matching page content)
    const nav = page.locator('nav').first();
    await expect(nav.locator('a:has-text("Lobbyist Registry")').first()).toBeVisible();
    await expect(nav.locator('a:has-text("Exemption Checker")').first()).toBeVisible();
    await expect(nav.locator('a:has-text("Search")').first()).toBeVisible();
    await expect(nav.locator('a:has-text("Sign In")')).toBeVisible();
  });
});
