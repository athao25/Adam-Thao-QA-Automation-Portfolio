import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../src/pages/page_fixtures';
import { USERS, PRODUCTS } from '../src/test-data';

/**
 * Accessibility tests using axe-core to scan pages for WCAG violations.
 * These tests help ensure the application is accessible to users with disabilities.
 *
 * KNOWN ISSUES IN SAUCEDEMO (third-party demo site):
 * - Error dismiss button lacks accessible name (button-name)
 * - Product sort dropdown lacks accessible name (select-name)
 * These are documented issues in the demo site, not our test framework.
 */

// Known accessibility issues in the SauceDemo third-party site that we exclude
const KNOWN_SAUCEDEMO_ISSUES = ['button-name', 'select-name'];

test.describe('Accessibility Tests', () => {
  /**
   * Note: If you need to exclude specific rules for known issues that cannot be fixed,
   * you can use the .disableRules() method on AxeBuilder. For example:
   * new AxeBuilder({ page }).disableRules(['color-contrast'])
   *
   * Or use .exclude() to exclude specific elements:
   * new AxeBuilder({ page }).exclude('.third-party-component')
   */

  test.describe('Login Page Accessibility', () => {
    test('should have no accessibility violations on login page', async ({
      loginPage,
      page,
    }) => {
      await loginPage.navigate();

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .disableRules(KNOWN_SAUCEDEMO_ISSUES)
        .analyze();

      // Log violations for debugging if any exist
      if (accessibilityScanResults.violations.length > 0) {
        console.log(
          'Login Page Violations:',
          JSON.stringify(accessibilityScanResults.violations, null, 2)
        );
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have no accessibility violations on login page with error state', async ({
      loginPage,
      page,
    }) => {
      await loginPage.navigate();
      await loginPage.login('', ''); // Trigger error state

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .disableRules(KNOWN_SAUCEDEMO_ISSUES)
        .analyze();

      if (accessibilityScanResults.violations.length > 0) {
        console.log(
          'Login Error State Violations:',
          JSON.stringify(accessibilityScanResults.violations, null, 2)
        );
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Inventory Page Accessibility', () => {
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.navigate();
      await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);
    });

    test('should have no accessibility violations on inventory page', async ({
      inventoryPage,
      page,
    }) => {
      await expect(inventoryPage.inventoryContainer).toBeVisible();

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .disableRules(KNOWN_SAUCEDEMO_ISSUES)
        .analyze();

      if (accessibilityScanResults.violations.length > 0) {
        console.log(
          'Inventory Page Violations:',
          JSON.stringify(accessibilityScanResults.violations, null, 2)
        );
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Cart Page Accessibility', () => {
    test.beforeEach(async ({ loginPage, inventoryPage, header }) => {
      await loginPage.navigate();
      await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);
      await inventoryPage.addItemToCartByName(PRODUCTS.BACKPACK);
      await header.goToCart();
    });

    test('should have no accessibility violations on cart page', async ({
      cartPage,
      page,
    }) => {
      const itemCount = await cartPage.getCartItemCount();
      expect(itemCount).toBe(1);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .disableRules(KNOWN_SAUCEDEMO_ISSUES)
        .analyze();

      if (accessibilityScanResults.violations.length > 0) {
        console.log(
          'Cart Page Violations:',
          JSON.stringify(accessibilityScanResults.violations, null, 2)
        );
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have no accessibility violations on empty cart', async ({
      cartPage,
      page,
    }) => {
      await cartPage.removeItemByName(PRODUCTS.BACKPACK);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .disableRules(KNOWN_SAUCEDEMO_ISSUES)
        .analyze();

      if (accessibilityScanResults.violations.length > 0) {
        console.log(
          'Empty Cart Violations:',
          JSON.stringify(accessibilityScanResults.violations, null, 2)
        );
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Checkout Page Accessibility', () => {
    test.beforeEach(async ({ loginPage, inventoryPage, header, cartPage }) => {
      await loginPage.navigate();
      await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);
      await inventoryPage.addItemToCartByName(PRODUCTS.BACKPACK);
      await header.goToCart();
      await cartPage.proceedToCheckout();
    });

    test('should have no accessibility violations on checkout information page', async ({
      checkoutPage,
      page,
    }) => {
      await expect(checkoutPage.pageTitle).toHaveText('Checkout: Your Information');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .disableRules(KNOWN_SAUCEDEMO_ISSUES)
        .analyze();

      if (accessibilityScanResults.violations.length > 0) {
        console.log(
          'Checkout Info Page Violations:',
          JSON.stringify(accessibilityScanResults.violations, null, 2)
        );
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have no accessibility violations on checkout information page with error state', async ({
      checkoutPage,
      page,
    }) => {
      await checkoutPage.continueToOverview(); // Trigger validation errors

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .disableRules(KNOWN_SAUCEDEMO_ISSUES)
        .analyze();

      if (accessibilityScanResults.violations.length > 0) {
        console.log(
          'Checkout Error State Violations:',
          JSON.stringify(accessibilityScanResults.violations, null, 2)
        );
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have no accessibility violations on checkout overview page', async ({
      checkoutPage,
      page,
    }) => {
      await checkoutPage.fillShippingInfo('John', 'Doe', '12345');
      await checkoutPage.continueToOverview();

      await expect(checkoutPage.pageTitle).toHaveText('Checkout: Overview');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .disableRules(KNOWN_SAUCEDEMO_ISSUES)
        .analyze();

      if (accessibilityScanResults.violations.length > 0) {
        console.log(
          'Checkout Overview Violations:',
          JSON.stringify(accessibilityScanResults.violations, null, 2)
        );
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have no accessibility violations on checkout complete page', async ({
      checkoutPage,
      page,
    }) => {
      await checkoutPage.fillShippingInfo('John', 'Doe', '12345');
      await checkoutPage.continueToOverview();
      await checkoutPage.finishCheckout();

      await expect(checkoutPage.completeHeader).toBeVisible();

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .disableRules(KNOWN_SAUCEDEMO_ISSUES)
        .analyze();

      if (accessibilityScanResults.violations.length > 0) {
        console.log(
          'Checkout Complete Violations:',
          JSON.stringify(accessibilityScanResults.violations, null, 2)
        );
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Sidebar Menu Accessibility', () => {
    test('should have no accessibility violations when sidebar is open', async ({
      loginPage,
      header,
      page,
    }) => {
      await loginPage.navigate();
      await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);
      await header.openMenu();

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .disableRules(KNOWN_SAUCEDEMO_ISSUES)
        .analyze();

      if (accessibilityScanResults.violations.length > 0) {
        console.log(
          'Sidebar Menu Violations:',
          JSON.stringify(accessibilityScanResults.violations, null, 2)
        );
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });
});

/**
 * Helper test to run a comprehensive accessibility scan and report all violations
 * This test is useful for getting a full picture of accessibility issues
 * Note: This test reports all violations for awareness but only fails on critical new issues
 */
test.describe('Comprehensive Accessibility Report', () => {
  // Additional known issues specific to the full report (best practices, minor issues)
  const ADDITIONAL_KNOWN_ISSUES = ['landmark-one-main', 'region', 'page-has-heading-one'];

  test('should generate accessibility report for entire user flow', async ({
    loginPage,
    inventoryPage,
    header,
    cartPage,
    checkoutPage,
    page,
  }) => {
    const violations: { page: string; issues: unknown[] }[] = [];

    // Login page
    await loginPage.navigate();
    let results = await new AxeBuilder({ page }).disableRules(KNOWN_SAUCEDEMO_ISSUES).analyze();
    if (results.violations.length > 0) {
      violations.push({ page: 'Login', issues: results.violations });
    }

    // Inventory page
    await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);
    await expect(inventoryPage.inventoryContainer).toBeVisible();
    results = await new AxeBuilder({ page }).disableRules(KNOWN_SAUCEDEMO_ISSUES).analyze();
    if (results.violations.length > 0) {
      violations.push({ page: 'Inventory', issues: results.violations });
    }

    // Cart page
    await inventoryPage.addItemToCartByName(PRODUCTS.BACKPACK);
    await header.goToCart();
    results = await new AxeBuilder({ page }).disableRules(KNOWN_SAUCEDEMO_ISSUES).analyze();
    if (results.violations.length > 0) {
      violations.push({ page: 'Cart', issues: results.violations });
    }

    // Checkout info page
    await cartPage.proceedToCheckout();
    results = await new AxeBuilder({ page }).disableRules(KNOWN_SAUCEDEMO_ISSUES).analyze();
    if (results.violations.length > 0) {
      violations.push({ page: 'Checkout Info', issues: results.violations });
    }

    // Checkout overview page
    await checkoutPage.fillShippingInfo('John', 'Doe', '12345');
    await checkoutPage.continueToOverview();
    results = await new AxeBuilder({ page }).disableRules(KNOWN_SAUCEDEMO_ISSUES).analyze();
    if (results.violations.length > 0) {
      violations.push({ page: 'Checkout Overview', issues: results.violations });
    }

    // Checkout complete page
    await checkoutPage.finishCheckout();
    results = await new AxeBuilder({ page }).disableRules(KNOWN_SAUCEDEMO_ISSUES).analyze();
    if (results.violations.length > 0) {
      violations.push({ page: 'Checkout Complete', issues: results.violations });
    }

    // Log comprehensive report
    if (violations.length > 0) {
      console.log('\n=== ACCESSIBILITY REPORT ===\n');
      violations.forEach((v) => {
        console.log(`\n--- ${v.page} Page ---`);
        console.log(JSON.stringify(v.issues, null, 2));
      });
      console.log('\n=== END OF REPORT ===\n');
    }

    // Filter out known SauceDemo issues for the pass/fail check
    const allKnownIssues = [...KNOWN_SAUCEDEMO_ISSUES, ...ADDITIONAL_KNOWN_ISSUES];
    const unknownViolations = violations.filter((v) => {
      const filteredIssues = (v.issues as { id: string }[]).filter(
        (issue) => !allKnownIssues.includes(issue.id)
      );
      return filteredIssues.length > 0;
    });

    // Only fail on new/unknown accessibility issues
    expect(unknownViolations).toEqual([]);
  });
});
