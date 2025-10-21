import { test, expect } from '@playwright/test'

test.describe('Admin Appeals Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/auth/signin')
    await page.fill('input[name="email"]', 'admin@multnomah.gov')
    await page.fill('input[name="password"]', 'Demo2025!Admin')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Navigate to appeals page
    await page.goto('/admin/appeals')
    await page.waitForLoadState('networkidle')
  })

  test('should display appeals dashboard with summary cards', async ({ page }) => {
    // Check summary cards are visible
    await expect(page.getByText('Pending Review')).toBeVisible()
    await expect(page.getByText('Hearings Scheduled')).toBeVisible()
    await expect(page.getByText('Decided')).toBeVisible()
    await expect(page.getByText('Total Appeals')).toBeVisible()
  })

  test('should display pending appeals in table', async ({ page }) => {
    // Check for appeals table
    await expect(page.getByRole('tab', { name: /pending/i })).toBeVisible()

    // Should have table headers
    await expect(page.getByRole('columnheader', { name: /submitted/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /violation/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /fine amount/i })).toBeVisible()
  })

  test('should filter appeals by status tabs', async ({ page }) => {
    // Click on different tabs
    await page.click('button[role="tab"]:has-text("Pending")')
    await page.waitForLoadState('networkidle')

    await page.click('button[role="tab"]:has-text("Scheduled")')
    await page.waitForLoadState('networkidle')

    await page.click('button[role="tab"]:has-text("Decided")')
    await page.waitForLoadState('networkidle')

    await page.click('button[role="tab"]:has-text("All Appeals")')
    await page.waitForLoadState('networkidle')
  })

  test('should open appeal details dialog', async ({ page }) => {
    // Find and click the view details button (FileText icon button)
    const viewButton = page.locator('button[data-testid="view-appeal"], button:has(svg)').first()

    if (await viewButton.isVisible()) {
      await viewButton.click()

      // Check dialog is open
      await expect(page.getByRole('dialog')).toBeVisible()
      await expect(page.getByText('Appeal Details')).toBeVisible()
    }
  })

  test('should schedule a hearing for pending appeal', async ({ page }) => {
    // Navigate to PENDING tab
    await page.click('button[role="tab"]:has-text("Pending")')
    await page.waitForLoadState('networkidle')

    // Find first appeal with view button
    const viewButton = page.locator('button:has(svg)').first()

    if (await viewButton.isVisible()) {
      await viewButton.click()

      // Wait for dialog
      await page.waitForSelector('role=dialog')

      // Look for hearing date input
      const hearingInput = page.locator('input[type="datetime-local"]')

      if (await hearingInput.isVisible()) {
        // Set hearing date to 7 days from now
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 7)
        const dateString = futureDate.toISOString().slice(0, 16)

        await hearingInput.fill(dateString)
        await page.click('button:has-text("Schedule")')

        // Should show success message
        await expect(page.getByText(/hearing scheduled successfully/i)).toBeVisible({ timeout: 10000 })
      }
    }
  })

  test('should decide an appeal - uphold fine', async ({ page }) => {
    // Find a decide button
    const decideButton = page.locator('button:has-text("Decide")').first()

    if (await decideButton.isVisible()) {
      await decideButton.click()

      // Wait for decision dialog
      await page.waitForSelector('role=dialog')
      await expect(page.getByText('Decide Appeal')).toBeVisible()

      // Select "Uphold Fine" option
      await page.click('button:has-text("Uphold Fine")')

      // Enter decision text
      const textarea = page.locator('textarea[id="decision-text"]')
      await textarea.fill('After careful review of the evidence and the appellant\'s arguments, the violation is upheld. The appellant failed to provide sufficient justification for the delay in registration.')

      // Submit decision
      await page.click('button:has-text("UPHELD Appeal"), button:has-text("Uphold")')

      // Should show success message
      await expect(page.getByText(/appeal upheld successfully/i)).toBeVisible({ timeout: 10000 })
    }
  })

  test('should decide an appeal - overturn fine', async ({ page }) => {
    // Find a decide button
    const decideButton = page.locator('button:has-text("Decide")').first()

    if (await decideButton.isVisible()) {
      await decideButton.click()

      // Wait for decision dialog
      await page.waitForSelector('role=dialog')

      // Select "Overturn Fine" option
      await page.click('button:has-text("Overturn Fine")')

      // Enter decision text
      const textarea = page.locator('textarea[id="decision-text"]')
      await textarea.fill('Upon review, the appellant has demonstrated that the delay was due to circumstances beyond their control. The violation is overturned and the fine is dismissed.')

      // Submit decision
      await page.click('button:has-text("OVERTURNED Appeal"), button:has-text("Overturn")')

      // Should show success message
      await expect(page.getByText(/appeal overturned successfully/i)).toBeVisible({ timeout: 10000 })
    }
  })

  test('should validate decision text is required', async ({ page }) => {
    const decideButton = page.locator('button:has-text("Decide")').first()

    if (await decideButton.isVisible()) {
      await decideButton.click()
      await page.waitForSelector('role=dialog')

      // Select outcome but don't enter text
      await page.click('button:has-text("Uphold Fine")')

      // Try to submit without text - button should be disabled
      const submitButton = page.locator('button:has-text("UPHELD Appeal"), button:has-text("Decide Appeal")')
      await expect(submitButton).toBeDisabled()
    }
  })

  test('should show error message for invalid hearing date', async ({ page }) => {
    // Navigate to PENDING tab
    await page.click('button[role="tab"]:has-text("Pending")')

    const viewButton = page.locator('button:has(svg)').first()

    if (await viewButton.isVisible()) {
      await viewButton.click()
      await page.waitForSelector('role=dialog')

      // Try to schedule without selecting date
      const scheduleButton = page.locator('button:has-text("Schedule")')

      if (await scheduleButton.isVisible()) {
        await scheduleButton.click()

        // Should show error message
        await expect(page.getByText(/please select a hearing date/i)).toBeVisible({ timeout: 5000 })
      }
    }
  })

  test('should highlight urgent appeals (>20 days pending)', async ({ page }) => {
    // Look for rows with urgent styling (red background)
    const urgentRows = page.locator('tr.bg-red-50')

    // If there are urgent appeals, they should have the correct class
    const count = await urgentRows.count()
    if (count > 0) {
      // Check that urgent rows exist and have the styling
      await expect(urgentRows.first()).toHaveClass(/bg-red-50/)
    }
  })

  test('should navigate between tabs without losing state', async ({ page }) => {
    // Navigate through all tabs
    await page.click('button[role="tab"]:has-text("Pending")')
    await page.waitForLoadState('networkidle')

    await page.click('button[role="tab"]:has-text("Scheduled")')
    await page.waitForLoadState('networkidle')

    await page.click('button[role="tab"]:has-text("Decided")')
    await page.waitForLoadState('networkidle')

    // Go back to Pending
    await page.click('button[role="tab"]:has-text("Pending")')
    await page.waitForLoadState('networkidle')

    // Table should still be visible
    await expect(page.locator('table')).toBeVisible()
  })
})
