import { test, expect } from '../setup/test';
import { LoginPage } from '../pages/loginPage';
import { env } from '../utils/env';

test.use({ storageState: { cookies: [], origins: [] } });
test.describe('Login validations @auth', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(env.baseUrl);
  });

  test('should not login with empty fields', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('', '');
    await expect(loginPage.loginButton).toBeDisabled();
  });

  test('should not login with invalid email format', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('invalid-email', 'somePassword');
    await expect(loginPage.loginButton).toBeDisabled();
  });

  test('should not login with wrong credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('wrong@example.com', 'wrongpassword');
    const errorMessage = page.getByText('Wrong email or password');
    await expect(errorMessage).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(env.username as string, env.password as string);
    await page.waitForLoadState('domcontentloaded');
    await expect
      .poll(
        async () => {
          const url = page.url();
          return url;
        },
        {
          timeout: 10000,
        },
      )
      .not.toContain('login');
  });
});
