import { test as base, expect } from '@playwright/test';

import { InboxPage } from '@/pages/inbox-page';
import { LoginPage } from '@/pages/login-page';
import { MarketingHomePage } from '@/pages/marketing-home-page';
import { MobileSetupGatePage } from '@/pages/mobile-setup-gate-page';
import { SignUpPage } from '@/pages/sign-up-page';
import { VerifyEmailPage } from '@/pages/verify-email-page';

export { setTestTags, testTag } from '@/data/test-tags';

type SleekflowFixtures = {
  inboxPage: InboxPage;
  loginPage: LoginPage;
  marketingHomePage: MarketingHomePage;
  mobileSetupGatePage: MobileSetupGatePage;
  signUpPage: SignUpPage;
  verifyEmailPage: VerifyEmailPage;
};

export const test = base.extend<SleekflowFixtures>({
  inboxPage: async ({ page }, use) => {
    await use(new InboxPage(page));
  },
  loginPage: async ({ page, isMobile }, use) => {
    await use(new LoginPage(page, isMobile));
  },
  marketingHomePage: async ({ page, isMobile }, use) => {
    await use(new MarketingHomePage(page, isMobile));
  },
  mobileSetupGatePage: async ({ page }, use) => {
    await use(new MobileSetupGatePage(page));
  },
  signUpPage: async ({ page }, use) => {
    await use(new SignUpPage(page));
  },
  verifyEmailPage: async ({ page }, use) => {
    await use(new VerifyEmailPage(page));
  },
});

export { expect };
