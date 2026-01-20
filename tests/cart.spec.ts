import { test, expect } from '../src/pages/page_fixtures';
import { USERS, PRODUCTS } from '../src/test-data';

test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    await loginPage.navigate();
    await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);
    await inventoryPage.addItemToCartByName(PRODUCTS.BACKPACK);
    await inventoryPage.addItemToCartByName(PRODUCTS.BIKE_LIGHT);
    await inventoryPage.goToCart();
  });

  test('should display cart items', async ({ cartPage }) => {
    const itemCount = await cartPage.getCartItemCount();
    expect(itemCount).toBe(2);

    const itemNames = await cartPage.getCartItemNames();
    expect(itemNames).toContain(PRODUCTS.BACKPACK);
    expect(itemNames).toContain(PRODUCTS.BIKE_LIGHT);
  });

  test('should remove item from cart', async ({ cartPage }) => {
    await cartPage.removeItemByName(PRODUCTS.BACKPACK);

    const itemCount = await cartPage.getCartItemCount();
    expect(itemCount).toBe(1);

    const itemNames = await cartPage.getCartItemNames();
    expect(itemNames).not.toContain(PRODUCTS.BACKPACK);
    expect(itemNames).toContain(PRODUCTS.BIKE_LIGHT);
  });

  test('should continue shopping', async ({ cartPage, inventoryPage }) => {
    await cartPage.continueShopping();

    await expect(inventoryPage.inventoryContainer).toBeVisible();
  });

  test('should proceed to checkout', async ({ cartPage, checkoutPage }) => {
    await cartPage.proceedToCheckout();

    await expect(checkoutPage.pageTitle).toHaveText('Checkout: Your Information');
  });
});
