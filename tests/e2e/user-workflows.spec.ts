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

  test.describe('Hour Tracking Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in as lobbyist
      await page.goto('/auth/signin');
      await page.fill('input[name="email"]', 'john.doe@lobbying.com');
      await page.fill('input[name="password"]', 'lobbyist123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
    });

    test('should access hour tracking page', async ({ page }) => {
      await page.click('a:has-text("Hour Tracking")');
      await page.waitForURL('/hours');

      await expect(page.locator('h2')).toContainText('Hour Tracking');
    });

    test('should display quarterly summary card', async ({ page }) => {
      await page.goto('/hours');

      // Check summary elements
      await expect(page.locator('text=Q4 2025 Summary')).toBeVisible();
      await expect(page.locator('text=Total Lobbying Hours')).toBeVisible();
      await expect(page.locator('text=hours until registration required')).toBeVisible();
    });

    test('should display hour log form', async ({ page }) => {
      await page.goto('/hours');

      // Check form fields
      await expect(page.locator('label:has-text("Activity Date")')).toBeVisible();
      await expect(page.locator('label:has-text("Hours")')).toBeVisible();
      await expect(page.locator('label:has-text("Activity Description")')).toBeVisible();
      await expect(page.locator('button:has-text("Add Hours")')).toBeVisible();
    });

    test('should add a new hour log entry', async ({ page }) => {
      await page.goto('/hours');

      // Fill out the form
      const today = new Date().toISOString().split('T')[0];
      await page.fill('input[type="date"]', today);
      await page.fill('input[type="number"]', '3.5');
      await page.fill('textarea', 'Meeting with county commissioners about transportation policy');

      // Submit the form
      await page.click('button:has-text("Add Hours")');

      // Wait for success (form should reset)
      await page.waitForTimeout(1000);

      // Check that entry appears in the table
      await expect(page.locator('text=Meeting with county commissioners')).toBeVisible();
      await expect(page.locator('text=3.50')).toBeVisible();
    });

    test('should update total hours after adding entry', async ({ page }) => {
      await page.goto('/hours');

      // Get initial total
      const initialTotal = await page.locator('text=/\\d+\\.\\d+ \\/ 10/').textContent();

      // Add hours
      const today = new Date().toISOString().split('T')[0];
      await page.fill('input[type="date"]', today);
      await page.fill('input[type="number"]', '2');
      await page.fill('textarea', 'Follow-up meeting');
      await page.click('button:has-text("Add Hours")');

      // Wait for update
      await page.waitForTimeout(1000);

      // Check total has increased
      const newTotal = await page.locator('text=/\\d+\\.\\d+ \\/ 10/').textContent();
      await expect(newTotal).not.toBe(initialTotal);
    });

    test('should display activity history table', async ({ page }) => {
      await page.goto('/hours');

      // Check table headers
      await expect(page.locator('th:has-text("Date")')).toBeVisible();
      await expect(page.locator('th:has-text("Hours")')).toBeVisible();
      await expect(page.locator('th:has-text("Description")')).toBeVisible();
      await expect(page.locator('th:has-text("Quarter")')).toBeVisible();
    });

    test('should show registration requirement info', async ({ page }) => {
      await page.goto('/hours');

      // Check info box is present
      await expect(page.locator('text=Registration Requirement')).toBeVisible();
      await expect(page.locator('text=3 working days')).toBeVisible();
      await expect(page.locator('text=§3.802')).toBeVisible();
    });

    test('should validate form fields', async ({ page }) => {
      await page.goto('/hours');

      // Try to submit without filling fields
      await page.click('button:has-text("Add Hours")');

      // Browser validation should prevent submission
      // Check that form still has empty fields (browser validation blocks submit)
      const hoursInput = page.locator('input[type="number"]');
      await expect(hoursInput).toHaveValue('');
    });

    test('should update progress bar color as hours increase', async ({ page }) => {
      await page.goto('/hours');

      // Check progress bar exists
      const progressBar = page.locator('[role="progressbar"]');
      await expect(progressBar).toBeVisible();

      // Progress bar should have color class (green/yellow/red)
      const progressBarDiv = progressBar.locator('div').first();
      await expect(progressBarDiv).toHaveClass(/bg-(green|yellow|red)-/);
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
