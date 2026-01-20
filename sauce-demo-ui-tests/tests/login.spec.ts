import { test, expect } from '../src/pages/page_fixtures';
import { USERS } from '../src/test-data';

test.describe('Login Functionality', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test('should login successfully with valid credentials', { tag: ['@smoke'] }, async ({
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);

    await expect(inventoryPage.inventoryContainer).toBeVisible();
    await expect(inventoryPage.pageTitle).toHaveText('Products');
  });

  test('should display error for locked out user', { tag: ['@regression'] }, async ({ loginPage }) => {
    await loginPage.login(USERS.LOCKED_OUT.username, USERS.LOCKED_OUT.password);

    await expect(loginPage.errorMessage).toBeVisible();
    expect(await loginPage.getErrorMessage()).toContain(
      'Sorry, this user has been locked out'
    );
  });

  test('should display error for invalid credentials', { tag: ['@regression'] }, async ({ loginPage }) => {
    await loginPage.login(USERS.INVALID.username, USERS.INVALID.password);

    await expect(loginPage.errorMessage).toBeVisible();
    expect(await loginPage.getErrorMessage()).toContain(
      'Username and password do not match'
    );
  });

  test('should display error when username is empty', { tag: ['@regression'] }, async ({ loginPage }) => {
    await loginPage.login('', USERS.STANDARD.password);

    await expect(loginPage.errorMessage).toBeVisible();
    expect(await loginPage.getErrorMessage()).toContain('Username is required');
  });

  test('should display error when password is empty', { tag: ['@regression'] }, async ({ loginPage }) => {
    await loginPage.login(USERS.STANDARD.username, '');

    await expect(loginPage.errorMessage).toBeVisible();
    expect(await loginPage.getErrorMessage()).toContain('Password is required');
  });
});
