import { test, expect } from '../src/pages/page_fixtures';
import {
  CHECKOUT_VALIDATION_SCENARIOS,
  CART_SCENARIOS,
} from '../src/test-data/checkout-scenarios';
import { USERS } from '../src/test-data';

test.describe('Checkout Form Validation', () => {
  for (const scenario of CHECKOUT_VALIDATION_SCENARIOS) {
    test(scenario.name, async ({
      loginPage,
      inventoryPage,
      header,
      cartPage,
      checkoutPage,
    }) => {
      // Setup: Login and add item to cart
      await loginPage.navigate();
      await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);
      await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
      await header.goToCart();
      await cartPage.proceedToCheckout();

      // Fill shipping info with scenario data
      await checkoutPage.fillShippingInfo(
        scenario.firstName,
        scenario.lastName,
        scenario.postalCode
      );
      await checkoutPage.continueToOverview();

      if (scenario.shouldSucceed) {
        await expect(checkoutPage.pageTitle).toHaveText('Checkout: Overview');
      } else {
        await expect(checkoutPage.errorMessage).toBeVisible();
        if (scenario.expectedError) {
          expect(await checkoutPage.getErrorMessage()).toContain(
            scenario.expectedError
          );
        }
      }
    });
  }
});

test.describe('Cart Item Count Validation', () => {
  for (const scenario of CART_SCENARIOS) {
    test(scenario.name, async ({
      loginPage,
      inventoryPage,
      header,
      cartPage,
    }) => {
      // Login
      await loginPage.navigate();
      await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);

      // Add specified products to cart
      for (const product of scenario.products) {
        await inventoryPage.addItemToCartByName(product);
      }

      // Verify cart badge count
      await expect(header.shoppingCartBadge).toHaveText(
        String(scenario.expectedItemCount)
      );

      // Navigate to cart and verify item count
      await header.goToCart();
      const cartItems = cartPage.cartItems;
      await expect(cartItems).toHaveCount(scenario.expectedItemCount);
    });
  }
});
