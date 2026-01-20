import { Page, Locator } from '@playwright/test';
import { step } from './step_decorator';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  protected getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  @step('Navigate to page')
  async goto(path: string = ''): Promise<this> {
    await this.page.goto(path);
    await this.page.waitForLoadState('domcontentloaded');
    return this;
  }

  @step('Take screenshot')
  async takeScreenshot(name: string): Promise<this> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    await this.page.screenshot({
      path: `base-screenshots/${filename}`,
      fullPage: true,
    });
    return this;
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }
}
