import { standardUser } from '@/data/users';
import { expect, test } from '@/fixtures';

test(
  {
    id: 'LOGIN-03',
    feature: {
      feature: 'login',
      story: 'unable to log in',
    },
    actor: 'User',
    expectedOutcome: 'is unable to log in with an empty password',
    scenario: `GIVEN the sign-in screen is open
WHEN the user signs in without a password
THEN a password is required`,
    viewport: 'all',
    isSmokeTest: false,
  },
  async ({ loginPage }) => {
    await test.step('STEP-1: Open the sign-in screen', async () => {
      await loginPage.goToLoginPage();
    });

    await test.step('STEP-2: Sign in without a password', async () => {
      await loginPage.login(standardUser.username, '');
    });

    await test.step('STEP-3: A password is required', async () => {
      await expect(loginPage.loginError, 'the form says a password is required').toHaveText(
        loginPage.passwordRequiredErrorText,
      );
    });
  },
);
