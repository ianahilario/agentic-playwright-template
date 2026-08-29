import { expect, setTestTags, test, testTag } from '@/fixtures';

test(
  'Login > User is unable to log in with an empty username',
  setTestTags(testTag.desktop, testTag.mobile),
  async ({ marketingHomePage, loginPage }) => {
    await test.step('STEP-1: Open the sign-in screen', async () => {
      await marketingHomePage.header.gotoLoginPage();
    });

    await test.step('STEP-2: Continue without entering an email or username', async () => {
      await loginPage.continueButton.click();
    });

    await test.step('STEP-3: The form explains that email or username is required', async () => {
      await expect(
        loginPage.usernameRequiredError,
        'the form shows an error saying that email or username is required',
      ).toHaveText(loginPage.usernameRequiredErrorText);
    });
  },
);
