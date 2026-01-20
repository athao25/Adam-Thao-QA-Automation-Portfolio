import { Page, Locator } from '@playwright/test';
import { BasePage } from './base_page';

export class CartPage extends BasePage {
  readonly cartList: Locator;
  readonly cartItems: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.cartList = page.locator('[data-test="cart-list"]');
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.pageTitle = page.locator('[data-test="title"]');
  }

  async navigate() {
    await this.goto('/cart.html');
  }

  async getCartItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  async getCartItemNames(): Promise<string[]> {
    return await this.page
      .locator('[data-test="inventory-item-name"]')
      .allTextContents();
  }

  async removeItemByName(productName: string) {
    const item = this.cartItems.filter({ hasText: productName });
    await item.locator('button:has-text("Remove")').click();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }
}
