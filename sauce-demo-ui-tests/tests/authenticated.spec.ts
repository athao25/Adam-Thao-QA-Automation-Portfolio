import { test, expect } from '../src/pages/page_fixtures';

test.describe('Authenticated User Tests', () => {
  test('should access inventory page without login', async ({ inventoryPage }) => {
    // Navigate directly to inventory page - no login needed due to stored auth state
    await inventoryPage.navigate();

    // Verify user is already logged in by checking inventory page is accessible
    await expect(inventoryPage.inventoryContainer).toBeVisible();
    await expect(inventoryPage.pageTitle).toHaveText('Products');
  });

  test('should display products when already authenticated', async ({ inventoryPage }) => {
    await inventoryPage.navigate();

    // Verify products are visible
    const productCount = await inventoryPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);
  });

  test('should be able to add item to cart when authenticated', async ({
    inventoryPage,
    header,
  }) => {
    await inventoryPage.navigate();

    // Add an item to cart
    await inventoryPage.addItemToCartByName('Sauce Labs Backpack');

    // Verify cart badge shows 1 item
    await expect(header.shoppingCartBadge).toHaveText('1');
  });

  test('should maintain session across page navigation', async ({
    inventoryPage,
    cartPage,
    header,
  }) => {
    await inventoryPage.navigate();

    // Navigate to cart
    await header.goToCart();

    // Verify we're still logged in (cart page is accessible)
    await expect(cartPage.cartList).toBeVisible();

    // Navigate back to inventory
    await cartPage.continueShopping();

    // Verify inventory is still accessible
    await expect(inventoryPage.inventoryContainer).toBeVisible();
  });
});
