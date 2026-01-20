import { test, expect } from '../src/pages/page_fixtures';
import { USERS } from '../src/test-data';

test.describe('Visual Regression Tests', () => {
  test.describe('Login Page', () => {
    test('login page appearance', async ({ loginPage, page }) => {
      await loginPage.navigate();
      await loginPage.loginLogo.waitFor({ state: 'visible' });

      await expect(page).toHaveScreenshot('login-page.png');
    });

    test('login page with error state', async ({ loginPage, page }) => {
      await loginPage.navigate();
      await loginPage.login('invalid_user', 'invalid_password');
      await loginPage.errorMessage.waitFor({ state: 'visible' });

      await expect(page).toHaveScreenshot('login-page-error.png');
    });
  });

  test.describe('Inventory Page', () => {
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.navigate();
      await loginPage.loginWithUser(USERS.STANDARD);
    });

    test('inventory page appearance', async ({ inventoryPage, page }) => {
      await inventoryPage.inventoryContainer.waitFor({ state: 'visible' });

      await expect(page).toHaveScreenshot('inventory-page.png');
    });

    test('inventory page with items added to cart', async ({ inventoryPage, page }) => {
      await inventoryPage.inventoryContainer.waitFor({ state: 'visible' });
      await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
      await inventoryPage.addItemToCartByName('Sauce Labs Bike Light');

      await expect(page).toHaveScreenshot('inventory-page-with-cart-items.png');
    });
  });

  test.describe('Cart Page', () => {
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.navigate();
      await loginPage.loginWithUser(USERS.STANDARD);
    });

    test('empty cart appearance', async ({ cartPage, header, page }) => {
      await header.goToCart();
      await cartPage.pageTitle.waitFor({ state: 'visible' });

      await expect(page).toHaveScreenshot('cart-page-empty.png');
    });

    test('cart with items appearance', async ({ inventoryPage, cartPage, header, page }) => {
      await inventoryPage.inventoryContainer.waitFor({ state: 'visible' });
      await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
      await inventoryPage.addItemToCartByName('Sauce Labs Bike Light');
      await header.goToCart();
      await cartPage.pageTitle.waitFor({ state: 'visible' });

      await expect(page).toHaveScreenshot('cart-page-with-items.png');
    });
  });

  test.describe('Checkout Pages', () => {
    test.beforeEach(async ({ loginPage, inventoryPage, header, cartPage }) => {
      await loginPage.navigate();
      await loginPage.loginWithUser(USERS.STANDARD);
      await inventoryPage.inventoryContainer.waitFor({ state: 'visible' });
      await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
      await header.goToCart();
      await cartPage.pageTitle.waitFor({ state: 'visible' });
      await cartPage.proceedToCheckout();
    });

    test('checkout step one appearance', async ({ checkoutPage, page }) => {
      await checkoutPage.firstNameInput.waitFor({ state: 'visible' });

      await expect(page).toHaveScreenshot('checkout-step-one.png');
    });

    test('checkout step one with validation error', async ({ checkoutPage, page }) => {
      await checkoutPage.firstNameInput.waitFor({ state: 'visible' });
      await checkoutPage.continueToOverview();
      await checkoutPage.errorMessage.waitFor({ state: 'visible' });

      await expect(page).toHaveScreenshot('checkout-step-one-error.png');
    });

    test('checkout step two (overview) appearance', async ({ checkoutPage, page }) => {
      await checkoutPage.fillShippingInfo('John', 'Doe', '12345');
      await checkoutPage.continueToOverview();
      await checkoutPage.finishButton.waitFor({ state: 'visible' });

      await expect(page).toHaveScreenshot('checkout-step-two.png');
    });

    test('checkout complete appearance', async ({ checkoutPage, page }) => {
      await checkoutPage.fillShippingInfo('John', 'Doe', '12345');
      await checkoutPage.continueToOverview();
      await checkoutPage.finishCheckout();
      await checkoutPage.completeHeader.waitFor({ state: 'visible' });

      await expect(page).toHaveScreenshot('checkout-complete.png');
    });
  });
});
