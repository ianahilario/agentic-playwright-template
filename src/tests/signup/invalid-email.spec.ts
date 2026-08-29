import { expect, setTestTags, test, testTag } from '@/fixtures';

test(
  'Sign up > User is unable to sign up with an invalid email',
  setTestTags(testTag.desktop, testTag.mobile),
  async ({ marketingHomePage, signUpPage }) => {
    await test.step('STEP-1: Open the sign-up screen', async () => {
      await marketingHomePage.header.gotoSignUpPage();
    });

    await test.step('STEP-2: Continue with an email that is not valid', async () => {
      await signUpPage.emailField.fill('not-an-email');
      await signUpPage.acceptTerms();
      await signUpPage.signUpButton.click();
    });

    await test.step('STEP-3: The form explains that the email is not valid', async () => {
      await expect(
        signUpPage.emailInvalidError,
        'the form shows an error saying that the email is not valid',
      ).toHaveText(signUpPage.emailInvalidErrorText);
    });
  },
);
