import { test as base, expect } from '@playwright/test';
import { BasePage } from './base_page';
import { LoginPage } from './login_page';
import { InventoryPage } from './inventory_page';
import { CartPage } from './cart_page';
import { CheckoutPage } from './checkout_page';

interface TestFixtures {
  basePage: BasePage;
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
}

export const test = base.extend<TestFixtures>({
  basePage: async ({ page }, use) => {
    const basePage = new BasePage(page);
    await use(basePage);
  },
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  inventoryPage: async ({ page }, use) => {
    const inventoryPage = new InventoryPage(page);
    await use(inventoryPage);
  },
  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  },
  checkoutPage: async ({ page }, use) => {
    const checkoutPage = new CheckoutPage(page);
    await use(checkoutPage);
  },
});

export { expect };

/**
 * Decorator function for wrapping POM methods in a test.step.
 */
export function step(stepName?: string) {
  return function decorator(
    target: (...args: any[]) => any,
    context: ClassMethodDecoratorContext
  ) {
    return function replacementMethod(this: any, ...args: any[]) {
      const name = `${stepName || (context.name as string)} (${this.constructor.name})`;
      return test.step(name, async () => {
        return await target.call(this, ...args);
      });
    };
  };
}
