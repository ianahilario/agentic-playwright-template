import { standardUser } from '@/data/users';
import { expect, test } from '@/fixtures';

test(
  {
    id: 'LOGIN-07',
    feature: {
      feature: 'login',
      story: 'able to log in',
    },
    actor: 'User',
    expectedOutcome: 'The user is able to see Sample store as the catalog title',
    scenario: `GIVEN the sign-in screen is open
                WHEN the user signs in with a valid username and password
                THEN the catalog title is Sample store`,
    viewport: 'desktop',
    isSmokeTest: false,
  },
  async ({ loginPage, productsPage }) => {
    await test.step('STEP-1: Open the sign-in screen', async () => {
      await loginPage.goToLoginPage();
    });

    await test.step('STEP-2: Sign in with a valid username and password', async () => {
      await loginPage.login(standardUser.username, standardUser.password);
    });

    await test.step('STEP-3: The catalog title is Sample store', async () => {
      await expect(productsPage.heading, 'the catalog title is Sample store').toHaveText(
        'Sample store',
      );
    });
  },
);
