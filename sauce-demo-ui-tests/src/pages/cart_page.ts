import { Page, Locator } from '@playwright/test';
import { BasePage } from './base_page';
import { step } from './step_decorator';

export class CartPage extends BasePage {
  readonly cartList: Locator;
  readonly cartItems: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.cartList = this.getByTestId('cart-list');
    this.cartItems = this.getByTestId('inventory-item');
    this.continueShoppingButton = this.getByTestId('continue-shopping');
    this.checkoutButton = this.getByTestId('checkout');
    this.pageTitle = this.getByTestId('title');
  }

  @step('Navigate to cart page')
  async navigate(): Promise<this> {
    await this.goto('/cart.html');
    return this;
  }

  async getCartItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  async getCartItemNames(): Promise<string[]> {
    return await this.getByTestId('inventory-item-name').allTextContents();
  }

  @step('Remove item from cart')
  async removeItemByName(productName: string): Promise<this> {
    const item = this.cartItems.filter({ hasText: productName });
    await item.getByRole('button', { name: 'Remove' }).click();
    return this;
  }

  @step('Continue shopping')
  async continueShopping(): Promise<this> {
    await this.continueShoppingButton.click();
    return this;
  }

  @step('Proceed to checkout')
  async proceedToCheckout(): Promise<this> {
    await this.checkoutButton.click();
    return this;
  }
}
