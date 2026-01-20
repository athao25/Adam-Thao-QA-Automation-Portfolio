import { Page, Locator } from '@playwright/test';
import { BasePage } from './base_page';
import { step } from './step_decorator';
import { UserCredentials } from '../test-data';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly loginLogo: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = this.getByTestId('username');
    this.passwordInput = this.getByTestId('password');
    this.loginButton = this.getByTestId('login-button');
    this.errorMessage = this.getByTestId('error');
    this.loginLogo = page.locator('.login_logo');
  }

  @step('Navigate to login page')
  async navigate(): Promise<this> {
    await this.goto('/');
    return this;
  }

  @step('Enter username')
  async enterUsername(username: string): Promise<this> {
    await this.usernameInput.fill(username);
    return this;
  }

  @step('Enter password')
  async enterPassword(password: string): Promise<this> {
    await this.passwordInput.fill(password);
    return this;
  }

  @step('Click login button')
  async clickLogin(): Promise<this> {
    await this.loginButton.click();
    return this;
  }

  @step('Login with credentials')
  async login(username: string, password: string): Promise<this> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
    return this;
  }

  @step('Login with user')
  async loginWithUser(user: UserCredentials): Promise<this> {
    return this.login(user.username, user.password);
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) || '';
  }

  async isErrorDisplayed(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }
}
