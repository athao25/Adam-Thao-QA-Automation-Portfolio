import { Page, Locator } from '@playwright/test';
import { step } from '../step_decorator';

export class SidebarMenuComponent {
  readonly page: Page;
  readonly menu: Locator;
  readonly allItemsLink: Locator;
  readonly aboutLink: Locator;
  readonly logoutLink: Locator;
  readonly resetAppStateLink: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.menu = page.locator('.bm-menu-wrap');
    this.allItemsLink = page.getByTestId('inventory-sidebar-link');
    this.aboutLink = page.getByTestId('about-sidebar-link');
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.resetAppStateLink = page.getByTestId('reset-sidebar-link');
    this.closeButton = page.getByRole('button', { name: 'Close Menu' });
  }

  @step('Click All Items')
  async clickAllItems(): Promise<void> {
    await this.allItemsLink.click();
  }

  @step('Click About')
  async clickAbout(): Promise<void> {
    await this.aboutLink.click();
  }

  @step('Logout')
  async logout(): Promise<void> {
    await this.logoutLink.click();
  }

  @step('Reset app state')
  async resetAppState(): Promise<void> {
    await this.resetAppStateLink.click();
  }

  @step('Close menu')
  async close(): Promise<void> {
    await this.closeButton.click();
  }

  async isOpen(): Promise<boolean> {
    const ariaHidden = await this.menu.getAttribute('aria-hidden');
    return ariaHidden === 'false';
  }
}
