import { blockedDomainUser } from '@/data/users';
import { expect, setTestTags, test, testTag } from '@/fixtures';

test(
  'Sign up > User is unable to sign up with an email from a blocked domain',
  setTestTags(testTag.desktop, testTag.mobile),
  async ({ marketingHomePage, signUpPage }) => {
    const { email, password } = blockedDomainUser();

    await test.step('STEP-1: Open the sign-up screen', async () => {
      await marketingHomePage.header.gotoSignUpPage();
    });

    await test.step('STEP-2: Sign up with an email from a blocked domain', async () => {
      await signUpPage.signUpViaCredentials(email, password, { isSuccess: false });
    });

    await test.step('STEP-3: The form explains that registration is not allowed for this email', async () => {
      await expect(
        signUpPage.blockedDomainError,
        'the form shows that registration is not allowed for this email',
      ).toContainText(signUpPage.blockedDomainErrorText);
      await expect(signUpPage.blockedDomainError, 'the form names the blocked email').toContainText(
        email,
      );
    });
  },
);
