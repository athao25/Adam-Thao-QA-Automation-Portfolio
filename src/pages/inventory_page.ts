import { Page, Locator } from '@playwright/test';
import { BasePage } from './base_page';

export class InventoryPage extends BasePage {
  readonly inventoryContainer: Locator;
  readonly inventoryItems: Locator;
  readonly productSortDropdown: Locator;
  readonly shoppingCartLink: Locator;
  readonly shoppingCartBadge: Locator;
  readonly burgerMenuButton: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.inventoryContainer = page.locator('[data-test="inventory-container"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.productSortDropdown = page.locator('[data-test="product-sort-container"]');
    this.shoppingCartLink = page.locator('[data-test="shopping-cart-link"]');
    this.shoppingCartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.burgerMenuButton = page.getByRole('button', { name: 'Open Menu' });
    this.pageTitle = page.locator('[data-test="title"]');
  }

  async navigate() {
    await this.goto('/inventory.html');
  }

  async getProductCount(): Promise<number> {
    return await this.inventoryItems.count();
  }

  async addItemToCartByName(productName: string) {
    const item = this.page.locator('[data-test="inventory-item"]').filter({
      hasText: productName,
    });
    await item.locator('button:has-text("Add to cart")').click();
  }

  async removeItemFromCartByName(productName: string) {
    const item = this.page.locator('[data-test="inventory-item"]').filter({
      hasText: productName,
    });
    await item.locator('button:has-text("Remove")').click();
  }

  async getCartItemCount(): Promise<number> {
    const badge = this.shoppingCartBadge;
    if (await badge.isVisible()) {
      const text = await badge.textContent();
      return parseInt(text || '0', 10);
    }
    return 0;
  }

  async sortProducts(sortOption: string) {
    await this.productSortDropdown.selectOption(sortOption);
  }

  async goToCart() {
    await this.shoppingCartLink.click();
  }

  async getProductNames(): Promise<string[]> {
    const names = await this.page
      .locator('[data-test="inventory-item-name"]')
      .allTextContents();
    return names;
  }

  async getProductPrices(): Promise<number[]> {
    const priceTexts = await this.page
      .locator('[data-test="inventory-item-price"]')
      .allTextContents();
    return priceTexts.map((price) => parseFloat(price.replace('$', '')));
  }
}
