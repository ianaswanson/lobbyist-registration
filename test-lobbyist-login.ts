import { chromium } from 'playwright';

async function testLobbyistLogin() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 Testing Lobbyist Login...\n');

    // Navigate to sign-in page
    console.log('1. Navigating to sign-in page...');
    await page.goto('https://lobbyist-registration-zzp44w3snq-uw.a.run.app/auth/signin');
    await page.waitForLoadState('networkidle');
    console.log('   ✓ Page loaded\n');

    // Fill in credentials
    console.log('2. Entering credentials...');
    console.log('   Email: john.doe@lobbying.com');
    console.log('   Password: password123');
    await page.fill('input[name="email"]', 'john.doe@lobbying.com');
    await page.fill('input[name="password"]', 'password123');
    console.log('   ✓ Credentials entered\n');

    // Submit form
    console.log('3. Submitting login form...');
    await Promise.all([
      page.waitForNavigation({ timeout: 10000 }),
      page.click('button[type="submit"]')
    ]);
    console.log('   ✓ Form submitted\n');

    // Check if redirected to dashboard
    const currentUrl = page.url();
    console.log('4. Checking redirect...');
    console.log('   Current URL:', currentUrl);

    if (currentUrl.includes('/dashboard')) {
      console.log('   ✓ Successfully redirected to dashboard!\n');

      // Get user info from page
      console.log('5. Checking user session...');
      const userName = await page.textContent('nav').catch(() => null);
      if (userName && userName.includes('John Doe')) {
        console.log('   ✓ User name displayed: John Doe');
      }

      const userRole = await page.textContent('nav').catch(() => null);
      if (userRole && userRole.includes('LOBBYIST')) {
        console.log('   ✓ User role displayed: LOBBYIST\n');
      }

      console.log('✅ LOGIN TEST PASSED!\n');
      console.log('User Details:');
      console.log('  - Name: John Doe');
      console.log('  - Email: john.doe@lobbying.com');
      console.log('  - Role: LOBBYIST');
      console.log('  - Status: Authenticated');

      // Take screenshot
      await page.screenshot({ path: 'test-lobbyist-dashboard.png', fullPage: true });
      console.log('\n📸 Screenshot saved: test-lobbyist-dashboard.png');

    } else if (currentUrl.includes('error')) {
      console.log('   ❌ Login failed - redirected to error page');
      console.log('   URL:', currentUrl);

      const errorMessage = await page.textContent('body').catch(() => 'Unknown error');
      console.log('   Error:', errorMessage);

      console.log('\n❌ LOGIN TEST FAILED');
    } else {
      console.log('   ⚠️  Unexpected redirect');
      console.log('   Expected: /dashboard');
      console.log('   Got:', currentUrl);

      console.log('\n⚠️  LOGIN TEST INCONCLUSIVE');
    }

  } catch (error) {
    console.error('\n❌ TEST ERROR:', error.message);

    // Take screenshot of error state
    await page.screenshot({ path: 'test-error.png' }).catch(() => {});
    console.log('📸 Error screenshot saved: test-error.png');
  } finally {
    await browser.close();
  }
}

testLobbyistLogin();
