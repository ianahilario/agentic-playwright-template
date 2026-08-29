import { unknownUser } from '@/data/users';
import { expect, setTestTags, test, testTag } from '@/fixtures';

test(
  'Login > User is unable to log in with the wrong username or password',
  setTestTags(testTag.desktop, testTag.mobile),
  async ({ marketingHomePage, loginPage }) => {
    const { email, password } = unknownUser();

    await test.step('STEP-1: Open the sign-in screen', async () => {
      await marketingHomePage.header.gotoLoginPage();
    });

    await test.step('STEP-2: Sign in with an email and a password that will not work', async () => {
      await loginPage.loginViaPassword(email, password, { isSuccess: false });
    });

    await test.step('STEP-3: The form explains that the username or password is wrong', async () => {
      await expect(
        loginPage.wrongCredentialsError,
        'the form shows an error saying that the username or password is wrong',
      ).toHaveText(loginPage.wrongCredentialsErrorText);
    });
  },
);
