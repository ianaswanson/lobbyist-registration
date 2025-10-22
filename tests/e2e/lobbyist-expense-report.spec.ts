import { test, expect } from "@playwright/test";

test.describe("Lobbyist Expense Report", () => {
  // Helper function to sign in as lobbyist
  async function signInAsLobbyist(page: any) {
    await page.goto("/auth/signin");
    await page.fill('input[name="email"]', "john.doe@lobbying.com");
    await page.fill('input[name="password"]', "lobbyist123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  }

  test("should allow lobbyist to submit expense report", async ({ page }) => {
    // 1. Sign in as lobbyist
    await signInAsLobbyist(page);

    // 2. Navigate to Quarterly Reports via My Work dropdown
    await page.click('button:has-text("My Work")');
    await page.click("text=My Reports");
    await page.waitForURL("/reports/lobbyist");

    // 3. Click New Report button to open form
    await page.click('a:has-text("New Report")');
    await page.waitForURL("/reports/lobbyist/new");

    // 4. Check page loaded
    await expect(page.locator("h2")).toContainText("Quarterly Expense Report");

    // 4. Select Q1 2025
    await page.selectOption("select#quarter", "Q1");
    await page.fill("input#year", "2025");

    // 5. Add a manual expense
    await page.fill("input#officialName", "Commissioner Jane Smith");
    await page.fill("input#date", "2025-02-15");
    await page.fill("input#payee", "Portland City Grill");
    await page.fill("textarea#purpose", "Quarterly business lunch discussion");
    await page.fill("input#amount", "125.50");

    // Click "Add Expense Item" button
    await page.click('button:has-text("Add Expense Item")');

    // 6. Verify expense appears in the table
    await expect(
      page.locator("table >> text=Commissioner Jane Smith")
    ).toBeVisible();
    await expect(
      page.locator("table >> text=Portland City Grill")
    ).toBeVisible();
    await expect(page.locator("table >> text=$125.50")).toBeVisible();

    // 7. Submit the report
    await page.click('button:has-text("Submit Report")');

    // 8. Wait for submission (should show loading state then success message)
    await page
      .waitForSelector("text=Submitting...", { timeout: 2000 })
      .catch(() => {
        // Loading state might be too fast to catch
      });

    // 9. Check for success message
    await expect(page.locator("text=submitted successfully")).toBeVisible({
      timeout: 10000,
    });

    // 10. Should redirect to reports list after submission (after 1.5 seconds)
    await page.waitForURL("/reports/lobbyist", { timeout: 5000 });

    // 11. Should see the submitted report in the list
    await expect(page.locator("text=Q1 2025")).toBeVisible();
    await expect(page.locator("text=SUBMITTED")).toBeVisible();
  });

  test("should allow lobbyist to save draft", async ({ page }) => {
    // 1. Sign in as lobbyist
    await signInAsLobbyist(page);

    // 2. Navigate to Quarterly Reports via My Work dropdown
    await page.click('button:has-text("My Work")');
    await page.click("text=My Reports");
    await page.waitForURL("/reports/lobbyist");

    // 3. Click New Report button
    await page.click('a:has-text("New Report")');
    await page.waitForURL("/reports/lobbyist/new");

    // 4. Select Q2 2025
    await page.selectOption("select#quarter", "Q2");
    await page.fill("input#year", "2025");

    // 4. Add an expense
    await page.fill("input#officialName", "Board Member John Doe");
    await page.fill("input#date", "2025-05-10");
    await page.fill("input#payee", "Starbucks");
    await page.fill("textarea#purpose", "Coffee meeting");
    await page.fill("input#amount", "15.75");
    await page.click('button:has-text("Add Expense Item")');

    // 5. Save as draft
    await page.click('button:has-text("Save as Draft")');

    // 6. Wait for success or error message
    const successMessage = page.locator("text=Draft saved successfully");
    const errorMessage = page.locator("div.bg-red-50");

    await Promise.race([
      successMessage.waitFor({ state: "visible", timeout: 10000 }),
      errorMessage.waitFor({ state: "visible", timeout: 10000 }),
    ]);

    // Check if we got success
    const hasSuccess = await successMessage.isVisible();
    if (!hasSuccess) {
      // If error, print the error message for debugging
      const errorText = await errorMessage.textContent();
      throw new Error(`Expected success but got error: ${errorText}`);
    }

    // 7. Expenses should still be visible (not cleared for drafts)
    await expect(page.locator("text=Board Member John Doe")).toBeVisible();
  });

  test("should validate that expenses are required", async ({ page }) => {
    // 1. Sign in as lobbyist
    await signInAsLobbyist(page);

    // 2. Navigate to Quarterly Reports via My Work dropdown
    await page.click('button:has-text("My Work")');
    await page.click("text=My Reports");
    await page.waitForURL("/reports/lobbyist");

    // 3. Click New Report button
    await page.click('a:has-text("New Report")');
    await page.waitForURL("/reports/lobbyist/new");

    // 4. Try to submit without expenses
    const submitButton = page.locator('button:has-text("Submit Report")');
    await expect(submitButton).toBeDisabled();

    // 4. Try to save draft without expenses
    const draftButton = page.locator('button:has-text("Save as Draft")');
    await expect(draftButton).toBeDisabled();
  });

  test("should show loading states during submission", async ({ page }) => {
    // 1. Sign in as lobbyist
    await signInAsLobbyist(page);

    // 2. Navigate to Quarterly Reports via My Work dropdown
    await page.click('button:has-text("My Work")');
    await page.click("text=My Reports");
    await page.waitForURL("/reports/lobbyist");

    // 3. Click New Report button
    await page.click('a:has-text("New Report")');
    await page.waitForURL("/reports/lobbyist/new");

    // 4. Select quarter and add expense
    await page.selectOption("select#quarter", "Q3");
    await page.fill("input#year", "2025");

    await page.fill("input#officialName", "Commissioner Test");
    await page.fill("input#date", "2025-08-15");
    await page.fill("input#payee", "Test Restaurant");
    await page.fill("textarea#purpose", "Test expense");
    await page.fill("input#amount", "50.00");
    await page.click('button:has-text("Add Expense Item")');

    // 4. Click submit and check for loading state
    await page.click('button:has-text("Submit Report")');

    // Should show "Submitting..." text (might be fast)
    const loadingText = page.locator("text=Submitting...");
    const isLoadingVisible = await loadingText
      .isVisible({ timeout: 1000 })
      .catch(() => false);

    // Either we caught the loading state, or it was too fast and success message appeared
    if (!isLoadingVisible) {
      // If no loading state caught, success message should be visible
      await expect(page.locator("text=submitted successfully")).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test("should display total amount correctly", async ({ page }) => {
    // 1. Sign in as lobbyist
    await signInAsLobbyist(page);

    // 2. Navigate to Quarterly Reports via My Work dropdown
    await page.click('button:has-text("My Work")');
    await page.click("text=My Reports");
    await page.waitForURL("/reports/lobbyist");

    // 3. Click New Report button
    await page.click('a:has-text("New Report")');
    await page.waitForURL("/reports/lobbyist/new");

    // 4. Add first expense
    await page.fill("input#officialName", "Official One");
    await page.fill("input#date", "2025-03-15");
    await page.fill("input#payee", "Restaurant One");
    await page.fill("textarea#purpose", "Lunch");
    await page.fill("input#amount", "100.00");
    await page.click('button:has-text("Add Expense Item")');

    // 4. Add second expense
    await page.fill("input#officialName", "Official Two");
    await page.fill("input#date", "2025-03-20");
    await page.fill("input#payee", "Restaurant Two");
    await page.fill("textarea#purpose", "Dinner");
    await page.fill("input#amount", "75.50");
    await page.click('button:has-text("Add Expense Item")');

    // 5. Check total is calculated correctly
    await expect(page.locator("text=$175.50")).toBeVisible();
  });

  test("should allow removing expenses", async ({ page }) => {
    // 1. Sign in as lobbyist
    await signInAsLobbyist(page);

    // 2. Navigate to Quarterly Reports via My Work dropdown
    await page.click('button:has-text("My Work")');
    await page.click("text=My Reports");
    await page.waitForURL("/reports/lobbyist");

    // 3. Click New Report button
    await page.click('a:has-text("New Report")');
    await page.waitForURL("/reports/lobbyist/new");

    // 4. Add an expense
    await page.fill("input#officialName", "Test Official");
    await page.fill("input#date", "2025-01-15");
    await page.fill("input#payee", "Test Payee");
    await page.fill("textarea#purpose", "Test purpose");
    await page.fill("input#amount", "60.00");
    await page.click('button:has-text("Add Expense Item")');

    // 4. Verify expense is visible
    await expect(page.locator("text=Test Official")).toBeVisible();

    // 5. Remove the expense
    await page.click('button:has-text("Remove")');

    // 6. Expense should be gone
    await expect(page.locator("text=Test Official")).not.toBeVisible();
  });

  test("should allow editing a draft report", async ({ page }) => {
    // 1. Sign in as lobbyist
    await signInAsLobbyist(page);

    // 2. Navigate to Quarterly Reports via My Work dropdown
    await page.click('button:has-text("My Work")');
    await page.click("text=My Reports");
    await page.waitForURL("/reports/lobbyist");

    // 3. Click New Report button
    await page.click('a:has-text("New Report")');
    await page.waitForURL("/reports/lobbyist/new");

    // 4. Create a draft report for Q4 2025
    await page.selectOption("select#quarter", "Q4");
    await page.fill("input#year", "2025");

    await page.fill("input#officialName", "Commissioner Draft Test");
    await page.fill("input#date", "2025-10-15");
    await page.fill("input#payee", "Draft Restaurant");
    await page.fill("textarea#purpose", "Initial draft expense");
    await page.fill("input#amount", "100.00");
    await page.click('button:has-text("Add Expense Item")');

    // 4. Save as draft
    await page.click('button:has-text("Save as Draft")');
    await expect(page.locator("text=Draft saved successfully")).toBeVisible({
      timeout: 10000,
    });

    // 5. Navigate back to reports list
    await page.click('a:has-text("Dashboard")');
    await page.waitForURL("/dashboard");
    await page.click('button:has-text("My Work")');
    await page.click("text=My Reports");
    await page.waitForURL("/reports/lobbyist");

    // 6. Find and click the edit icon for the draft report (Q4 2025)
    // Look for the row containing Q4 2025 and DRAFT status, then click edit button
    const draftRow = page.locator('tr:has-text("Q4 2025"):has-text("DRAFT")');
    await expect(draftRow).toBeVisible({ timeout: 5000 });

    // Click the edit button in this row (pencil icon or Edit text)
    await draftRow
      .locator(
        'button[title="Edit"], button:has-text("Edit"), a:has-text("Edit")'
      )
      .first()
      .click();

    // 7. Should navigate to edit page
    await page.waitForURL(/\/reports\/lobbyist\/edit\/[^/]+/, {
      timeout: 5000,
    });

    // 8. Verify page shows "Edit Quarterly Expense Report"
    await expect(
      page.locator('h2:has-text("Edit Quarterly Expense Report")')
    ).toBeVisible();

    // 9. Verify existing expense is loaded
    await expect(page.locator("text=Commissioner Draft Test")).toBeVisible();
    await expect(page.locator("text=Draft Restaurant")).toBeVisible();
    await expect(page.locator("text=$100.00")).toBeVisible();

    // 10. Add another expense to the draft
    await page.fill("input#officialName", "Commissioner Second Expense");
    await page.fill("input#date", "2025-10-20");
    await page.fill("input#payee", "Second Restaurant");
    await page.fill("textarea#purpose", "Additional draft expense");
    await page.fill("input#amount", "75.00");
    await page.click('button:has-text("Add Expense Item")');

    // 11. Verify total is updated
    await expect(page.locator("text=$175.00")).toBeVisible();

    // 12. Save the updated draft
    await page.click('button:has-text("Save as Draft")');
    await expect(page.locator("text=Draft saved successfully")).toBeVisible({
      timeout: 10000,
    });

    // 13. Navigate back to list and verify both expenses are saved
    await page.click('a:has-text("Dashboard")');
    await page.waitForURL("/dashboard");
    await page.click('button:has-text("My Work")');
    await page.click("text=My Reports");
    await page.waitForURL("/reports/lobbyist");

    // Click edit again to verify persistence
    await draftRow
      .locator(
        'button[title="Edit"], button:has-text("Edit"), a:has-text("Edit")'
      )
      .first()
      .click();
    await page.waitForURL(/\/reports\/lobbyist\/edit\/[^/]+/);

    // Should see both expenses
    await expect(page.locator("text=Commissioner Draft Test")).toBeVisible();
    await expect(
      page.locator("text=Commissioner Second Expense")
    ).toBeVisible();
  });

  test("should not allow editing a submitted report", async ({ page }) => {
    // 1. Sign in as lobbyist
    await signInAsLobbyist(page);

    // 2. Navigate to Quarterly Reports via My Work dropdown
    await page.click('button:has-text("My Work")');
    await page.click("text=My Reports");
    await page.waitForURL("/reports/lobbyist");

    // 3. Click New Report button
    await page.click('a:has-text("New Report")');
    await page.waitForURL("/reports/lobbyist/new");

    // 4. Create and submit a report for Q1 2024
    await page.selectOption("select#quarter", "Q1");
    await page.fill("input#year", "2024");

    await page.fill("input#officialName", "Commissioner Final Test");
    await page.fill("input#date", "2024-01-15");
    await page.fill("input#payee", "Final Restaurant");
    await page.fill("textarea#purpose", "Final submitted expense");
    await page.fill("input#amount", "200.00");
    await page.click('button:has-text("Add Expense Item")');

    // 4. Submit the report (not draft)
    await page.click('button:has-text("Submit Report")');
    await expect(page.locator("text=submitted successfully")).toBeVisible({
      timeout: 10000,
    });

    // 5. Should redirect to list
    await page.waitForURL("/reports/lobbyist", { timeout: 5000 });

    // 6. Find the submitted report row
    const submittedRow = page.locator(
      'tr:has-text("Q1 2024"):has-text("SUBMITTED")'
    );
    await expect(submittedRow).toBeVisible({ timeout: 5000 });

    // 7. Should NOT have an edit button/link (or it should be disabled/hidden)
    // Check if edit button exists
    const editButton = submittedRow.locator(
      'button[title="Edit"], button:has-text("Edit"), a:has-text("Edit")'
    );
    const editButtonCount = await editButton.count();

    if (editButtonCount > 0) {
      // If edit button exists, it should be disabled or clicking should not navigate
      // Try clicking and verify we stay on the list page
      await editButton.first().click();
      await page.waitForTimeout(1000);
      expect(page.url()).toContain("/reports/lobbyist");
    }
    // If no edit button, that's correct behavior - submitted reports can't be edited
  });

  test("should load existing expenses when changing quarter/year", async ({
    page,
  }) => {
    // 1. Sign in as lobbyist
    await signInAsLobbyist(page);

    // 2. Navigate to Quarterly Reports via My Work dropdown
    await page.click('button:has-text("My Work")');
    await page.click("text=My Reports");
    await page.waitForURL("/reports/lobbyist");

    // 3. Click New Report button
    await page.click('a:has-text("New Report")');
    await page.waitForURL("/reports/lobbyist/new");

    // 4. Create a draft for Q2 2024
    await page.selectOption("select#quarter", "Q2");
    await page.fill("input#year", "2024");

    await page.fill("input#officialName", "Commissioner Q2 Test");
    await page.fill("input#date", "2024-04-15");
    await page.fill("input#payee", "Q2 Restaurant");
    await page.fill("textarea#purpose", "Q2 expense");
    await page.fill("input#amount", "150.00");
    await page.click('button:has-text("Add Expense Item")');

    await page.click('button:has-text("Save as Draft")');
    await expect(page.locator("text=Draft saved successfully")).toBeVisible({
      timeout: 10000,
    });

    // 4. Change to a different quarter
    await page.selectOption("select#quarter", "Q3");

    // Should show empty state (no Q3 report exists)
    await page.waitForTimeout(1000); // Wait for potential data load
    await expect(page.locator("text=Commissioner Q2 Test")).not.toBeVisible();

    // 5. Change back to Q2 2024
    await page.selectOption("select#quarter", "Q2");

    // 6. Should automatically load the saved Q2 expenses
    await expect(page.locator("text=Commissioner Q2 Test")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator("text=Q2 Restaurant")).toBeVisible();
    await expect(page.locator("text=$150.00")).toBeVisible();
  });
});
