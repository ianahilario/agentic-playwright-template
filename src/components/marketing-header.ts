import { type Locator, type Page } from '@playwright/test';

import { pageUrl } from '@/data/urls';
import { waitForPageToLoad } from '@/helpers/wait-for-page';

export class MarketingHeader {
  private readonly mobileMenu: Locator;
  readonly mobileMenuToggle: Locator;
  readonly logInLink: Locator;
  readonly signUpLink: Locator;

  constructor(
    private readonly page: Page,
    private readonly isMobile: boolean,
    private readonly gotoMarketingHome: () => Promise<void>,
  ) {
    this.mobileMenu = page
      .locator('//details[contains(@class, "mobile-dropdown")]')
      .describe('mobile menu');
    this.mobileMenuToggle = page
      .locator('//summary[@aria-label="Mobile dropdown"]')
      .describe('mobile menu');
    this.logInLink = (
      isMobile
        ? page.locator(
            '//details[contains(@class, "mobile-dropdown")]//a[contains(@href, "screen_hint=login")]',
          )
        : page.locator('//*[@class="hidden lg:block"]//a[contains(@href, "screen_hint=login")]')
    ).describe('log in');
    this.signUpLink = page
      .locator(
        '//nav//a[contains(@href, "screen_hint=signup")][not(ancestor::*[@id="mobile-dropdown"])]',
      )
      .describe('start free trial');
  }

  async isMobileMenuOpen(): Promise<boolean> {
    return (await this.mobileMenu.getAttribute('open')) !== null;
  }

  async openMobileMenu(): Promise<void> {
    if (await this.isMobileMenuOpen()) {
      return;
    }
    await this.mobileMenuToggle.click();
    await this.logInLink.waitFor({ state: 'visible' });
  }

  async gotoLoginPage(): Promise<void> {
    await this.gotoMarketingHome();
    if (this.isMobile) {
      await this.openMobileMenu();
    }
    await this.logInLink.click({ noWaitAfter: true });
    await waitForPageToLoad(this.page, { url: /sso\.sleekflow\.io\/u\/login/ });
  }

  async gotoSignUpPage(): Promise<void> {
    await this.gotoMarketingHome();
    await this.signUpLink.click({ noWaitAfter: true });
    await waitForPageToLoad(this.page, { url: pageUrl.signupIdentifier });
  }
}
