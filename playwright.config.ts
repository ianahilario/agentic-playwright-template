import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { testTag } from './src/data/test-tags';

dotenv.config({ path: ['.env.secret'], quiet: true });

export default defineConfig({
  testDir: './src/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 120_000,
  expect: {
    timeout: 10_000,
    toPass: { timeout: 20_000, intervals: [5_000] },
  },
  use: {
    baseURL: 'https://www.saucedemo.com',
    testIdAttribute: 'data-test',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: {
      mode: 'on',
      show: {
        actions: { position: 'top-left' },
        test: { position: 'top-right', level: 'step' },
      },
    },
    actionTimeout: 10_000,
    navigationTimeout: 5_000,
  },

  projects: [
    {
      name: 'desktop-chrome',
      grep: new RegExp(testTag.desktop),
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'mobile-chrome',
      grep: new RegExp(testTag.mobile),
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 360, height: 800 },
      },
    },
  ],
});
