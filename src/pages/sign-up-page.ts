import { expect, type Locator, type Page } from '@playwright/test';

import { endpoint, pageUrl } from '@/data/urls';
import { waitForApiResponse, waitForPageToLoad } from '@/helpers/wait-for-page';
import { PrivacyPolicyPage } from '@/pages/privacy-policy-page';
import { TermsOfServicePage } from '@/pages/terms-of-service-page';

export class SignUpPage {
  readonly emailField: Locator;
  readonly termsCheckbox: Locator;
  readonly termsLabel: Locator;
  readonly signUpButton: Locator;
  readonly passwordField: Locator;
  readonly emailRequiredError: Locator;
  readonly emailRequiredErrorText = 'Please enter an email address';
  readonly emailInvalidError: Locator;
  readonly emailInvalidErrorText = 'Email is not valid.';
  readonly termsRequiredError: Locator;
  readonly termsRequiredErrorText = 'This is required';
  readonly registrationFailedError: Locator;
  readonly registrationFailedErrorText =
    'We couldn’t complete your registration. Please try again or contact us for support.';
  readonly blockedDomainError: Locator;
  readonly blockedDomainErrorText =
    'User registration is not allowed in this Application invalid email';
  readonly termsOfServiceLink: Locator;
  readonly privacyPolicyLink: Locator;

  constructor(private readonly page: Page) {
    this.emailField = page.locator('//*[@id="email"]').describe('email address');
    this.termsCheckbox = page
      .locator('//*[@id="terms-of-service"]')
      .describe('agree to terms of service');
    this.termsLabel = page
      .locator('//label[@for="terms-of-service"]')
      .describe('agree to terms of service');
    this.signUpButton = page
      .locator('//button[@name="action"][@type="submit"]')
      .describe('sign up');
    this.passwordField = page.locator('//*[@id="password"]').describe('password');
    this.emailRequiredError = page
      .locator('//*[@id="error-cs-email-required"]')
      .describe('email is required');
    this.emailInvalidError = page
      .locator('//*[@id="error-cs-email-invalid"]')
      .describe('email is not valid');
    this.termsRequiredError = page
      .locator('//*[@data-ulp-validation-function="requiredFunction"]')
      .describe('agreeing to the terms is required');
    this.registrationFailedError = page
      .locator('//*[@id="error-element-email"]')
      .describe('registration could not be completed');
    this.blockedDomainError = page
      .locator('//*[@id="prompt-alert"]')
      .describe('sign-up is not allowed for this email');
    this.termsOfServiceLink = page
      .locator('//label[@for="terms-of-service"]//a[contains(@href, "archive-terms")]')
      .describe('terms of service');
    this.privacyPolicyLink = page
      .locator('//label[@for="terms-of-service"]//a[contains(@href, "/privacy")]')
      .describe('privacy policy');
  }

  async acceptTerms(): Promise<void> {
    if (await this.termsCheckbox.isChecked()) {
      return;
    }

    await this.termsLabel.click({ position: { x: 4, y: 8 } });
  }

  async continueWithEmail(email: string): Promise<void> {
    await this.emailField.fill(email);
    await this.acceptTerms();

    const identifierResponsePromise = waitForApiResponse(
      this.page,
      endpoint.ssoSignupIdentifier,
      'POST',
    ).then((response) => {
      expect(response.status(), 'email was accepted').toBe(302);
    });

    await this.signUpButton.click();
    await identifierResponsePromise;
    await waitForPageToLoad(this.page, { locator: this.passwordField });
  }

  async signUpViaCredentials(
    email: string,
    password: string,
    options?: { isSuccess?: boolean },
  ): Promise<void> {
    await this.continueWithEmail(email);

    const expectSuccess = options?.isSuccess !== false;
    const passwordResponsePromise = waitForApiResponse(
      this.page,
      endpoint.ssoSignupPassword,
      'POST',
    ).then((response) => {
      expect(
        response.status(),
        expectSuccess ? 'sign-up succeeded' : 'sign-up did not succeed',
      ).toBe(expectSuccess ? 302 : 400);
    });

    await this.passwordField.fill(password);
    await Promise.all([this.signUpButton.click(), passwordResponsePromise]);

    if (expectSuccess) {
      await waitForPageToLoad(this.page, { url: pageUrl.verifyEmail });
    }
  }

  async openTermsOfService(): Promise<TermsOfServicePage> {
    const popupPromise = this.page.waitForEvent('popup');
    await this.termsOfServiceLink.click({ noWaitAfter: true });
    const popup = await popupPromise;
    const termsOfServicePage = new TermsOfServicePage(popup);
    await waitForPageToLoad(popup, {
      url: pageUrl.termsOfService,
      locator: termsOfServicePage.heading,
    });
    return termsOfServicePage;
  }

  async openPrivacyPolicy(): Promise<PrivacyPolicyPage> {
    const popupPromise = this.page.waitForEvent('popup');
    await this.privacyPolicyLink.click({ noWaitAfter: true });
    const popup = await popupPromise;
    const privacyPolicyPage = new PrivacyPolicyPage(popup);
    await waitForPageToLoad(popup, {
      url: pageUrl.privacyPolicy,
      locator: privacyPolicyPage.heading,
    });
    return privacyPolicyPage;
  }
}
