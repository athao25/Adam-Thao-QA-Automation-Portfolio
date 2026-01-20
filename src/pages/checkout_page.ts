import { Page, Locator } from '@playwright/test';
import { BasePage } from './base_page';

export class CheckoutPage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly finishButton: Locator;
  readonly backHomeButton: Locator;
  readonly errorMessage: Locator;
  readonly pageTitle: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly completeHeader: Locator;
  readonly completeText: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.pageTitle = page.locator('[data-test="title"]');
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.completeHeader = page.locator('[data-test="complete-header"]');
    this.completeText = page.locator('[data-test="complete-text"]');
  }

  async navigateToStepOne() {
    await this.goto('/checkout-step-one.html');
  }

  async fillShippingInfo(firstName: string, lastName: string, postalCode: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  async continueToOverview() {
    await this.continueButton.click();
  }

  async finishCheckout() {
    await this.finishButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) || '';
  }

  async getSubtotal(): Promise<number> {
    const text = (await this.subtotalLabel.textContent()) || '';
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  async getTax(): Promise<number> {
    const text = (await this.taxLabel.textContent()) || '';
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  async getTotal(): Promise<number> {
    const text = (await this.totalLabel.textContent()) || '';
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  async isOrderComplete(): Promise<boolean> {
    return await this.completeHeader.isVisible();
  }

  async getCompleteHeaderText(): Promise<string> {
    return (await this.completeHeader.textContent()) || '';
  }
}
