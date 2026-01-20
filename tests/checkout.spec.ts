import { test, expect } from '../src/pages/page_fixtures';
import { USERS, PRODUCTS } from '../src/test-data';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    await loginPage.navigate();
    await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);
    await inventoryPage.addItemToCartByName(PRODUCTS.BACKPACK);
    await inventoryPage.goToCart();
  });

  test('should complete full checkout flow', async ({ cartPage, checkoutPage }) => {
    await cartPage.proceedToCheckout();

    await checkoutPage.fillShippingInfo('John', 'Doe', '12345');
    await checkoutPage.continueToOverview();

    await expect(checkoutPage.pageTitle).toHaveText('Checkout: Overview');

    await checkoutPage.finishCheckout();

    await expect(checkoutPage.completeHeader).toBeVisible();
    expect(await checkoutPage.getCompleteHeaderText()).toBe('Thank you for your order!');
  });

  test('should display error when first name is empty', async ({
    cartPage,
    checkoutPage,
  }) => {
    await cartPage.proceedToCheckout();

    await checkoutPage.fillShippingInfo('', 'Doe', '12345');
    await checkoutPage.continueToOverview();

    await expect(checkoutPage.errorMessage).toBeVisible();
    expect(await checkoutPage.getErrorMessage()).toContain('First Name is required');
  });

  test('should display error when last name is empty', async ({
    cartPage,
    checkoutPage,
  }) => {
    await cartPage.proceedToCheckout();

    await checkoutPage.fillShippingInfo('John', '', '12345');
    await checkoutPage.continueToOverview();

    await expect(checkoutPage.errorMessage).toBeVisible();
    expect(await checkoutPage.getErrorMessage()).toContain('Last Name is required');
  });

  test('should display error when postal code is empty', async ({
    cartPage,
    checkoutPage,
  }) => {
    await cartPage.proceedToCheckout();

    await checkoutPage.fillShippingInfo('John', 'Doe', '');
    await checkoutPage.continueToOverview();

    await expect(checkoutPage.errorMessage).toBeVisible();
    expect(await checkoutPage.getErrorMessage()).toContain('Postal Code is required');
  });

  test('should calculate correct totals', async ({ cartPage, checkoutPage }) => {
    await cartPage.proceedToCheckout();

    await checkoutPage.fillShippingInfo('John', 'Doe', '12345');
    await checkoutPage.continueToOverview();

    const subtotal = await checkoutPage.getSubtotal();
    const tax = await checkoutPage.getTax();
    const total = await checkoutPage.getTotal();

    expect(subtotal).toBeGreaterThan(0);
    expect(tax).toBeGreaterThan(0);
    expect(total).toBeCloseTo(subtotal + tax, 2);
  });
});
