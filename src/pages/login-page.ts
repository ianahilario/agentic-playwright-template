import { expect, type Locator, type Page, type Response } from '@playwright/test';

import { endpoint, pageUrl } from '@/data/urls';
import { waitForApiResponse, waitForPageToLoad } from '@/helpers/wait-for-page';

export class LoginPage {
  readonly usernameField: Locator;
  readonly passwordField: Locator;
  readonly continueButton: Locator;
  readonly signInButton: Locator;
  readonly usernameRequiredError: Locator;
  readonly usernameRequiredErrorText = 'Email address or username is required';
  readonly wrongCredentialsError: Locator;
  readonly wrongCredentialsErrorText = 'Wrong username or password';

  constructor(
    private readonly page: Page,
    private readonly isMobile: boolean,
  ) {
    this.usernameField = page.locator('//*[@id="username"]').describe('email or username');
    this.passwordField = page.locator('//*[@id="password"]').describe('password');
    this.continueButton = page
      .locator('//button[contains(@class, "_button-login-id")]')
      .describe('continue');
    this.signInButton = page
      .locator('//button[@name="action"][@type="submit"]')
      .describe('sign in');
    this.usernameRequiredError = page
      .locator('//*[@id="error-cs-username-required"]')
      .describe('email or username is required');
    this.wrongCredentialsError = page
      .locator('//*[@id="error-element-password"]')
      .describe('wrong username or password');
  }

  async loginViaPassword(
    emailAddress: string,
    password: string,
    options?: { isSuccess?: boolean },
  ): Promise<void> {
    await this.usernameField.fill(emailAddress);
    await this.continueButton.click();
    await waitForPageToLoad(this.page, { locator: this.passwordField });

    const expectSuccess = options?.isSuccess !== false;
    const loginResponsePromise = this.waitForPasswordSignIn().then((response) => {
      expect(response.status(), expectSuccess ? 'login succeeded' : 'login did not succeed').toBe(
        expectSuccess ? 302 : 400,
      );
    });
    const desktopLoginLinkPromise = expectSuccess
      ? this.waitForDesktopLoginLinkSent().then((response) => {
          if (response === undefined) {
            return;
          }
          expect(response.status(), 'a desktop login link is sent').toBe(200);
        })
      : undefined;

    await this.passwordField.fill(password);
    await Promise.all([this.signInButton.click(), loginResponsePromise, desktopLoginLinkPromise]);

    if (expectSuccess && !this.isMobile) {
      await waitForPageToLoad(this.page, { url: pageUrl.appInbox });
    }
  }

  async waitForPasswordSignIn(): Promise<Response> {
    return waitForApiResponse(this.page, endpoint.ssoLoginPassword, 'POST');
  }

  async waitForDesktopLoginLinkSent(): Promise<Response | undefined> {
    if (!this.isMobile) {
      return Promise.resolve(undefined);
    }

    return waitForApiResponse(this.page, endpoint.sendPasswordlessLoginEmail, 'POST');
  }
}
