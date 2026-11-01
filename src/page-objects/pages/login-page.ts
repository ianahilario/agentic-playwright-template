import { type Locator, type Page } from '@playwright/test';

import { pageUrl } from '@/data/urls';
import { waitForPageToLoad } from '@/helpers/wait-for-page';

export class LoginPage {
  readonly usernameField: Locator;
  readonly passwordField: Locator;
  readonly loginButton: Locator;
  readonly loginError: Locator;
  readonly usernameRequiredErrorText = 'Epic sadface: Username is required';
  readonly passwordRequiredErrorText = 'Epic sadface: Password is required';
  readonly wrongCredentialsErrorText =
    'Epic sadface: Username and password do not match any user in this service';
  readonly lockedAccountErrorText = 'Epic sadface: Sorry, this user has been locked out.';

  constructor(private readonly page: Page) {
    this.usernameField = page.getByTestId('username').describe('username');
    this.passwordField = page.getByTestId('password').describe('password');
    this.loginButton = page.getByTestId('login-button').describe('login');
    this.loginError = page.getByTestId('error').describe('login error');
  }

  async goToLoginPage(): Promise<void> {
    await this.page.goto(pageUrl.login);
    await waitForPageToLoad(this.page, { locator: this.usernameField });
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.loginButton.click();
  }
}
