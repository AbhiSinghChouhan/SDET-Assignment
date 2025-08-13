import { test, expect } from '../setup/test';

test.describe('Connections details @smoke', () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.goto();
    await dashboardPage.closePopup();
  });

  test('Data Plane URL and Write Key should be visible and non-empty', async ({
    dashboardPage,
  }) => {
    await expect(dashboardPage.dataPlaneInput).toBeVisible();
    await expect(dashboardPage.writeKey).toBeVisible();
    const { dataPlaneValue, writeKeyToken } =
      await dashboardPage.getDataPlaneAndWriteKeyTokenValue();

    expect(dataPlaneValue).toMatch(/^https?:\/\/[\S]+$/i);
    expect(writeKeyToken).toMatch(/^\S+$/);
  });

  test('Webhook destination Events tab shows non-negative counts', async ({ dashboardPage }) => {
    const { deliveredCount, failedCount } = await dashboardPage.getInitialEventCount();

    expect(Number.isFinite(deliveredCount)).toBe(true);
    expect(Number.isFinite(failedCount)).toBe(true);
    expect(deliveredCount).toBeGreaterThanOrEqual(0);
    expect(failedCount).toBeGreaterThanOrEqual(0);
  });
});
