import { expect, test } from '@/fixtures';

test(
  {
    id: 'LOGIN-02',
    feature: {
      feature: 'login',
      story: 'unable to log in',
    },
    actor: 'User',
    expectedOutcome: 'The user is unable to log in with an empty username',
    scenario: `GIVEN the sign-in screen is open
                WHEN the user signs in without a username
                THEN a username is required`,
    viewport: 'desktop',
    isSmokeTest: false,
  },
  async ({ loginPage }) => {
    await test.step('STEP-1: Open the sign-in screen', async () => {
      await loginPage.goToLoginPage();
    });

    await test.step('STEP-2: Sign in without a username', async () => {
      await loginPage.login('', '', { expectError: true });
    });

    await test.step('STEP-3: A username is required', async () => {
      await expect(loginPage.loginError, 'the form says a username is required').toHaveText(
        loginPage.usernameRequiredErrorText,
      );
    });
  },
);
