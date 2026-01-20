import { test, expect } from '../src/pages/page_fixtures';
import { USERS, PRODUCTS, SORT_OPTIONS } from '../src/test-data';

test.describe('Inventory Page', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
    await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);
  });

  test('should display all products', async ({ inventoryPage }) => {
    const productCount = await inventoryPage.getProductCount();
    expect(productCount).toBe(6);
  });

  test('should add item to cart', async ({ inventoryPage }) => {
    await inventoryPage.addItemToCartByName(PRODUCTS.BACKPACK);

    const cartCount = await inventoryPage.getCartItemCount();
    expect(cartCount).toBe(1);
  });

  test('should remove item from cart', async ({ inventoryPage }) => {
    await inventoryPage.addItemToCartByName(PRODUCTS.BACKPACK);
    await inventoryPage.removeItemFromCartByName(PRODUCTS.BACKPACK);

    const cartCount = await inventoryPage.getCartItemCount();
    expect(cartCount).toBe(0);
  });

  test('should add multiple items to cart', async ({ inventoryPage }) => {
    await inventoryPage.addItemToCartByName(PRODUCTS.BACKPACK);
    await inventoryPage.addItemToCartByName(PRODUCTS.BIKE_LIGHT);
    await inventoryPage.addItemToCartByName(PRODUCTS.BOLT_TSHIRT);

    const cartCount = await inventoryPage.getCartItemCount();
    expect(cartCount).toBe(3);
  });

  test('should sort products by name A-Z', async ({ inventoryPage }) => {
    await inventoryPage.sortProducts(SORT_OPTIONS.NAME_ASC);

    const productNames = await inventoryPage.getProductNames();
    const sortedNames = [...productNames].sort();
    expect(productNames).toEqual(sortedNames);
  });

  test('should sort products by name Z-A', async ({ inventoryPage }) => {
    await inventoryPage.sortProducts(SORT_OPTIONS.NAME_DESC);

    const productNames = await inventoryPage.getProductNames();
    const sortedNames = [...productNames].sort().reverse();
    expect(productNames).toEqual(sortedNames);
  });

  test('should sort products by price low to high', async ({ inventoryPage }) => {
    await inventoryPage.sortProducts(SORT_OPTIONS.PRICE_LOW_TO_HIGH);

    const prices = await inventoryPage.getProductPrices();
    const sortedPrices = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sortedPrices);
  });

  test('should sort products by price high to low', async ({ inventoryPage }) => {
    await inventoryPage.sortProducts(SORT_OPTIONS.PRICE_HIGH_TO_LOW);

    const prices = await inventoryPage.getProductPrices();
    const sortedPrices = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sortedPrices);
  });

  test('should navigate to cart', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.goToCart();

    await expect(cartPage.pageTitle).toHaveText('Your Cart');
  });
});
