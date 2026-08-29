import { newUser } from '@/data/users';
import { expect, setTestTags, test, testTag } from '@/fixtures';

test(
  'Sign up > User is unable to sign up when terms are not accepted',
  setTestTags(testTag.desktop, testTag.mobile),
  async ({ marketingHomePage, signUpPage }) => {
    const { email } = newUser();

    await test.step('STEP-1: Open the sign-up screen', async () => {
      await marketingHomePage.header.gotoSignUpPage();
    });

    await test.step('STEP-2: Continue without agreeing to the terms', async () => {
      await signUpPage.emailField.fill(email);
      await signUpPage.signUpButton.click();
    });

    await test.step('STEP-3: The form explains that agreeing to the terms is required', async () => {
      await expect(
        signUpPage.termsRequiredError,
        'the form shows an error saying that agreeing to the terms is required',
      ).toHaveText(signUpPage.termsRequiredErrorText);
    });
  },
);
