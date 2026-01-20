import { test, expect } from '../src/pages/page_fixtures';
import { LOGIN_SCENARIOS } from '../src/test-data/login-scenarios';

test.describe('Login Validation', () => {
  for (const scenario of LOGIN_SCENARIOS) {
    test(scenario.name, async ({ loginPage, inventoryPage }) => {
      await loginPage.navigate();
      await loginPage.login(scenario.username, scenario.password);

      if (scenario.shouldSucceed) {
        await expect(inventoryPage.inventoryContainer).toBeVisible();
        await expect(inventoryPage.pageTitle).toHaveText('Products');
      } else {
        await expect(loginPage.errorMessage).toBeVisible();
        if (scenario.expectedError) {
          expect(await loginPage.getErrorMessage()).toContain(
            scenario.expectedError
          );
        }
      }
    });
  }
});
