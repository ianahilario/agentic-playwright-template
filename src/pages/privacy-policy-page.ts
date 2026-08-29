import { type Locator, type Page } from '@playwright/test';

export class PrivacyPolicyPage {
  readonly heading: Locator;
  readonly headingText = 'Privacy Policy';
  readonly documentBody: Locator;
  readonly documentExcerpt = 'Sleekflow Technologies Limited of Cyberport Road';

  constructor(private readonly page: Page) {
    this.heading = page.locator('//main//h1').describe('privacy policy heading');
    this.documentBody = page.locator('//main').describe('privacy policy text');
  }
}
