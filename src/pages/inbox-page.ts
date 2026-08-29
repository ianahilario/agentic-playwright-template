import { type Locator, type Page } from '@playwright/test';

export class InboxPage {
  readonly root: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByTestId('inbox-page').describe('inbox');
  }
}
