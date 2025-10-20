import { test, expect } from '@playwright/test';

test.describe('Lobbyist Expense Report', () => {
  // Helper function to sign in as lobbyist
  async function signInAsLobbyist(page: any) {
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'john.doe@lobbying.com');
    await page.fill('input[name="password"]', 'lobbyist123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  }

  test('should allow lobbyist to submit expense report', async ({ page }) => {
    // 1. Sign in as lobbyist
    await signInAsLobbyist(page);

    // 2. Navigate to Quarterly Reports
    await page.click('text=Quarterly Reports');
    await page.waitForURL('/reports/lobbyist');

    // 3. Check page loaded
    await expect(page.locator('h2')).toContainText('Quarterly Expense Report');

    // 4. Select Q1 2025
    await page.selectOption('select#quarter', 'Q1');
    await page.fill('input#year', '2025');

    // 5. Add a manual expense
    await page.fill('input#officialName', 'Commissioner Jane Smith');
    await page.fill('input#date', '2025-02-15');
    await page.fill('input#payee', 'Portland City Grill');
    await page.fill('textarea#purpose', 'Quarterly business lunch discussion');
    await page.fill('input#amount', '125.50');

    // Click "Add Expense Item" button
    await page.click('button:has-text("Add Expense Item")');

    // 6. Verify expense appears in the table
    await expect(page.locator('table >> text=Commissioner Jane Smith')).toBeVisible();
    await expect(page.locator('table >> text=Portland City Grill')).toBeVisible();
    await expect(page.locator('table >> text=$125.50')).toBeVisible();

    // 7. Submit the report
    await page.click('button:has-text("Submit Report")');

    // 8. Wait for submission (should show loading state then success message)
    await page.waitForSelector('text=Submitting...', { timeout: 2000 }).catch(() => {
      // Loading state might be too fast to catch
    });

    // 9. Check for success message
    await expect(page.locator('text=submitted successfully')).toBeVisible({ timeout: 10000 });

    // 10. Form should clear after successful submission
    await page.waitForTimeout(3500); // Wait for auto-clear
    const expenseTable = page.locator('table');
    await expect(expenseTable).not.toBeVisible();
  });

  test('should allow lobbyist to save draft', async ({ page }) => {
    // 1. Sign in as lobbyist
    await signInAsLobbyist(page);

    // 2. Navigate to Quarterly Reports
    await page.click('text=Quarterly Reports');
    await page.waitForURL('/reports/lobbyist');

    // 3. Select Q2 2025
    await page.selectOption('select#quarter', 'Q2');
    await page.fill('input#year', '2025');

    // 4. Add an expense
    await page.fill('input#officialName', 'Board Member John Doe');
    await page.fill('input#date', '2025-05-10');
    await page.fill('input#payee', 'Starbucks');
    await page.fill('textarea#purpose', 'Coffee meeting');
    await page.fill('input#amount', '15.75');
    await page.click('button:has-text("Add Expense Item")');

    // 5. Save as draft
    await page.click('button:has-text("Save as Draft")');

    // 6. Wait for success or error message
    const successMessage = page.locator('text=Draft saved successfully');
    const errorMessage = page.locator('div.bg-red-50');

    await Promise.race([
      successMessage.waitFor({ state: 'visible', timeout: 10000 }),
      errorMessage.waitFor({ state: 'visible', timeout: 10000 })
    ]);

    // Check if we got success
    const hasSuccess = await successMessage.isVisible();
    if (!hasSuccess) {
      // If error, print the error message for debugging
      const errorText = await errorMessage.textContent();
      throw new Error(`Expected success but got error: ${errorText}`);
    }

    // 7. Expenses should still be visible (not cleared for drafts)
    await expect(page.locator('text=Board Member John Doe')).toBeVisible();
  });

  test('should validate that expenses are required', async ({ page }) => {
    // 1. Sign in as lobbyist
    await signInAsLobbyist(page);

    // 2. Navigate to Quarterly Reports
    await page.click('text=Quarterly Reports');
    await page.waitForURL('/reports/lobbyist');

    // 3. Try to submit without expenses
    const submitButton = page.locator('button:has-text("Submit Report")');
    await expect(submitButton).toBeDisabled();

    // 4. Try to save draft without expenses
    const draftButton = page.locator('button:has-text("Save as Draft")');
    await expect(draftButton).toBeDisabled();
  });

  test('should show loading states during submission', async ({ page }) => {
    // 1. Sign in as lobbyist
    await signInAsLobbyist(page);

    // 2. Navigate to Quarterly Reports
    await page.click('text=Quarterly Reports');
    await page.waitForURL('/reports/lobbyist');

    // 3. Select quarter and add expense
    await page.selectOption('select#quarter', 'Q3');
    await page.fill('input#year', '2025');

    await page.fill('input#officialName', 'Commissioner Test');
    await page.fill('input#date', '2025-08-15');
    await page.fill('input#payee', 'Test Restaurant');
    await page.fill('textarea#purpose', 'Test expense');
    await page.fill('input#amount', '50.00');
    await page.click('button:has-text("Add Expense Item")');

    // 4. Click submit and check for loading state
    await page.click('button:has-text("Submit Report")');

    // Should show "Submitting..." text (might be fast)
    const loadingText = page.locator('text=Submitting...');
    const isLoadingVisible = await loadingText.isVisible({ timeout: 1000 }).catch(() => false);

    // Either we caught the loading state, or it was too fast and success message appeared
    if (!isLoadingVisible) {
      // If no loading state caught, success message should be visible
      await expect(page.locator('text=submitted successfully')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display total amount correctly', async ({ page }) => {
    // 1. Sign in as lobbyist
    await signInAsLobbyist(page);

    // 2. Navigate to Quarterly Reports
    await page.click('text=Quarterly Reports');
    await page.waitForURL('/reports/lobbyist');

    // 3. Add first expense
    await page.fill('input#officialName', 'Official One');
    await page.fill('input#date', '2025-03-15');
    await page.fill('input#payee', 'Restaurant One');
    await page.fill('textarea#purpose', 'Lunch');
    await page.fill('input#amount', '100.00');
    await page.click('button:has-text("Add Expense Item")');

    // 4. Add second expense
    await page.fill('input#officialName', 'Official Two');
    await page.fill('input#date', '2025-03-20');
    await page.fill('input#payee', 'Restaurant Two');
    await page.fill('textarea#purpose', 'Dinner');
    await page.fill('input#amount', '75.50');
    await page.click('button:has-text("Add Expense Item")');

    // 5. Check total is calculated correctly
    await expect(page.locator('text=$175.50')).toBeVisible();
  });

  test('should allow removing expenses', async ({ page }) => {
    // 1. Sign in as lobbyist
    await signInAsLobbyist(page);

    // 2. Navigate to Quarterly Reports
    await page.click('text=Quarterly Reports');
    await page.waitForURL('/reports/lobbyist');

    // 3. Add an expense
    await page.fill('input#officialName', 'Test Official');
    await page.fill('input#date', '2025-01-15');
    await page.fill('input#payee', 'Test Payee');
    await page.fill('textarea#purpose', 'Test purpose');
    await page.fill('input#amount', '60.00');
    await page.click('button:has-text("Add Expense Item")');

    // 4. Verify expense is visible
    await expect(page.locator('text=Test Official')).toBeVisible();

    // 5. Remove the expense
    await page.click('button:has-text("Remove")');

    // 6. Expense should be gone
    await expect(page.locator('text=Test Official')).not.toBeVisible();
  });
});
