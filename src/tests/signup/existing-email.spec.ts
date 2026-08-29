import { defaultUser, newUser } from '@/data/users';
import { expect, setTestTags, test, testTag } from '@/fixtures';

test(
  'Sign up > User is unable to sign up with an email that is already in use',
  setTestTags(testTag.desktop, testTag.mobile),
  async ({ marketingHomePage, signUpPage }) => {
    const { email } = defaultUser();
    const { password } = newUser();

    await test.step('STEP-1: Open the sign-up screen', async () => {
      await marketingHomePage.header.gotoSignUpPage();
    });

    await test.step('STEP-2: Sign up with an email that already has an account', async () => {
      await signUpPage.signUpViaCredentials(email, password, { isSuccess: false });
    });

    await test.step('STEP-3: The form explains that registration could not be completed', async () => {
      await expect(
        signUpPage.registrationFailedError,
        'the form shows an error saying that registration could not be completed',
      ).toHaveText(signUpPage.registrationFailedErrorText);
    });
  },
);
