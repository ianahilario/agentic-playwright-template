import { newUser } from '@/data/users';
import { expect, setTestTags, test, testTag } from '@/fixtures';

test(
  'Sign up > User is able to sign up with a new email and password',
  setTestTags(testTag.desktop, testTag.mobile, testTag.smoke),
  async ({ marketingHomePage, signUpPage, verifyEmailPage }) => {
    const { email, password } = newUser();

    await test.step('STEP-1: Open the sign-up screen', async () => {
      await marketingHomePage.header.gotoSignUpPage();
    });

    await test.step('STEP-2: Open the Terms of Service and Privacy Policy', async () => {
      const termsOfServicePage = await signUpPage.openTermsOfService();
      const privacyPolicyPage = await signUpPage.openPrivacyPolicy();

      await expect
        .soft(termsOfServicePage.heading, 'the Terms of Service heading is shown')
        .toHaveText(termsOfServicePage.headingText);
      await expect
        .soft(termsOfServicePage.documentBody, 'the Terms of Service has text')
        .toContainText(termsOfServicePage.documentExcerpt);
      await expect
        .soft(privacyPolicyPage.heading, 'the Privacy Policy heading is shown')
        .toHaveText(privacyPolicyPage.headingText);
      await expect
        .soft(privacyPolicyPage.documentBody, 'the Privacy Policy has text')
        .toContainText(privacyPolicyPage.documentExcerpt);
    });

    await test.step('STEP-3: Sign up with a new email and password', async () => {
      await signUpPage.signUpViaCredentials(email, password);
    });

    await test.step('STEP-4: The user is asked to confirm their email', async () => {
      await expect(
        verifyEmailPage.heading,
        'the user is asked to confirm their email address',
      ).toHaveText(verifyEmailPage.headingText);
      await expect(verifyEmailPage.openGmailLink, 'a link to open Gmail is shown').toBeVisible();
    });
  },
);
