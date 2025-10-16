import { test, expect } from '@playwright/test';

test.describe('User Workflows', () => {
  test.describe('Lobbyist Registration Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in as lobbyist
      await page.goto('/auth/signin');
      await page.fill('input[name="email"]', 'john.doe@lobbying.com');
      await page.fill('input[name="password"]', 'lobbyist123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
    });

    test('should access lobbyist registration page', async ({ page }) => {
      // Navigate to registration from dashboard
      await page.click('a:has-text("Register")');
      await page.waitForURL('/register/lobbyist');

      // Check page loaded
      await expect(page.locator('h2')).toContainText('Lobbyist Registration');
    });

    test('should display registration form fields', async ({ page }) => {
      await page.goto('/register/lobbyist');

      // Check key form sections exist
      await expect(page.locator('text=Personal Information')).toBeVisible();
      await expect(page.locator('text=Employer Information')).toBeVisible();
      await expect(page.locator('text=Lobbying Subjects')).toBeVisible();
    });
  });

  test.describe('Expense Reporting Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in as lobbyist
      await page.goto('/auth/signin');
      await page.fill('input[name="email"]', 'john.doe@lobbying.com');
      await page.fill('input[name="password"]', 'lobbyist123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
    });

    test('should access expense report page', async ({ page }) => {
      await page.click('a:has-text("My Reports")');
      await page.waitForURL('/reports/lobbyist');

      await expect(page.locator('h2')).toContainText('Quarterly Expense Report');
    });

    test('should show multiple input modes', async ({ page }) => {
      await page.goto('/reports/lobbyist');

      // Check input mode tabs
      await expect(page.locator('button:has-text("Manual Entry")')).toBeVisible();
      await expect(page.locator('button:has-text("CSV Upload")')).toBeVisible();
      await expect(page.locator('button:has-text("Paste Data")')).toBeVisible();
    });

    test('should switch between input modes', async ({ page }) => {
      await page.goto('/reports/lobbyist');

      // Click CSV Upload
      await page.click('button:has-text("CSV Upload")');
      await expect(page.locator('text=Upload CSV File')).toBeVisible();

      // Click Paste Data
      await page.click('button:has-text("Paste Data")');
      await expect(page.locator('textarea')).toBeVisible();

      // Click back to Manual Entry
      await page.click('button:has-text("Manual Entry")');
      await expect(page.locator('button:has-text("Add Expense")')).toBeVisible();
    });
  });

  test.describe('Board Member Calendar Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in as board member
      await page.goto('/auth/signin');
      await page.fill('input[name="email"]', 'commissioner@multnomah.gov');
      await page.fill('input[name="password"]', 'board123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
    });

    test('should access calendar page', async ({ page }) => {
      await page.click('a:has-text("Calendar & Receipts")');
      await page.waitForURL('/board-member/calendar');

      await expect(page.locator('h2')).toContainText('Quarterly Calendar & Lobbying Receipts');
    });

    test('should show calendar and receipts sections', async ({ page }) => {
      await page.goto('/board-member/calendar');

      // Check sections
      await expect(page.locator('text=Quarterly Calendar')).toBeVisible();
      await expect(page.locator('text=Lobbying Receipts')).toBeVisible();
    });
  });

  test.describe('Admin Compliance Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in as admin
      await page.goto('/auth/signin');
      await page.fill('input[name="email"]', 'admin@multnomah.gov');
      await page.fill('input[name="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
    });

    test('should access compliance dashboard', async ({ page }) => {
      await page.click('a:has-text("Compliance")');
      await page.waitForURL('/admin/compliance');

      await expect(page.locator('h1')).toContainText('Compliance Dashboard');
    });

    test('should display compliance metrics', async ({ page }) => {
      await page.goto('/admin/compliance');

      // Check key metrics are displayed
      await expect(page.locator('text=Registered Lobbyists')).toBeVisible();
      await expect(page.locator('text=Employers')).toBeVisible();
      await expect(page.locator('text=Board Members')).toBeVisible();
      await expect(page.locator('text=Violations')).toBeVisible();
    });
  });

  test.describe('Public Exemption Checker Flow', () => {
    test('should access exemption checker without auth', async ({ page }) => {
      await page.goto('/exemption-checker');

      await expect(page.locator('h1')).toContainText('Lobbyist Registration Exemption Checker');
    });

    test('should display exemption questions', async ({ page }) => {
      await page.goto('/exemption-checker');

      // Check main question
      await expect(page.locator('text=How many hours per quarter do you spend on lobbying activities?')).toBeVisible();

      // Check exemption checkboxes
      await expect(page.locator('text=I am news media')).toBeVisible();
      await expect(page.locator('text=I am a government official')).toBeVisible();
      await expect(page.locator('text=I only give public testimony')).toBeVisible();
    });

    test('should calculate exemption status', async ({ page }) => {
      await page.goto('/exemption-checker');

      // Enter less than 10 hours
      await page.fill('input[type="number"]', '5');

      // Should show exemption result
      await page.click('button:has-text("Check Status")');

      // Wait for result (this depends on implementation)
      await page.waitForTimeout(500);
    });
  });

  test.describe('Public Search Flow', () => {
    test('should access search without auth', async ({ page }) => {
      await page.goto('/search');

      await expect(page.locator('h1')).toContainText('Search Lobbyist Registry');
    });

    test('should display search form', async ({ page }) => {
      await page.goto('/search');

      // Check search elements
      await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
      await expect(page.locator('button:has-text("Search")')).toBeVisible();
      await expect(page.locator('button:has-text("Reset")')).toBeVisible();
    });

    test('should show advanced filters', async ({ page }) => {
      await page.goto('/search');

      // Click show advanced filters
      await page.click('button:has-text("Show Advanced Filters")');

      // Check advanced filter fields appear
      await expect(page.locator('label:has-text("Date From")')).toBeVisible();
      await expect(page.locator('label:has-text("Date To")')).toBeVisible();
      await expect(page.locator('label:has-text("Min Expense Amount")')).toBeVisible();
    });

    test('should perform search', async ({ page }) => {
      await page.goto('/search');

      // Enter search term
      await page.fill('input[placeholder*="Search"]', 'Technology');

      // Click search
      await page.click('button:has-text("Search")');

      // Should show results section
      await expect(page.locator('text=Found')).toBeVisible();
    });
  });
});
