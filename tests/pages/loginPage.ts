import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { env } from '../utils/env';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByPlaceholder('name@workemail.com');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Log in', exact: true });
  }

  async navigateTo(): Promise<void> {
    await this.page.goto(env.baseUrl);
    await this.page.waitForLoadState();
    await this.login(env.username as string, env.password as string);
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    if (await this.loginButton.isEnabled()) {
      await this.loginButton.click();
    }
  }
}
