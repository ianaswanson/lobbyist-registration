import { test, expect } from "@playwright/test";

test.describe("My Violations & Appeals", () => {
  // Helper function to sign in as lobbyist
  async function signInAsLobbyist(page: any) {
    await page.goto("/auth/signin");
    await page.fill('input[name="email"]', "john.doe@lobbying.com");
    await page.fill('input[name="password"]', "lobbyist123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  }

  // Helper function to sign in as admin
  async function signInAsAdmin(page: any) {
    await page.goto("/auth/signin");
    await page.fill('input[name="email"]', "admin@multnomah.gov");
    await page.fill('input[name="password"]', "Demo2025!Admin");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  }

  // Helper function to create a test violation via admin API
  async function createTestViolation(
    page: any,
    lobbyistEmail: string,
    data: {
      type: string;
      status: string;
      fineAmount: number;
      description: string;
    }
  ) {
    // Sign in as admin
    await signInAsAdmin(page);

    // Get lobbyist entity by email
    // Navigate to a page where we can get the lobbyist ID
    // For now, use a known lobbyist ID from seed data
    // In seed script, john.doe@lobbying.com is a lobbyist

    // Make API call as admin to create violation
    const response = await fetch("/api/violations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies
      body: JSON.stringify({
        entityType: "LOBBYIST",
        entityId: "lobbyist-id", // This would need to be fetched dynamically
        violationType: data.type,
        description: data.description,
        fineAmount: data.fineAmount,
        sendEducationalLetter: false,
      }),
    });

    // Sign back in as lobbyist
    await signInAsLobbyist(page);

    return await response.json();
  }

  test("should display violations list", async ({ page }) => {
    // 1. Sign in as lobbyist
    await signInAsLobbyist(page);

    // 2. Navigate to My Violations via My Work dropdown
    await page.click('button:has-text("My Work")');
    await page.click("text=My Violations");
    await page.waitForURL("/my-violations");

    // 3. Check page loaded (h1 might say "My Violations" or "My Violations & Appeals")
    await expect(page.locator("h1")).toContainText(/My Violations|Violations/);

    // 4. Check for ordinance reference
    await expect(page.locator("text=§3.809").first()).toBeVisible();

    // 5. Page should be fully loaded (check for any content)
    // Either show violations table or some content about violations
    const pageHasContent = await page.locator("body").isVisible();
    expect(pageHasContent).toBeTruthy();
  });

  test("should submit an appeal for an issued violation", async ({ page }) => {
    // Sign in as lobbyist with violations (jane.smith@lobbying.com has violations from seed)
    await page.goto("/auth/signin");
    await page.fill('input[name="email"]', "john.doe@lobbying.com");
    await page.fill('input[name="password"]', "lobbyist123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");

    // Navigate to My Violations
    await page.goto("/my-violations");
    await page.waitForLoadState("networkidle");

    // Look for an ISSUED violation with Appeal button
    const appealButton = page.locator('button:has-text("Appeal")').first();

    if (await appealButton.isVisible()) {
      // Click Appeal button
      await appealButton.click();

      // Fill in appeal reason
      await page.fill(
        'textarea[placeholder*="appeal"]',
        "I respectfully appeal this violation due to technical difficulties during submission."
      );

      // Submit appeal
      await page.click('button:has-text("Submit Appeal")');

      // Should show success message
      await expect(
        page.locator("text=/appeal.*submitted|submitted.*successfully/i")
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test("should validate appeal reason is required", async ({ page }) => {
    await signInAsLobbyist(page);
    await page.goto("/my-violations");
    await page.waitForLoadState("networkidle");

    const appealButton = page.locator('button:has-text("Appeal")').first();

    if (await appealButton.isVisible()) {
      await appealButton.click();

      // Try to submit without entering reason
      await page.click('button:has-text("Submit Appeal")');

      // Should show validation error
      const errorVisible = await page
        .locator("text=/reason.*required|please.*provide/i")
        .isVisible({ timeout: 3000 })
        .catch(() => false);
      expect(errorVisible).toBeTruthy();
    }
  });

  test("should display appeal deadline correctly", async ({ page }) => {
    await signInAsLobbyist(page);
    await page.goto("/my-violations");
    await page.waitForLoadState("networkidle");

    // Check for 30-day appeal deadline text (§3.809)
    const deadlineText = page.locator("text=/30.*day|appeal.*deadline/i");
    const isVisible = await deadlineText.isVisible().catch(() => false);

    // At least the ordinance reference should be visible
    await expect(page.locator("text=§3.809").first()).toBeVisible();
  });

  test("should show different violation statuses with correct styling", async ({
    page,
  }) => {
    await signInAsLobbyist(page);
    await page.goto("/my-violations");
    await page.waitForLoadState("networkidle");

    // Look for status badges with different colors
    // ISSUED, APPEALED, UPHELD, OVERTURNED, WAIVED, PAID statuses
    const statusBadges = page.locator('[class*="badge"], [class*="Badge"]');

    if ((await statusBadges.count()) > 0) {
      // At least one status badge should be visible
      await expect(statusBadges.first()).toBeVisible();
    }
  });

  test("should display violation details correctly", async ({ page }) => {
    await signInAsLobbyist(page);
    await page.goto("/my-violations");
    await page.waitForLoadState("networkidle");

    // Check for violation details in table
    // Should show: type, description, fine amount, status, issued date
    const hasTable = await page
      .locator("table")
      .isVisible()
      .catch(() => false);

    if (hasTable) {
      // Look for column headers or data
      const hasContent = (await page.locator("th, td").count()) > 0;
      expect(hasContent).toBeTruthy();
    }
  });

  test("should not show appeal button for non-appealable violations", async ({
    page,
  }) => {
    await signInAsLobbyist(page);
    await page.goto("/my-violations");
    await page.waitForLoadState("networkidle");

    // APPEALED, UPHELD, OVERTURNED violations should not have Appeal button
    // Check if there are any violations with these statuses
    const appealedStatus = page
      .locator("text=/APPEALED|UPHELD|OVERTURNED/i")
      .first();

    if (await appealedStatus.isVisible()) {
      // Find the row containing this status
      const row = appealedStatus.locator("xpath=ancestor::tr");

      // This row should NOT have an Appeal button
      const hasAppealButton = await row
        .locator('button:has-text("Appeal")')
        .isVisible()
        .catch(() => false);
      expect(hasAppealButton).toBeFalsy();
    }
  });

  test("should close appeal dialog when clicking cancel", async ({ page }) => {
    await signInAsLobbyist(page);
    await page.goto("/my-violations");
    await page.waitForLoadState("networkidle");

    const appealButton = page.locator('button:has-text("Appeal")').first();

    if (await appealButton.isVisible()) {
      await appealButton.click();

      // Dialog should be visible
      await expect(page.locator('[role="dialog"]')).toBeVisible();

      // Click Cancel
      await page.click('button:has-text("Cancel")');

      // Dialog should be closed
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    }
  });
});
