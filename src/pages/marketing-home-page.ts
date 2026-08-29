import { type Locator, type Page } from '@playwright/test';

import { MarketingHeader } from '@/components/marketing-header';
import { pageUrl } from '@/data/urls';
import { waitForPageToLoad } from '@/helpers/wait-for-page';

export class MarketingHomePage {
  readonly header: MarketingHeader;
  private readonly languagePromptDismiss: Locator;
  private languagePromptHandlerAdded = false;

  constructor(
    private readonly page: Page,
    private readonly isMobile: boolean,
  ) {
    this.languagePromptDismiss = page
      .locator('//astro-island[contains(@opts, "LanguageDialog")]//button[@aria-label="Dismiss"]')
      .describe('dismiss language prompt');
    this.header = new MarketingHeader(page, isMobile, async () => this.goto());
  }

  async goto(): Promise<void> {
    if (!this.languagePromptHandlerAdded) {
      await this.page.addLocatorHandler(this.languagePromptDismiss, async (dismiss) => {
        const reopenMobileMenu = this.isMobile && (await this.header.isMobileMenuOpen());
        await dismiss.click();
        await this.languagePromptDismiss.waitFor({ state: 'hidden' });
        if (reopenMobileMenu) {
          await this.header.openMobileMenu();
        }
      });
      this.languagePromptHandlerAdded = true;
    }
    await this.page.goto(pageUrl.ssoHome, { waitUntil: 'domcontentloaded' });
    await waitForPageToLoad(this.page, {
      locator: this.isMobile ? this.header.mobileMenuToggle : this.header.logInLink,
    });
  }
}
