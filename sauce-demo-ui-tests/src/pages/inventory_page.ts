import { Page, Locator } from '@playwright/test';
import { BasePage } from './base_page';
import { step } from './step_decorator';
import { SortOption } from '../test-data';

export class InventoryPage extends BasePage {
  readonly inventoryContainer: Locator;
  readonly inventoryItems: Locator;
  readonly productSortDropdown: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.inventoryContainer = this.getByTestId('inventory-container');
    this.inventoryItems = this.getByTestId('inventory-item');
    this.productSortDropdown = this.getByTestId('product-sort-container');
    this.pageTitle = this.getByTestId('title');
  }

  @step('Navigate to inventory page')
  async navigate(): Promise<this> {
    await this.goto('/inventory.html');
    return this;
  }

  async getProductCount(): Promise<number> {
    return await this.inventoryItems.count();
  }

  @step('Add item to cart')
  async addItemToCartByName(productName: string): Promise<this> {
    const item = this.inventoryItems.filter({ hasText: productName });
    await item.getByRole('button', { name: 'Add to cart' }).click();
    return this;
  }

  @step('Remove item from cart')
  async removeItemFromCartByName(productName: string): Promise<this> {
    const item = this.inventoryItems.filter({ hasText: productName });
    await item.getByRole('button', { name: 'Remove' }).click();
    return this;
  }

  @step('Sort products')
  async sortProducts(sortOption: SortOption): Promise<this> {
    await this.productSortDropdown.selectOption(sortOption);
    return this;
  }

  async getProductNames(): Promise<string[]> {
    return await this.getByTestId('inventory-item-name').allTextContents();
  }

  async getProductPrices(): Promise<number[]> {
    const priceTexts = await this.getByTestId('inventory-item-price').allTextContents();
    return priceTexts.map((price) => parseFloat(price.replace('$', '')));
  }

  @step('Click on product')
  async clickProduct(productName: string): Promise<this> {
    await this.getByTestId('inventory-item-name').filter({ hasText: productName }).click();
    return this;
  }
}
