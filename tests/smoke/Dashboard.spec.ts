import { test, expect } from '../setup/test';

test.describe('Dashboard smoke @smoke', () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.goto();
    await dashboardPage.closePopup();
  });

  test('once signed in, should see the Connections tab should be selected', async ({
    dashboardPage,
  }) => {
    await expect(dashboardPage.connectionsTab).toBeVisible();
    await expect(dashboardPage.connectionsTab).toHaveClass(/active/);
  });

  test('send identity event to RudderStack', async ({ dashboardPage }, testInfo) => {
    testInfo.setTimeout(testInfo.timeout + 100000);

    const { deliveredCount: initialDelivered, failedCount: initialFailed } =
      await dashboardPage.getInitialEventCount();

    const { dataPlaneValue, writeKeyToken } =
      await dashboardPage.getDataPlaneAndWriteKeyTokenValue();

    const status = await dashboardPage.sendIdentityEvent(dataPlaneValue, writeKeyToken);

    const { deliveredCount: finalDelivered, failedCount: finalFailed } =
      await dashboardPage.getFinalEventCount(initialDelivered, initialFailed, status);

    const expectedDelivered = initialDelivered + (status === 'success' ? 1 : 0);
    const expectedFailed = initialFailed + (status === 'failed' ? 1 : 0);

    expect(finalDelivered).toBe(expectedDelivered);
    expect(finalFailed).toBe(expectedFailed);
  });
});
