import { standardUser } from '@/data/users';
import { expect, test } from '@/fixtures';

test(
  {
    id: 'LOGIN-06',
    feature: {
      feature: 'login',
      story: 'able to log in',
    },
    actor: 'User',
    expectedOutcome: 'The user is able to log in after being rejected to sign in',
    scenario: `GIVEN the user is rejected to sign in
                WHEN the user retry to sign in with a valid username and password
                THEN the user is able to log in`,
    viewport: 'all',
    isSmokeTest: true,
  },
  async ({ loginPage, productsPage }) => {
    const wrongPassword = 'wrong-password';

    await test.step('STEP-1: Open the sign-in screen', async () => {
      await loginPage.goToLoginPage();
    });

    await test.step('STEP-2: Sign in with the wrong password', async () => {
      await loginPage.login(standardUser.username, wrongPassword, { expectError: true });
    });

    await test.step('STEP-3: Sign in with a valid username and password', async () => {
      await loginPage.login(standardUser.username, standardUser.password);
    });

    await test.step('STEP-4: The products are displayed', async () => {
      await expect(productsPage.heading, 'the products are displayed').toHaveText(
        productsPage.headingText,
      );
    });
  },
);
