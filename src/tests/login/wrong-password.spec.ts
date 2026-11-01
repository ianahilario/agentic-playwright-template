import { standardUser } from '@/data/users';
import { expect, test } from '@/fixtures';

test(
  {
    id: 'LOGIN-04',
    feature: {
      feature: 'login',
      story: 'unable to log in',
    },
    actor: 'User',
    expectedOutcome: 'is unable to log in with the wrong password',
    scenario: `GIVEN the sign-in screen is open
WHEN the user signs in with the wrong password
THEN the username and password are not accepted`,
    viewport: 'all',
    isSmokeTest: false,
  },
  async ({ loginPage }) => {
    await test.step('STEP-1: Open the sign-in screen', async () => {
      await loginPage.goToLoginPage();
    });

    await test.step('STEP-2: Sign in with the wrong password', async () => {
      await loginPage.login(standardUser.username, 'wrong-password');
    });

    await test.step('STEP-3: The username and password are not accepted', async () => {
      await expect(
        loginPage.loginError,
        'the form says the username and password do not match',
      ).toHaveText(loginPage.wrongCredentialsErrorText);
    });
  },
);
