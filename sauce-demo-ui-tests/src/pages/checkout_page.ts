import { Page, Locator } from '@playwright/test';
import { BasePage } from './base_page';
import { step } from './step_decorator';
import { ShippingInfo } from '../test-data';

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
    this.firstNameInput = this.getByTestId('firstName');
    this.lastNameInput = this.getByTestId('lastName');
    this.postalCodeInput = this.getByTestId('postalCode');
    this.continueButton = this.getByTestId('continue');
    this.cancelButton = this.getByTestId('cancel');
    this.finishButton = this.getByTestId('finish');
    this.backHomeButton = this.getByTestId('back-to-products');
    this.errorMessage = this.getByTestId('error');
    this.pageTitle = this.getByTestId('title');
    this.subtotalLabel = this.getByTestId('subtotal-label');
    this.taxLabel = this.getByTestId('tax-label');
    this.totalLabel = this.getByTestId('total-label');
    this.completeHeader = this.getByTestId('complete-header');
    this.completeText = this.getByTestId('complete-text');
  }

  @step('Navigate to checkout step one')
  async navigateToStepOne(): Promise<this> {
    await this.goto('/checkout-step-one.html');
    return this;
  }

  @step('Enter first name')
  async enterFirstName(firstName: string): Promise<this> {
    await this.firstNameInput.fill(firstName);
    return this;
  }

  @step('Enter last name')
  async enterLastName(lastName: string): Promise<this> {
    await this.lastNameInput.fill(lastName);
    return this;
  }

  @step('Enter postal code')
  async enterPostalCode(postalCode: string): Promise<this> {
    await this.postalCodeInput.fill(postalCode);
    return this;
  }

  @step('Fill shipping information')
  async fillShippingInfo(firstName: string, lastName: string, postalCode: string): Promise<this> {
    await this.enterFirstName(firstName);
    await this.enterLastName(lastName);
    await this.enterPostalCode(postalCode);
    return this;
  }

  @step('Fill shipping info from object')
  async fillShippingInfoFromObject(info: ShippingInfo): Promise<this> {
    return this.fillShippingInfo(info.firstName, info.lastName, info.postalCode);
  }

  @step('Continue to overview')
  async continueToOverview(): Promise<this> {
    await this.continueButton.click();
    return this;
  }

  @step('Finish checkout')
  async finishCheckout(): Promise<this> {
    await this.finishButton.click();
    return this;
  }

  @step('Cancel checkout')
  async cancel(): Promise<this> {
    await this.cancelButton.click();
    return this;
  }

  @step('Go back home')
  async goBackHome(): Promise<this> {
    await this.backHomeButton.click();
    return this;
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
