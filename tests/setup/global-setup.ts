import { FullConfig, chromium } from '@playwright/test';
import fs from 'fs';
import { storageStatesDir, storageStatePath } from '../utils/paths';
import { LoginPage } from '../pages/loginPage';

const storageDir = storageStatesDir;

async function globalSetup(_config: FullConfig): Promise<void> {
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const loginPage = new LoginPage(page);
  await loginPage.navigateTo();
  try {
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  } catch {
    console.error('Error waiting for page to networkidle');
  }
  await context.storageState({ path: storageStatePath });
  await browser.close();
}

export default globalSetup;
