import { type Locator, type Page } from '@playwright/test';

export class TermsOfServicePage {
  readonly heading: Locator;
  readonly headingText = 'Terms of Service';
  readonly documentBody: Locator;
  readonly documentExcerpt = 'The services provided by SLEEKFLOW TECHNOLOGIES LIMITED';

  constructor(private readonly page: Page) {
    this.heading = page.locator('//main//h1').describe('terms of service heading');
    this.documentBody = page.locator('//main').describe('terms of service text');
  }
}
