import { test, expect } from "@playwright/test";

test.describe("Demo Features", () => {
  test.describe("Demo Files Panel", () => {
    test.beforeEach(async ({ page }) => {
      // Sign in as board member
      await page.goto("/auth/signin");
      await page.fill('input[name="email"]', "commissioner@multnomah.gov");
      await page.fill('input[name="password"]', "board123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/dashboard");
    });

    test("should show demo files panel on board calendar page", async ({
      page,
    }) => {
      await page.goto("/board-member/calendar");

      // Check demo files button is visible
      const demoButton = page.locator('button:has-text("Demo Files")');
      await expect(demoButton).toBeVisible();

      // Click to expand
      await demoButton.click();

      // Check demo files are listed
      await expect(page.locator("text=Calendar Events (CSV)")).toBeVisible();
      await expect(page.locator("text=Lobbying Receipts (CSV)")).toBeVisible();
    });

    test("should download demo CSV file", async ({ page }) => {
      await page.goto("/board-member/calendar");

      // Expand demo files
      await page.click('button:has-text("Demo Files")');

      // Check download link exists
      const downloadLink = page.locator(
        'a[download*="board-calendar-sample.csv"]'
      );
      await expect(downloadLink).toBeVisible();

      // Verify href points to correct file
      await expect(downloadLink).toHaveAttribute(
        "href",
        "/demo-files/board-calendar-sample.csv"
      );
    });
  });

  test.describe("Demo Files on Lobbyist Expenses", () => {
    test.beforeEach(async ({ page }) => {
      // Sign in as lobbyist
      await page.goto("/auth/signin");
      await page.fill('input[name="email"]', "john.doe@lobbying.com");
      await page.fill('input[name="password"]', "lobbyist123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/dashboard");
    });

    test("should show demo files panel on lobbyist expenses page", async ({
      page,
    }) => {
      await page.goto("/reports/lobbyist");

      // Check demo files button
      const demoButton = page.locator('button:has-text("Demo Files")');
      await expect(demoButton).toBeVisible();

      // Expand
      await demoButton.click();

      // Check files specific to lobbyist expenses
      await expect(page.locator("text=Lobbyist Expenses (CSV)")).toBeVisible();
    });
  });

  test.describe("Demo Files on Employer Expenses", () => {
    test.beforeEach(async ({ page }) => {
      // Sign in as employer
      await page.goto("/auth/signin");
      await page.fill('input[name="email"]', "contact@techcorp.com");
      await page.fill('input[name="password"]', "employer123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/dashboard");
    });

    test("should show demo files panel on employer expenses page", async ({
      page,
    }) => {
      await page.goto("/reports/employer");

      // Check demo files button
      const demoButton = page.locator('button:has-text("Demo Files")');
      await expect(demoButton).toBeVisible();

      // Expand
      await demoButton.click();

      // Check files specific to employer expenses
      await expect(page.locator("text=Employer Expenses (CSV)")).toBeVisible();
    });
  });

  test.describe("Demo Guide Button", () => {
    test("should display demo guide button on sign-in page", async ({
      page,
    }) => {
      await page.goto("/auth/signin");

      // Check demo guide link is visible at bottom right
      const demoGuideLink = page.locator('a:has-text("Demo Guide")');
      await expect(demoGuideLink).toBeVisible();

      // Should link to demo guide
      await expect(demoGuideLink).toHaveAttribute("href", "/DEMO-GUIDE.html");
    });

    test("should display demo guide button on authenticated pages", async ({
      page,
    }) => {
      // Sign in
      await page.goto("/auth/signin");
      await page.fill('input[name="email"]', "admin@multnomah.gov");
      await page.fill('input[name="password"]', "Demo2025!Admin");
      await page.click('button[type="submit"]');
      await page.waitForURL("/dashboard");

      // Check demo guide button is still visible
      const demoGuideLink = page.locator('a:has-text("Demo Guide")');
      await expect(demoGuideLink).toBeVisible();
    });
  });
});
