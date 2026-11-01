import { standardUser } from '@/data/users';
import { expect, test } from '@/fixtures';

test(
  {
    id: 'LOGIN-01',
    feature: {
      feature: 'login',
      story: 'able to log in',
    },
    actor: 'User',
    expectedOutcome: 'The user is able to log in with a valid username and password',
    scenario: `GIVEN the sign-in screen is open
                WHEN the user signs in with a valid username and password
                THEN the products are displayed`,
    viewport: 'all',
    isSmokeTest: true,
  },
  async ({ loginPage, productsPage }) => {
    await test.step('STEP-1: Open the sign-in screen', async () => {
      await loginPage.goToLoginPage();
    });

    await test.step('STEP-2: Sign in with a valid username and password', async () => {
      await loginPage.login(standardUser.username, standardUser.password);
    });

    await test.step('STEP-3: The products are displayed', async () => {
      await expect(productsPage.heading, 'the products are displayed').toHaveText(
        productsPage.headingText,
      );
    });
  },
);
