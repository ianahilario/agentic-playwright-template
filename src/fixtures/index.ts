import { test as base, expect } from '@playwright/test';

import { test as customTest } from '@/helpers/test';
import { LoginPage } from '@/page-objects/pages/login-page';
import { ProductsPage } from '@/page-objects/pages/products-page';

type TestFixtures = {
  loginPage: LoginPage;
  productsPage: ProductsPage;
};

const baseTest = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
});

export const test = customTest(baseTest);

export { expect };
