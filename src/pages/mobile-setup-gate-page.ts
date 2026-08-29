import { type Locator, type Page } from '@playwright/test';

export class MobileSetupGatePage {
  readonly heading: Locator;
  readonly headingText = 'Continue your SleekFlow setup on desktop';
  readonly recipientEmail: Locator;

  constructor(private readonly page: Page) {
    this.heading = page
      .locator('//*[@data-sentry-component="MobileSetupGatePage"]//h1')
      .describe('continue setup on desktop');
    this.recipientEmail = page
      .locator('//*[@data-sentry-component="MobileSetupGatePage"]//h2')
      .describe('email the desktop login link was sent to');
  }
}
