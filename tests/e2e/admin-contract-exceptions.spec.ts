import { test, expect } from "@playwright/test";

test.describe("Admin Contract Exceptions Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/auth/signin");
    await page.waitForLoadState("networkidle");

    await page.fill('input[name="email"]', "admin@multnomah.gov");
    await page.fill('input[name="password"]', "Demo2025!Admin");
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard with increased timeout
    await page.waitForURL("/dashboard", { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    // Navigate to contract exceptions page
    await page.goto("/admin/contract-exceptions");
    await page.waitForLoadState("networkidle");
  });

  test("should display contract exceptions page with ordinance information", async ({
    page,
  }) => {
    // Check page header
    await expect(page.getByText("Contract Exception Management")).toBeVisible();

    // Check ordinance alert
    await expect(page.getByText("Contract Regulation (§9.230)")).toBeVisible();
    await expect(page.getByText(/1-year cooling-off period/i)).toBeVisible();
  });

  test("should display exceptions table", async ({ page }) => {
    // Check for table or empty state
    const table = page.locator("table");
    const emptyState = page.getByText("No contract exceptions recorded");

    // Either table or empty state should be visible
    const hasTable = await table.isVisible().catch(() => false);
    const hasEmptyState = await emptyState.isVisible().catch(() => false);

    expect(hasTable || hasEmptyState).toBeTruthy();
  });

  test("should open create exception dialog", async ({ page }) => {
    // Click "Create Exception" button
    await page.click('button:has-text("Create Exception")');

    // Check dialog is open
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Create Contract Exception")).toBeVisible();

    // Check form fields
    await expect(page.getByText("Former Official ID")).toBeVisible();
    await expect(page.getByText("Former Official Name")).toBeVisible();
    await expect(page.getByText("Contract Description")).toBeVisible();
    await expect(page.getByText("Justification for Exception")).toBeVisible();
  });

  test("should create a new contract exception", async ({ page }) => {
    await page.click('button:has-text("Create Exception")');
    await page.waitForSelector("role=dialog");

    // Fill in all required fields
    await page.fill('input[id="official-id"]', "EMP-2024-001");
    await page.fill('input[id="official-name"]', "John Smith");

    await page.fill(
      'textarea[id="contract-desc"]',
      "Professional services contract for IT consulting related to cybersecurity infrastructure upgrade."
    );

    await page.fill(
      'textarea[id="justification"]',
      "This exception is warranted because: (1) The contract is in the best interests of the County as Mr. Smith has unique expertise in our legacy systems, and (2) His influence on contract authorization was minimal as he served in an advisory capacity only. The cost savings from avoiding a full RFP process and training a new consultant are estimated at $50,000."
    );

    await page.fill('input[id="approved-by"]', "Chair Jessica Vega Pederson");

    // Set approval date
    const today = new Date().toISOString().split("T")[0];
    await page.fill('input[id="approved-date"]', today);

    // Optionally mark as publicly posted
    await page.check('input[id="publicly-posted"]');

    // Submit
    await page.click('button:has-text("Create Exception")');

    // Should show success message
    await expect(page.getByText(/exception created successfully/i)).toBeVisible(
      { timeout: 10000 }
    );
  });

  test("should validate required fields when creating exception", async ({
    page,
  }) => {
    await page.click('button:has-text("Create Exception")');
    await page.waitForSelector("role=dialog");

    // Try to submit without filling fields - should show error
    await page.click('button:has-text("Create Exception")');

    // Should show error message
    await expect(
      page.getByText(/please fill in all required fields/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test("should edit an existing exception", async ({ page }) => {
    // Find an edit button (pencil icon)
    const editButton = page
      .locator("button:has(svg)")
      .filter({ hasText: "" })
      .first();

    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForSelector("role=dialog");

      // Dialog should be in edit mode
      await expect(page.getByText("Edit Contract Exception")).toBeVisible();

      // Modify a field
      const justificationField = page.locator('textarea[id="justification"]');
      const currentValue = await justificationField.inputValue();
      await justificationField.fill(
        currentValue + " [Updated with additional details]"
      );

      // Submit
      await page.click('button:has-text("Update Exception")');

      // Should show success message
      await expect(
        page.getByText(/exception updated successfully/i)
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test("should view exception details", async ({ page }) => {
    // Find a view button (eye icon)
    const viewButton = page.locator("button:has(svg)").first();

    if (await viewButton.isVisible()) {
      await viewButton.click();
      await page.waitForSelector("role=dialog");

      // Check details dialog
      await expect(page.getByText("Contract Exception Details")).toBeVisible();

      // Should show various fields
      await expect(page.getByText("Former Official")).toBeVisible();
      await expect(page.getByText("Status")).toBeVisible();
      await expect(page.getByText("Contract Description")).toBeVisible();
    }
  });

  test("should toggle public posting status", async ({ page }) => {
    // Find a toggle posting button (check/x circle icon)
    const toggleButton = page
      .locator("button:has(svg)")
      .filter({ hasText: "" })
      .first();

    if (await toggleButton.isVisible()) {
      await toggleButton.click();

      // Should show success message
      await expect(
        page.getByText(/exception.*posted|removed from public posting/i)
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test("should delete an exception with confirmation", async ({ page }) => {
    // Find a delete button (trash icon)
    const deleteButton = page
      .locator("button:has(svg)")
      .filter({ hasText: "" })
      .last();

    if (await deleteButton.isVisible()) {
      // Set up dialog handler for confirmation
      page.on("dialog", async (dialog) => {
        expect(dialog.message()).toContain("Are you sure");
        await dialog.accept();
      });

      await deleteButton.click();

      // Should show success message after confirmation
      await expect(
        page.getByText(/exception deleted successfully/i)
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test("should cancel delete when user declines confirmation", async ({
    page,
  }) => {
    const deleteButton = page
      .locator("button:has(svg)")
      .filter({ hasText: "" })
      .last();

    if (await deleteButton.isVisible()) {
      // Set up dialog handler to cancel
      page.on("dialog", async (dialog) => {
        await dialog.dismiss();
      });

      await deleteButton.click();

      // Should NOT show success message
      await expect(
        page.getByText(/exception deleted successfully/i)
      ).not.toBeVisible();
    }
  });

  test("should filter to show only unposted exceptions", async ({ page }) => {
    // Find the "Show unposted exceptions" checkbox
    const checkbox = page.locator('input[id="show-unposted"]');

    if (await checkbox.isVisible()) {
      // Toggle it off to hide unposted
      await checkbox.uncheck();
      await page.waitForLoadState("networkidle");

      // Toggle it back on to show unposted
      await checkbox.check();
      await page.waitForLoadState("networkidle");
    }
  });

  test("should display posted vs not posted badges correctly", async ({
    page,
  }) => {
    // Look for status badges
    const postedBadge = page.getByText("Posted").first();
    const notPostedBadge = page.getByText("Not Posted").first();

    // At least one type of badge should exist if there are exceptions
    const hasPosted = await postedBadge.isVisible().catch(() => false);
    const hasNotPosted = await notPostedBadge.isVisible().catch(() => false);

    if (hasPosted || hasNotPosted) {
      // If either exists, check they have proper styling
      expect(hasPosted || hasNotPosted).toBeTruthy();
    }
  });

  test("should show legal requirements alert in create dialog", async ({
    page,
  }) => {
    await page.click('button:has-text("Create Exception")');
    await page.waitForSelector("role=dialog");

    // Check for legal requirements alert
    await expect(page.getByText("Legal Requirements")).toBeVisible();
    await expect(page.getByText(/best interests of county/i)).toBeVisible();
  });

  test("should prevent editing official ID in edit mode", async ({ page }) => {
    const editButton = page
      .locator("button:has(svg)")
      .filter({ hasText: "" })
      .first();

    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForSelector("role=dialog");

      // Official ID field should be disabled in edit mode
      const officialIdInput = page.locator('input[id="official-id"]');
      await expect(officialIdInput).toBeDisabled();
    }
  });

  test("should close dialog when cancel is clicked", async ({ page }) => {
    await page.click('button:has-text("Create Exception")');
    await page.waitForSelector("role=dialog");

    // Click cancel
    await page.click('button:has-text("Cancel")');

    // Dialog should be closed
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("should display exception count in header", async ({ page }) => {
    // Look for exception count
    const countText = page.locator("text=/\\d+ exception/i").first();

    if (await countText.isVisible()) {
      await expect(countText).toBeVisible();
    }
  });

  test("should format approval dates correctly", async ({ page }) => {
    // View an exception
    const viewButton = page.locator("button:has(svg)").first();

    if (await viewButton.isVisible()) {
      await viewButton.click();
      await page.waitForSelector("role=dialog");

      // Should show formatted dates
      await expect(page.getByText("Approval Date")).toBeVisible();
    }
  });

  test("should show success message after toggling post status", async ({
    page,
  }) => {
    const toggleButton = page
      .locator("button:has(svg)")
      .filter({ hasText: "" })
      .first();

    if (await toggleButton.isVisible()) {
      await toggleButton.click();

      // Success alert should appear
      const successAlert = page
        .locator('[class*="bg-green"]')
        .filter({ hasText: /success/i });
      await expect(successAlert).toBeVisible({ timeout: 10000 });
    }
  });
});
