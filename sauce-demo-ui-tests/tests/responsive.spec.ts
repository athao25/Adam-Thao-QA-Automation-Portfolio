import { test, expect } from '../src/pages/page_fixtures';
import { USERS, PRODUCTS } from '../src/test-data';

/**
 * Responsive/Mobile viewport tests for Sauce Demo
 *
 * These tests verify the application works correctly on mobile viewports.
 * To run these tests on mobile devices, enable the mobile projects in playwright.config.ts
 * and run: npx playwright test responsive --project="Mobile Chrome" --project="Mobile Safari"
 *
 * The tests can also run on desktop browsers to verify responsive behavior at small viewports.
 */
test.describe('Mobile/Responsive Layout', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
    await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);
  });

  test.describe('Sidebar Menu Navigation', () => {
    test('should open sidebar menu via hamburger button', async ({ header, sidebarMenu }) => {
      // The burger menu is how mobile users access navigation
      await header.openMenu();

      // Wait for menu animation to complete, then verify it's open
      await expect(sidebarMenu.menu).toHaveAttribute('aria-hidden', 'false');
    });

    test('should close sidebar menu', async ({ header, sidebarMenu }) => {
      await header.openMenu();

      // Wait for menu animation to complete
      await expect(sidebarMenu.menu).toHaveAttribute('aria-hidden', 'false');

      await sidebarMenu.close();

      // Verify menu is closed
      await expect(sidebarMenu.menu).toHaveAttribute('aria-hidden', 'true');
    });

    test('should navigate to All Items from sidebar', async ({ header, sidebarMenu, inventoryPage }) => {
      // First go to cart to navigate away from inventory
      await header.goToCart();

      // Open menu and navigate back to inventory
      await header.openMenu();
      await sidebarMenu.clickAllItems();

      // Verify we are back on inventory page
      await expect(inventoryPage.pageTitle).toHaveText('Products');
    });

    test('should logout via sidebar menu', async ({ header, sidebarMenu, loginPage }) => {
      await header.openMenu();
      await sidebarMenu.logout();

      // Verify we are logged out and on login page
      await expect(loginPage.loginButton).toBeVisible();
    });

    test('should reset app state via sidebar', async ({ header, sidebarMenu, inventoryPage }) => {
      // Add items to cart
      await inventoryPage.addItemToCartByName(PRODUCTS.BACKPACK);
      await inventoryPage.addItemToCartByName(PRODUCTS.BIKE_LIGHT);

      // Verify items are in cart
      let cartCount = await header.getCartItemCount();
      expect(cartCount).toBe(2);

      // Reset app state via sidebar
      await header.openMenu();
      await sidebarMenu.resetAppState();

      // Close menu to see the cart badge
      await sidebarMenu.close();

      // Verify cart is cleared
      cartCount = await header.getCartItemCount();
      expect(cartCount).toBe(0);
    });
  });

  test.describe('Cart Functionality on Mobile', () => {
    test('should add items to cart and navigate to cart', async ({ inventoryPage, header, cartPage }) => {
      // Add item to cart
      await inventoryPage.addItemToCartByName(PRODUCTS.BACKPACK);

      // Verify cart badge shows correct count
      const cartCount = await header.getCartItemCount();
      expect(cartCount).toBe(1);

      // Navigate to cart via cart icon
      await header.goToCart();

      // Verify cart page loads and shows the item
      await expect(cartPage.pageTitle).toHaveText('Your Cart');
    });

    test('should display cart items correctly on small screens', async ({ inventoryPage, header, cartPage }) => {
      // Add multiple items
      await inventoryPage.addItemToCartByName(PRODUCTS.BACKPACK);
      await inventoryPage.addItemToCartByName(PRODUCTS.BIKE_LIGHT);

      await header.goToCart();

      // Verify cart items are visible
      const cartItems = cartPage.cartItems;
      await expect(cartItems).toHaveCount(2);

      // Verify each cart item displays product information
      await expect(cartPage.page.getByText(PRODUCTS.BACKPACK)).toBeVisible();
      await expect(cartPage.page.getByText(PRODUCTS.BIKE_LIGHT)).toBeVisible();
    });

    test('should remove items from cart on mobile', async ({ inventoryPage, header, cartPage }) => {
      await inventoryPage.addItemToCartByName(PRODUCTS.BACKPACK);
      await header.goToCart();

      // Remove the item
      await cartPage.removeItemByName(PRODUCTS.BACKPACK);

      // Verify cart is empty
      await expect(cartPage.cartItems).toHaveCount(0);
    });
  });

  test.describe('Product Browsing on Mobile', () => {
    test('should display products in mobile-friendly layout', async ({ inventoryPage, page }) => {
      // Verify products are visible
      const productCount = await inventoryPage.getProductCount();
      expect(productCount).toBe(6);

      // Verify product cards are visible on the current viewport
      const productList = page.getByTestId('inventory-list');
      await expect(productList).toBeVisible();
    });

    test('should be able to view product details', async ({ page }) => {
      // Click on a product to view details
      await page.getByText(PRODUCTS.BACKPACK).first().click();

      // Verify product detail page elements are visible
      await expect(page.getByTestId('inventory-item-name')).toHaveText(PRODUCTS.BACKPACK);
      await expect(page.getByTestId('back-to-products')).toBeVisible();
    });

    test('should navigate back from product details', async ({ inventoryPage, page }) => {
      // Go to product detail
      await page.getByText(PRODUCTS.BACKPACK).first().click();
      await expect(page.getByTestId('inventory-item-name')).toBeVisible();

      // Navigate back
      await page.getByTestId('back-to-products').click();

      // Verify back on inventory page
      await expect(inventoryPage.pageTitle).toHaveText('Products');
    });

    test('should sort products on mobile viewport', async ({ inventoryPage }) => {
      // Sort by price low to high
      await inventoryPage.sortProducts('lohi');

      // Verify sorting works
      const prices = await inventoryPage.getProductPrices();
      const sortedPrices = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sortedPrices);
    });
  });

  test.describe('Checkout Flow on Mobile', () => {
    test('should complete checkout flow on mobile', async ({
      inventoryPage,
      header,
      cartPage,
      checkoutPage,
      page,
    }) => {
      // Add item to cart
      await inventoryPage.addItemToCartByName(PRODUCTS.ONESIE);

      // Navigate to cart
      await header.goToCart();
      await expect(cartPage.pageTitle).toHaveText('Your Cart');

      // Proceed to checkout
      await cartPage.proceedToCheckout();

      // Fill checkout information
      await checkoutPage.fillShippingInfo('Mobile', 'User', '12345');

      // Continue to overview
      await checkoutPage.continueToOverview();

      // Verify checkout overview
      await expect(page.getByTestId('checkout-summary-container')).toBeVisible();

      // Complete purchase
      await checkoutPage.finishCheckout();

      // Verify order confirmation
      await expect(page.getByTestId('complete-header')).toHaveText('Thank you for your order!');
    });
  });

  test.describe('Touch and Scroll Behavior', () => {
    test('should scroll through product list', async ({ page }) => {
      // Get the inventory container
      const inventoryContainer = page.getByTestId('inventory-container');
      await expect(inventoryContainer).toBeVisible();

      // Scroll down to see more products
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      // Verify the last product is visible after scroll
      await expect(page.getByText(PRODUCTS.RED_TSHIRT)).toBeVisible();
    });

    test('should header remain visible while scrolling', async ({ page, header }) => {
      // Scroll down
      await page.evaluate(() => {
        window.scrollTo(0, 500);
      });

      // Verify header elements are still accessible
      await expect(header.shoppingCartLink).toBeVisible();
      await expect(header.burgerMenuButton).toBeVisible();
    });
  });

  test.describe('Viewport Assertions', () => {
    test('should app logo be visible on mobile', async ({ header }) => {
      await expect(header.appLogo).toBeVisible();
    });

    test('should burger menu button be visible', async ({ header }) => {
      // Burger menu should be visible for navigation on all viewports
      await expect(header.burgerMenuButton).toBeVisible();
    });

    test('should shopping cart icon be accessible', async ({ header }) => {
      // Cart icon should be easily tappable on mobile
      await expect(header.shoppingCartLink).toBeVisible();

      // Verify cart link is clickable
      await header.shoppingCartLink.click();

      // Should navigate to cart
      await expect(header.page).toHaveURL(/.*cart.html/);
    });
  });
});
