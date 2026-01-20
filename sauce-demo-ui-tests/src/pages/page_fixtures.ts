import { test as base, expect } from '@playwright/test';
import { BasePage } from './base_page';
import { LoginPage } from './login_page';
import { InventoryPage } from './inventory_page';
import { CartPage } from './cart_page';
import { CheckoutPage } from './checkout_page';
import { HeaderComponent } from './components/header.component';
import { SidebarMenuComponent } from './components/sidebar-menu.component';

export { step } from './step_decorator';

interface TestFixtures {
  basePage: BasePage;
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  header: HeaderComponent;
  sidebarMenu: SidebarMenuComponent;
}

export const test = base.extend<TestFixtures>({
  basePage: async ({ page }, use) => {
    await use(new BasePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  header: async ({ page }, use) => {
    await use(new HeaderComponent(page));
  },
  sidebarMenu: async ({ page }, use) => {
    await use(new SidebarMenuComponent(page));
  },
});

export { expect };
