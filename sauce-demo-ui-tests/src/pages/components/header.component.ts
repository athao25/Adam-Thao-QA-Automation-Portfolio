import { Page, Locator } from '@playwright/test';
import { step } from '../step_decorator';

export class HeaderComponent {
  readonly page: Page;
  readonly shoppingCartLink: Locator;
  readonly shoppingCartBadge: Locator;
  readonly burgerMenuButton: Locator;
  readonly appLogo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.shoppingCartLink = page.getByTestId('shopping-cart-link');
    this.shoppingCartBadge = page.getByTestId('shopping-cart-badge');
    this.burgerMenuButton = page.getByRole('button', { name: 'Open Menu' });
    this.appLogo = page.locator('.app_logo');
  }

  @step('Get cart item count')
  async getCartItemCount(): Promise<number> {
    if (await this.shoppingCartBadge.isVisible()) {
      const text = await this.shoppingCartBadge.textContent();
      return parseInt(text || '0', 10);
    }
    return 0;
  }

  @step('Navigate to cart')
  async goToCart(): Promise<void> {
    await this.shoppingCartLink.click();
  }

  @step('Open sidebar menu')
  async openMenu(): Promise<void> {
    await this.burgerMenuButton.click();
  }
}
