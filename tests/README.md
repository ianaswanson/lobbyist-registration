# E2E Testing with Playwright

This directory contains end-to-end tests for the Lobbyist Registration System using Playwright.

## Test Coverage

### 1. Authentication Tests (`auth.spec.ts`)
- Sign-in page display
- Demo credentials panel functionality
- Auto-fill credentials from demo accounts
- Successful login for different user roles (admin, lobbyist, employer, board member)
- Invalid credential handling

### 2. Navigation Tests (`navigation.spec.ts`)
- Admin navigation menu display
- Role-based menu items visibility
- User dropdown menu
- Navigation between pages
- Active navigation highlighting
- Sign-out functionality
- Public navigation on exemption checker and search pages

### 3. Demo Features Tests (`demo-features.spec.ts`)
- Demo files panel on board calendar page
- Demo files panel on lobbyist expenses page
- Demo files panel on employer expenses page
- File download functionality
- Demo guide button visibility across pages

### 4. User Workflow Tests (`user-workflows.spec.ts`)
- **Lobbyist workflow**: Registration form access and display
- **Expense reporting**: Multiple input modes (manual, CSV, paste)
- **Board member workflow**: Calendar and receipts submission
- **Admin workflow**: Compliance dashboard and metrics
- **Public workflows**: Exemption checker and search functionality

## Running Tests

### Run all tests (headless mode)
```bash
npm run test:e2e
```

### Run tests with browser visible
```bash
npm run test:e2e:headed
```

### Run tests with UI mode (interactive)
```bash
npm run test:e2e:ui
```

### View test report
```bash
npm run test:e2e:report
```

## Prerequisites

1. **Database**: Ensure the database is seeded with test data:
   ```bash
   npm run db:seed
   ```

2. **Dev Server**: Tests will automatically start the dev server, but you can also run it manually:
   ```bash
   npm run dev
   ```

## Test Data

The tests use the demo accounts created by the seed script:
- **Admin**: admin@multnomah.gov / admin123
- **Lobbyist**: lobbyist@example.com / lobbyist123
- **Employer**: employer@example.com / employer123
- **Board Member**: board@multnomah.gov / board123
- **Public**: public@example.com / public123

## Test Structure

Each test file follows this pattern:
1. **Setup**: Sign in with appropriate user role
2. **Action**: Navigate and interact with the page
3. **Assertion**: Verify expected behavior

## Continuous Integration

These tests are designed to run in CI environments:
- Playwright will run in headless mode
- Screenshots are captured on failure
- Test reports are generated in HTML format

## Debugging Failed Tests

1. **View screenshots**: Check `test-results/` directory for failure screenshots
2. **View trace**: Use `npx playwright show-trace trace.zip`
3. **Run in headed mode**: Use `npm run test:e2e:headed` to watch tests run
4. **Use UI mode**: Use `npm run test:e2e:ui` for step-by-step debugging

## Adding New Tests

When adding new tests:
1. Create a new `.spec.ts` file in `tests/e2e/`
2. Import test and expect from `@playwright/test`
3. Use `test.describe()` to group related tests
4. Use `test.beforeEach()` for common setup (like signing in)
5. Write descriptive test names that explain what is being tested

Example:
```typescript
import { test, expect } from '@playwright/test';

test.describe('New Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'admin@multnomah.gov');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    await page.goto('/some-page');
    await expect(page.locator('h1')).toContainText('Expected Text');
  });
});
```

## Best Practices

1. **Stable Selectors**: Use text-based selectors or data-testid attributes
2. **Wait for Navigation**: Always use `waitForURL()` after navigation actions
3. **Cleanup**: Tests should be independent and not rely on each other
4. **Descriptive Names**: Test names should clearly describe what is being tested
5. **Page Objects**: For complex pages, consider using Page Object pattern

## Known Issues

- Some tests may be flaky due to timing issues (we use appropriate waits to minimize this)
- File upload tests are not yet implemented (requires more complex setup)
- Some form submission tests are limited to checking page display rather than full submission flow
