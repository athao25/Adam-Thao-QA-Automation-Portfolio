import { test as setup } from '@playwright/test';
import { LoginPage } from './login_page';

const authFile = '.auth/user.json';

setup('authenticate as standard user', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.navigate();
  await loginPage.login('standard_user', 'secret_sauce');

  // Wait for successful login - inventory page should be visible
  await page.waitForURL('**/inventory.html');

  // Save the storage state (cookies, localStorage, etc.)
  await page.context().storageState({ path: authFile });
});
