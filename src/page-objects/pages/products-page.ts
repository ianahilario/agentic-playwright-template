import { type Locator, type Page } from '@playwright/test';

export class ProductsPage {
  readonly heading: Locator;
  readonly headingText = 'Products';

  constructor(private readonly page: Page) {
    this.heading = page.getByTestId('title').describe('products');
  }
}
