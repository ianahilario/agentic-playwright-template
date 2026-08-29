import { type Locator, type Page } from '@playwright/test';

export class VerifyEmailPage {
  readonly heading: Locator;
  readonly headingText = 'Confirm your email address';
  readonly openGmailLink: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByText(this.headingText).describe('confirm your email address');
    this.openGmailLink = page
      .locator('//a[@href="https://mail.google.com"]')
      .describe('open Gmail');
  }
}
