import { test as base, Page } from '@playwright/test';
import { DashboardPage } from '../pages/Dashboard';

type Fixtures = {
  dashboardPage: DashboardPage;
};

export const test = base.extend<Fixtures>({
  dashboardPage: async (
    { page }: { page: Page },
    use: (dashboardPage: DashboardPage) => Promise<void>,
  ) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },
});

export { expect } from '@playwright/test';
