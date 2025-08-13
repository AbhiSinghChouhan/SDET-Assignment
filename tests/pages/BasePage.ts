import { Locator, Page } from '@playwright/test';
import { env } from '../utils/env';

export class BasePage {
  protected readonly page: Page;
  readonly connectionsTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.connectionsTab = page.getByTestId('sub-menu-connections');
  }

  async navigateTo(): Promise<void> {
    await this.page.goto(env.baseUrl);
  }
}
