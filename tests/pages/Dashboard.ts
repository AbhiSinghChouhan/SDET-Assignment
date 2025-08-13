import { Locator, Page } from '@playwright/test';
import { env, isHttpBaseUrl } from '../utils/env';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly dataPlaneInput: Locator;
  readonly writeKey: Locator;
  readonly webhookCard: Locator;
  readonly EventTab: Locator;
  readonly deliveredCount: Locator;
  readonly failedCount: Locator;
  readonly refreshButton: Locator;
  constructor(page: Page) {
    super(page);
    this.dataPlaneInput = page.locator("//div[span[text()]= 'Data Plane']//div//span").first();
    this.writeKey = page.locator("//span[contains(text(), 'Write key')]").first();
    this.webhookCard = page.locator("//div[starts-with(@id, 'destination-')]");
    this.EventTab = page.getByRole('tab', { name: 'Events' });
    this.deliveredCount = page.locator("//div[span[text() = 'Delivered']]//div//span");
    this.failedCount = page.locator("//div[span[text() = 'Failed']]//div//span");
    this.refreshButton = page.getByRole('button', { name: 'Refresh' });
  }

  async goto(): Promise<void> {
    if (isHttpBaseUrl) {
      await this.page.goto('/');
    } else {
      await this.page.goto(env.baseUrl);
    }
  }

  async getDataPlaneAndWriteKeyTokenValue(): Promise<{
    dataPlaneValue: string;
    writeKeyToken: string;
  }> {
    const dataPlaneValue = (await this.dataPlaneInput.textContent()) ?? '';
    const writeKeyToken = (await this.writeKey.textContent())?.split(' ')[2] ?? '';
    return { dataPlaneValue, writeKeyToken };
  }

  async getInitialEventCount(): Promise<{ deliveredCount: number; failedCount: number }> {
    await this.webhookCard.click();
    await this.EventTab.click();
    const deliveredCount = await this.deliveredCount.textContent();
    const failedCount = await this.failedCount.textContent();
    await this.connectionsTab.click();
    return { deliveredCount: Number(deliveredCount), failedCount: Number(failedCount) };
  }

  async closePopup(): Promise<void> {
    const closePopupButton = this.page.getByRole('button', { name: 'Close' });
    await this.page.addLocatorHandler(closePopupButton, async (locator) => {
      locator.click();
    });
  }

  async sendIdentityEvent(dataPlaneValue: string, writeKeyToken: string): Promise<string> {
    const dataPlaneUrl = `${dataPlaneValue}/v1/identify`;
    const response = await this.page.request.post(dataPlaneUrl, {
      data: {
        userId: 'user123',
        context: { traits: { trait1: 'new-val' }, ip: '14.5.67.21', library: { name: 'http' } },
        timestamp: '2020-02-02T00:23:09.544Z',
      },
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${writeKeyToken}:`).toString('base64'),
        'Content-Type': 'application/json',
      },
    });
    if (response.status() !== 200) {
      return 'failed';
    }
    return 'success';
  }

  async getFinalEventCount(
    initialDeliveredCount: number,
    initialFailedCount: number,
    status: string,
  ): Promise<{ deliveredCount: number; failedCount: number }> {
    await this.webhookCard.click();
    await this.EventTab.click();
    // wait for 10 seconds and refresh the page if the delivered count is not incremented because I notice some times it takes more than 1 min to update the count on the UI
    for (let i = 0; i < 10; i++) {
      const deliveredCount = await this.deliveredCount.textContent();
      const failedCount = await this.failedCount.textContent();
      if (status === 'success') {
        if (Number(deliveredCount) === initialDeliveredCount) {
          await this.page.waitForTimeout(10000);
          await this.refreshButton.click();
        } else {
          break;
        }
      } else {
        if (Number(failedCount) === initialFailedCount) {
          await this.page.waitForTimeout(10000);
          await this.refreshButton.click();
        } else {
          break;
        }
      }
    }
    const deliveredCount = await this.deliveredCount.textContent();
    const failedCount = await this.failedCount.textContent();
    return { deliveredCount: Number(deliveredCount), failedCount: Number(failedCount) };
  }
}
