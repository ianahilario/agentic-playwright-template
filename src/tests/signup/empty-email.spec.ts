import { expect, setTestTags, test, testTag } from '@/fixtures';

test(
  'Sign up > User is unable to sign up with an empty email',
  setTestTags(testTag.desktop, testTag.mobile),
  async ({ marketingHomePage, signUpPage }) => {
    await test.step('STEP-1: Open the sign-up screen', async () => {
      await marketingHomePage.header.gotoSignUpPage();
    });

    await test.step('STEP-2: Continue without entering an email', async () => {
      await signUpPage.signUpButton.click();
    });

    await test.step('STEP-3: The form explains that an email is required', async () => {
      await expect(
        signUpPage.emailRequiredError,
        'the form shows an error saying that an email is required',
      ).toHaveText(signUpPage.emailRequiredErrorText);
    });
  },
);
