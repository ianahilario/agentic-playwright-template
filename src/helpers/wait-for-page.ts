import { expect, test, type Locator, type Page, type Response } from '@playwright/test';

type WaitForPageToLoadOptions = {
  url?: string | RegExp;
  locator?: Locator;
  hiddenLocator?: Locator;
  apiResponse?: { method: 'GET' | 'POST'; endpoint: string };
  loadingLocator?: Locator;
};

export async function waitForApiResponse(
  page: Page,
  endpoint: string,
  method: 'GET' | 'POST',
): Promise<Response> {
  return page.waitForResponse(
    (response) => response.url().includes(endpoint) && response.request().method() === method,
  );
}

export async function waitForSuccessfulApiResponse(
  page: Page,
  endpoint: string,
  method: 'GET' | 'POST',
): Promise<void> {
  const response = await waitForApiResponse(page, endpoint, method);
  expect(response.ok(), `${method} ${endpoint} succeeded`).toBe(true);
}

export async function waitForPageToLoad(
  page: Page,
  options: WaitForPageToLoadOptions = {},
): Promise<void> {
  await test.step('The page finishes loading', async () => {
    if (options.apiResponse !== undefined) {
      await waitForSuccessfulApiResponse(
        page,
        options.apiResponse.endpoint,
        options.apiResponse.method,
      );
    }

    if (options.hiddenLocator !== undefined) {
      await options.hiddenLocator.waitFor({ state: 'hidden' });
    }

    const url = options.url;
    if (url !== undefined) {
      if (url instanceof RegExp) {
        await page.waitForURL(url);
      } else {
        await page.waitForURL((currentUrl) => currentUrl.href.includes(url));
      }
    }

    if (options.loadingLocator !== undefined) {
      await expect(options.loadingLocator, 'loading is gone').toHaveCount(0);
    }

    if (options.locator !== undefined) {
      await options.locator.waitFor({ state: 'visible' });
    }
  });
}
