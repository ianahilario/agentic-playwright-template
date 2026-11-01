import { lockedOutUser } from '@/data/users';
import { expect, test } from '@/fixtures';

test(
  {
    id: 'LOGIN-05',
    feature: {
      feature: 'login',
      story: 'unable to log in',
    },
    actor: 'User',
    expectedOutcome: 'The user is unable to log in with a locked account',
    scenario: `GIVEN the sign-in screen is open
                WHEN the user signs in with a locked account
                THEN the account stays locked`,
    viewport: 'desktop',
    isSmokeTest: false,
  },
  async ({ loginPage }) => {
    await test.step('STEP-1: Open the sign-in screen', async () => {
      await loginPage.goToLoginPage();
    });

    await test.step('STEP-2: Sign in with a locked account', async () => {
      await loginPage.login(lockedOutUser.username, lockedOutUser.password, { expectError: true });
    });

    await test.step('STEP-3: The account stays locked', async () => {
      await expect(loginPage.loginError, 'the form says the account is locked').toHaveText(
        loginPage.lockedAccountErrorText,
      );
    });
  },
);
