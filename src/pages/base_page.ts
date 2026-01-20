import { Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string = '') {
    await this.page.goto(path);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async takeScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    await this.page.screenshot({
      path: `base-screenshots/${filename}`,
      fullPage: true,
    });
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }
}
