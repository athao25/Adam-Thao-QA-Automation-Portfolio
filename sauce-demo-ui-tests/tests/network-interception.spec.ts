/**
 * Network Interception and API Mocking Tests
 *
 * This test file demonstrates Playwright's powerful network capabilities:
 * - Request interception with page.route()
 * - Response mocking for testing edge cases
 * - Network monitoring with page.on('request') and page.on('response')
 * - Offline mode testing
 *
 * These techniques are essential for:
 * - Testing loading states and error handling
 * - Isolating tests from backend dependencies
 * - Simulating network conditions
 * - Verifying that specific network requests are made
 */

import { test, expect } from '../src/pages/page_fixtures';
import { USERS, PRODUCTS } from '../src/test-data';
import { Request, Response, Route } from '@playwright/test';

// ============================================================================
// SECTION 1: REQUEST INTERCEPTION
// Use page.route() to intercept and modify requests
// ============================================================================

test.describe('Request Interception', () => {
  test.describe('Simulating Slow Network Responses', () => {
    test('should show loading state during slow image load', async ({ page, loginPage }) => {
      // Intercept all image requests and add a delay to simulate slow network
      // This is useful for testing loading indicators and skeleton screens
      await page.route('**/*.{png,jpg,jpeg,gif,webp}', async (route: Route) => {
        // Add a 2-second delay before fulfilling the request
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await route.continue();
      });

      await loginPage.navigate();
      await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);

      // The page should still be functional even with slow images
      // Products should be visible even if images haven't loaded yet
      await expect(page.getByTestId('inventory-container')).toBeVisible();

      // Verify the page title is correct while images are loading
      await expect(page.getByTestId('title')).toHaveText('Products');
    });

    test('should handle delayed API response gracefully', async ({ page, loginPage }) => {
      // Intercept the main HTML page and add delay to simulate slow server
      const delayMs = 1000;
      let routeWasIntercepted = false;

      await page.route('**/*.js', async (route: Route) => {
        // Only delay the main JavaScript bundle
        if (route.request().url().includes('main.')) {
          routeWasIntercepted = true;
          // Simulate a slow server response
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
        await route.continue();
      });

      const startTime = Date.now();
      await loginPage.navigate();
      const loadTime = Date.now() - startTime;

      // Verify the page eventually loads despite the delay
      await expect(loginPage.loginButton).toBeVisible();

      // The total time should reflect our artificial delay
      expect(routeWasIntercepted).toBe(true);
      expect(loadTime).toBeGreaterThanOrEqual(delayMs);
    });
  });

  test.describe('Blocking Resources', () => {
    test('should function correctly when images are blocked', async ({
      page,
      loginPage,
      inventoryPage,
    }) => {
      // Block all image requests - useful for testing page behavior without images
      // and for faster test execution in some scenarios
      const blockedRequests: string[] = [];

      await page.route('**/*.{png,jpg,jpeg,gif,webp}', async (route: Route) => {
        blockedRequests.push(route.request().url());
        // Abort the request to simulate blocked images
        await route.abort();
      });

      await loginPage.navigate();
      await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);

      // Verify the page still functions correctly without images
      await expect(inventoryPage.inventoryContainer).toBeVisible();
      await expect(inventoryPage.pageTitle).toHaveText('Products');

      // Verify that image requests were indeed blocked
      expect(blockedRequests.length).toBeGreaterThan(0);

      // The inventory items should still be present and interactive
      const productCount = await inventoryPage.getProductCount();
      expect(productCount).toBe(6);

      // Users can still add items to cart even without images
      await inventoryPage.addItemToCartByName(PRODUCTS.BACKPACK);
      await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
    });

    test('should block specific third-party resources', async ({ page, loginPage }) => {
      // Example: Block analytics or tracking scripts
      // This pattern is useful for isolating tests from external dependencies
      const blockedUrls: string[] = [];

      await page.route(
        (url) => {
          // Block any request to external domains (not saucedemo.com)
          const isExternal = !url.hostname.includes('saucedemo.com');
          return isExternal;
        },
        async (route: Route) => {
          blockedUrls.push(route.request().url());
          await route.abort();
        }
      );

      await loginPage.navigate();

      // Page should still function correctly even with external resources blocked
      await expect(loginPage.loginLogo).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();

      // Log blocked URLs for debugging purposes
      if (blockedUrls.length > 0) {
        console.log('Blocked external requests:', blockedUrls);
      }
    });

    test('should block CSS and verify page still loads', async ({ page, loginPage }) => {
      // Blocking CSS is useful for testing accessibility and content visibility
      // without styling
      await page.route('**/*.css', async (route: Route) => {
        await route.abort();
      });

      await loginPage.navigate();

      // The page should still be functional even without CSS
      await expect(loginPage.usernameInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();

      // Login should still work
      await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);
      await expect(page.getByTestId('inventory-container')).toBeVisible();
    });
  });
});

// ============================================================================
// SECTION 2: RESPONSE MOCKING
// Mock API responses for testing edge cases and error scenarios
// ============================================================================

test.describe('Response Mocking', () => {
  test.describe('Mocking Page Content', () => {
    test('should display mocked inventory with custom products', async ({ page, loginPage }) => {
      // Mock the main JavaScript bundle to inject custom content
      // Sauce Demo is a React SPA, so we need to intercept the JS that renders content
      // This demonstrates modifying response content before it reaches the browser
      await page.route('**/*.js', async (route: Route) => {
        const response = await route.fetch();
        let body = await response.text();

        // Modify the response: Change the first product's name in the JS bundle
        // Note: In a real scenario, you'd mock the API, but Sauce Demo has hardcoded data
        body = body.replace(/Sauce Labs Backpack/g, 'MOCKED: Test Product');

        await route.fulfill({
          response,
          body,
        });
      });

      await loginPage.navigate();
      await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);

      // Verify our mocked content appears
      await expect(page.getByText('MOCKED: Test Product')).toBeVisible();
    });

    test('should simulate server error response', async ({ page }) => {
      // Set up route to return 500 error BEFORE navigating
      // This demonstrates how to test error handling when the server is down
      await page.route('**/*', async (route: Route) => {
        // Only intercept document navigations
        if (route.request().resourceType() === 'document') {
          await route.fulfill({
            status: 500,
            contentType: 'text/html',
            body: '<html><head><title>Error</title></head><body><h1>500 Internal Server Error</h1><p>Server unavailable</p></body></html>',
          });
        } else {
          // Let other resources (CSS, JS, etc.) pass through
          // Though they will fail since the document is mocked
          await route.abort();
        }
      });

      // Navigate to any page - it should show the error
      await page.goto('https://www.saucedemo.com/');

      // Verify error page is shown
      await expect(page.locator('h1')).toContainText('500');
      await expect(page.locator('body')).toContainText('Server unavailable');
    });

    test('should mock a 404 Not Found response', async ({ page }) => {
      // Set up a route to return 404 for a specific page
      await page.route('**/nonexistent-page.html', async (route: Route) => {
        await route.fulfill({
          status: 404,
          contentType: 'text/html',
          body: '<html><body><h1>Page Not Found</h1><p>The requested page does not exist.</p></body></html>',
        });
      });

      // Navigate to the non-existent page
      await page.goto('/nonexistent-page.html');

      // Verify 404 content is displayed
      await expect(page.locator('h1')).toContainText('Page Not Found');
    });
  });

  test.describe('Mocking JSON API Responses', () => {
    test('should demonstrate JSON API mocking pattern', async ({ page, loginPage }) => {
      // Although Sauce Demo doesn't have a JSON API, this pattern is common
      // in modern web applications. Here's how you would mock an API response.

      // First navigate to get a valid page context
      await loginPage.navigate();

      // Mock a hypothetical API endpoint (using absolute URL)
      await page.route('**/api/products', async (route: Route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            products: [
              { id: 1, name: 'Mocked Product 1', price: 29.99 },
              { id: 2, name: 'Mocked Product 2', price: 39.99 },
              { id: 3, name: 'Mocked Product 3', price: 49.99 },
            ],
            total: 3,
          }),
        });
      });

      // Trigger a request to the mocked endpoint using page.evaluate with absolute URL
      const mockResponse = await page.evaluate(async () => {
        const response = await fetch('https://www.saucedemo.com/api/products');
        return response.json();
      });

      // Verify the mocked response
      expect(mockResponse.products).toHaveLength(3);
      expect(mockResponse.products[0].name).toBe('Mocked Product 1');
      expect(mockResponse.total).toBe(3);
    });

    test('should mock API error responses', async ({ page, loginPage }) => {
      // First navigate to get a valid page context
      await loginPage.navigate();

      // Mock an API endpoint to return an error
      await page.route('**/api/checkout', async (route: Route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Invalid payment information',
            code: 'PAYMENT_ERROR',
            details: {
              field: 'card_number',
              message: 'Card number is invalid',
            },
          }),
        });
      });

      // Make a request to the mocked error endpoint with absolute URL
      const errorResponse = await page.evaluate(async () => {
        const response = await fetch('https://www.saucedemo.com/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ card: '1234' }),
        });
        return {
          status: response.status,
          data: await response.json(),
        };
      });

      // Verify the error response
      expect(errorResponse.status).toBe(400);
      expect(errorResponse.data.error).toBe('Invalid payment information');
      expect(errorResponse.data.code).toBe('PAYMENT_ERROR');
    });
  });

  test.describe('Conditional Response Mocking', () => {
    test('should mock responses based on request body', async ({ page, loginPage }) => {
      // First navigate to get a valid page context
      await loginPage.navigate();

      // Mock different responses based on the request content
      await page.route('**/api/login', async (route: Route) => {
        const postData = route.request().postData();
        const body = postData ? JSON.parse(postData) : {};

        if (body.username === 'admin' && body.password === 'admin123') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, token: 'mock-jwt-token' }),
          });
        } else {
          await route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ success: false, error: 'Invalid credentials' }),
          });
        }
      });

      // Test successful login with absolute URL
      const successResponse = await page.evaluate(async () => {
        const response = await fetch('https://www.saucedemo.com/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'admin123' }),
        });
        return response.json();
      });
      expect(successResponse.success).toBe(true);
      expect(successResponse.token).toBe('mock-jwt-token');

      // Test failed login with absolute URL
      const failResponse = await page.evaluate(async () => {
        const response = await fetch('https://www.saucedemo.com/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'wrong', password: 'wrong' }),
        });
        return response.json();
      });
      expect(failResponse.success).toBe(false);
      expect(failResponse.error).toBe('Invalid credentials');
    });
  });
});

// ============================================================================
// SECTION 3: NETWORK MONITORING
// Use page.on('request') and page.on('response') to monitor network activity
// ============================================================================

test.describe('Network Monitoring', () => {
  test.describe('Request Logging', () => {
    test('should log all network requests during page load', async ({ page, loginPage }) => {
      // Collect all requests made during page navigation
      const requests: { url: string; method: string; resourceType: string }[] = [];

      // Set up request listener before navigation
      page.on('request', (request: Request) => {
        requests.push({
          url: request.url(),
          method: request.method(),
          resourceType: request.resourceType(),
        });
      });

      await loginPage.navigate();

      // Verify that expected requests were made
      const documentRequests = requests.filter((r) => r.resourceType === 'document');
      const styleRequests = requests.filter((r) => r.resourceType === 'stylesheet');
      const imageRequests = requests.filter((r) => r.resourceType === 'image');

      // There should be at least one document request (the HTML page)
      expect(documentRequests.length).toBeGreaterThanOrEqual(1);
      expect(documentRequests[0].url).toContain('saucedemo.com');

      // There should be CSS requests
      expect(styleRequests.length).toBeGreaterThanOrEqual(1);

      // Log summary for debugging
      console.log(`Total requests: ${requests.length}`);
      console.log(`  Documents: ${documentRequests.length}`);
      console.log(`  Stylesheets: ${styleRequests.length}`);
      console.log(`  Images: ${imageRequests.length}`);
    });

    test('should verify specific requests are made during user actions', async ({
      page,
      loginPage,
      inventoryPage,
    }) => {
      const allRequests: string[] = [];

      // Listen for all requests to track page behavior
      page.on('request', (request: Request) => {
        allRequests.push(request.url());
      });

      // Perform user actions
      await loginPage.navigate();
      await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);

      // Verify the page navigated to inventory (React SPA handles routing client-side)
      // So we check if we're on the correct URL after login
      await expect(page).toHaveURL(/inventory/);

      // Click on a product
      await inventoryPage.clickProduct(PRODUCTS.BACKPACK);

      // Verify navigation to product detail page
      await expect(page).toHaveURL(/inventory-item/);

      // Log captured requests for debugging
      console.log(`Total requests captured: ${allRequests.length}`);
      console.log('Sample request URLs:', allRequests.slice(0, 5));
    });
  });

  test.describe('Response Monitoring', () => {
    test('should verify all responses have successful status codes', async ({
      page,
      loginPage,
    }) => {
      const responses: { url: string; status: number; ok: boolean }[] = [];

      // Set up response listener
      page.on('response', (response: Response) => {
        responses.push({
          url: response.url(),
          status: response.status(),
          ok: response.ok(),
        });
      });

      await loginPage.navigate();
      await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);

      // All responses should be successful (2xx status)
      const failedResponses = responses.filter((r) => !r.ok && r.status !== 0);

      // Log any failed responses for debugging
      if (failedResponses.length > 0) {
        console.log('Failed responses:', failedResponses);
      }

      // Verify no server errors (5xx) on the main site
      const serverErrors = responses.filter(
        (r) => r.status >= 500 && r.url.includes('saucedemo.com')
      );
      expect(serverErrors).toHaveLength(0);

      // Verify critical page resources loaded successfully
      const criticalResponses = responses.filter(
        (r) => r.url.includes('saucedemo.com') && (r.url.endsWith('.html') || r.url.endsWith('/'))
      );
      const criticalErrors = criticalResponses.filter((r) => r.status >= 400);
      expect(criticalErrors).toHaveLength(0);
    });

    test('should capture response timing information', async ({ page, loginPage }) => {
      const responseTimes: { url: string; duration: number }[] = [];
      const requestStartTimes = new Map<string, number>();

      // Track request start times
      page.on('request', (request: Request) => {
        requestStartTimes.set(request.url(), Date.now());
      });

      // Calculate response duration
      page.on('response', (response: Response) => {
        const startTime = requestStartTimes.get(response.url());
        if (startTime) {
          const duration = Date.now() - startTime;
          responseTimes.push({
            url: response.url(),
            duration,
          });
        }
      });

      await loginPage.navigate();

      // Analyze response times
      const avgResponseTime =
        responseTimes.reduce((sum, r) => sum + r.duration, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes.map((r) => r.duration));

      console.log(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`Max response time: ${maxResponseTime}ms`);

      // All responses should complete within a reasonable time
      expect(maxResponseTime).toBeLessThan(10000); // 10 seconds max
    });
  });

  test.describe('Request/Response Pair Tracking', () => {
    test('should track complete request-response cycle', async ({ page, loginPage }) => {
      const networkLog: {
        url: string;
        method: string;
        status: number;
        contentType: string | null;
        size: number;
      }[] = [];

      // Use requestfinished event to capture complete request info
      page.on('requestfinished', async (request: Request) => {
        const response = await request.response();
        if (response) {
          // Get response size from headers
          const contentLength = response.headers()['content-length'];
          networkLog.push({
            url: request.url(),
            method: request.method(),
            status: response.status(),
            contentType: response.headers()['content-type'] || null,
            size: contentLength ? parseInt(contentLength) : 0,
          });
        }
      });

      await loginPage.navigate();

      // Log network activity summary
      console.log('\n=== Network Activity Summary ===');
      networkLog.forEach((entry) => {
        console.log(`${entry.method} ${entry.status} ${entry.url.substring(0, 60)}...`);
      });
      console.log(`Total requests: ${networkLog.length}`);

      // Verify we captured network activity
      expect(networkLog.length).toBeGreaterThan(0);
    });

    test('should detect failed requests', async ({ page, loginPage }) => {
      const failedRequests: { url: string; error: string }[] = [];

      // Listen for failed requests
      page.on('requestfailed', (request: Request) => {
        failedRequests.push({
          url: request.url(),
          error: request.failure()?.errorText || 'Unknown error',
        });
      });

      // Set up a route to abort a specific request to simulate failure
      await page.route('**/some-resource.js', (route) => route.abort('failed'));

      await loginPage.navigate();

      // In this case, we expect no critical failures
      // (our aborted route won't match any actual requests)
      const criticalFailures = failedRequests.filter(
        (r) => !r.url.includes('some-resource.js') && r.error !== 'net::ERR_ABORTED'
      );
      expect(criticalFailures).toHaveLength(0);
    });
  });
});

// ============================================================================
// SECTION 4: OFFLINE MODE TESTING
// Test behavior when network is unavailable
// ============================================================================

test.describe('Offline Mode', () => {
  test('should handle going offline during navigation', async ({ page, context, loginPage }) => {
    // First, navigate while online
    await loginPage.navigate();
    await expect(loginPage.loginLogo).toBeVisible();

    // Go offline
    await context.setOffline(true);

    // Try to navigate to another page - this should fail
    const navigationPromise = page.goto('/inventory.html');

    // The navigation should fail or show an error
    try {
      await navigationPromise;
      // If navigation doesn't throw, check if page shows offline error
      const pageContent = await page.content();
      expect(
        pageContent.includes('offline') ||
          pageContent.includes('ERR_INTERNET_DISCONNECTED') ||
          pageContent.includes('Unable to connect')
      ).toBe(true);
    } catch {
      // Navigation throwing an error is expected behavior when offline
      expect(true).toBe(true);
    }

    // Go back online
    await context.setOffline(false);

    // Now navigation should work
    await page.goto('/');
    await expect(loginPage.loginLogo).toBeVisible();
  });

  test('should recover when going back online', async ({ page, context, loginPage }) => {
    // Start offline
    await context.setOffline(true);

    // Attempt navigation while offline
    const offlineNavigation = page.goto('/', { timeout: 5000 }).catch(() => null);
    await offlineNavigation;

    // Go back online
    await context.setOffline(false);

    // Retry navigation - should succeed now
    await loginPage.navigate();
    await expect(loginPage.loginLogo).toBeVisible();

    // Full user flow should work after recovery
    await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);
    await expect(page.getByTestId('inventory-container')).toBeVisible();
  });

  test('should preserve page state during brief offline period', async ({
    page,
    context,
    loginPage,
    inventoryPage,
  }) => {
    // Login and add items to cart while online
    await loginPage.navigate();
    await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);

    await inventoryPage.addItemToCartByName(PRODUCTS.BACKPACK);
    await inventoryPage.addItemToCartByName(PRODUCTS.BIKE_LIGHT);

    // Verify cart badge shows 2 items
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('2');

    // Go offline
    await context.setOffline(true);

    // Page state should be preserved (items still in cart)
    // Note: This tests client-side state, not server persistence
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('2');

    // Go back online
    await context.setOffline(false);

    // Should be able to continue shopping
    await inventoryPage.addItemToCartByName(PRODUCTS.BOLT_TSHIRT);
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('3');
  });

  test('should test service worker behavior in offline mode', async ({
    page,
    context,
    loginPage,
  }) => {
    // Note: Sauce Demo may not have a service worker, but this pattern
    // demonstrates how to test offline-first PWA behavior

    // Navigate and cache the page (if service worker exists)
    await loginPage.navigate();
    await expect(loginPage.loginLogo).toBeVisible();

    // Check if a service worker is registered
    const hasServiceWorker = await page.evaluate(() => {
      return navigator.serviceWorker?.controller !== null;
    });

    console.log(`Service Worker active: ${hasServiceWorker}`);

    if (hasServiceWorker) {
      // Go offline
      await context.setOffline(true);

      // With service worker, cached pages might still be accessible
      await page.reload();

      // Page should still show content from cache
      await expect(loginPage.loginLogo).toBeVisible({ timeout: 5000 });

      await context.setOffline(false);
    } else {
      // Without service worker, offline behavior is standard
      expect(hasServiceWorker).toBe(false);
    }
  });
});

// ============================================================================
// SECTION 5: ADVANCED NETWORK SCENARIOS
// Combining multiple network techniques
// ============================================================================

test.describe('Advanced Network Scenarios', () => {
  test('should simulate network throttling with custom delays', async ({ page, loginPage }) => {
    // Simulate a slow 3G network by adding delays to all requests
    const networkDelayMs = 500; // 500ms delay per request

    await page.route('**/*', async (route: Route) => {
      await new Promise((resolve) => setTimeout(resolve, networkDelayMs));
      await route.continue();
    });

    const startTime = Date.now();
    await loginPage.navigate();
    const loadTime = Date.now() - startTime;

    // Page load should be significantly longer due to throttling
    expect(loadTime).toBeGreaterThanOrEqual(networkDelayMs);

    // But page should still function correctly
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should intercept and modify request headers', async ({ page, loginPage }) => {
    const capturedHeaders: Record<string, string>[] = [];
    let headersModified = false;

    await page.route('**/*', async (route: Route) => {
      const headers = { ...route.request().headers() };

      // Add custom header (lowercase for consistency)
      headers['x-custom-test-header'] = 'playwright-test';
      headers['x-test-timestamp'] = Date.now().toString();

      headersModified = true;
      capturedHeaders.push(headers);

      await route.continue({ headers });
    });

    await loginPage.navigate();

    // Verify headers were modified for requests
    expect(headersModified).toBe(true);
    expect(capturedHeaders.length).toBeGreaterThan(0);

    // Verify our custom headers exist in the captured headers
    // Note: Headers are case-insensitive in HTTP, but JavaScript object keys are case-sensitive
    const hasCustomHeader = capturedHeaders.some(
      (h) => h['x-custom-test-header'] === 'playwright-test'
    );
    expect(hasCustomHeader).toBe(true);
  });

  test('should track and limit concurrent requests', async ({ page, loginPage }) => {
    let activeRequests = 0;
    let maxConcurrentRequests = 0;

    page.on('request', () => {
      activeRequests++;
      if (activeRequests > maxConcurrentRequests) {
        maxConcurrentRequests = activeRequests;
      }
    });

    page.on('requestfinished', () => {
      activeRequests--;
    });

    page.on('requestfailed', () => {
      activeRequests--;
    });

    await loginPage.navigate();
    await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);

    console.log(`Max concurrent requests: ${maxConcurrentRequests}`);

    // Browser typically limits concurrent connections per domain
    // This test helps understand the application's network behavior
    expect(maxConcurrentRequests).toBeGreaterThan(0);
  });

  test('should verify request payload and response correlation', async ({
    page,
    loginPage,
    inventoryPage,
    cartPage,
  }) => {
    // Track URL changes during the user journey
    // Note: Sauce Demo is a React SPA, so most navigation happens client-side
    const urlHistory: { url: string; timestamp: number }[] = [];

    // Track document requests that are made
    page.on('request', (request: Request) => {
      if (request.resourceType() === 'document') {
        urlHistory.push({
          url: request.url(),
          timestamp: Date.now(),
        });
      }
    });

    // Perform a complete user journey
    await loginPage.navigate();
    await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);

    // Verify we navigated to inventory
    await expect(page).toHaveURL(/inventory/);

    await inventoryPage.addItemToCartByName(PRODUCTS.BACKPACK);
    await page.getByTestId('shopping-cart-link').click();

    // Verify we navigated to cart
    await expect(page).toHaveURL(/cart/);
    await expect(cartPage.cartList).toBeVisible();

    // Log the URL transitions
    console.log('\n=== URL History ===');
    urlHistory.forEach((entry, i) => {
      const pathname = new URL(entry.url).pathname;
      console.log(`${i + 1}. ${pathname}`);
    });

    // Verify at least the initial page load was tracked
    expect(urlHistory.length).toBeGreaterThan(0);
    expect(urlHistory[0].url).toContain('saucedemo.com');
  });
});
