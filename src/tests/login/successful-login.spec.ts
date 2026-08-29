import { defaultUser } from '@/data/users';
import { expect, setTestTags, test, testTag } from '@/fixtures';

test(
  'Login > User is able to log in using password with valid credentials',
  setTestTags(testTag.desktop, testTag.smoke),
  async ({ marketingHomePage, loginPage, inboxPage }) => {
    const { email, password } = defaultUser();

    await test.step('STEP-1: Open the sign-in screen', async () => {
      await marketingHomePage.header.gotoLoginPage();
    });

    await test.step('STEP-2: Sign in with a valid email and password', async () => {
      await loginPage.loginViaPassword(email, password);
    });

    await test.step('STEP-3: The inbox is displayed', async () => {
      await expect(inboxPage.root, 'the inbox is displayed').toBeVisible();
    });
  },
);

test(
  'Login > User is able to log in on a phone using a desktop login link',
  setTestTags(testTag.mobile),
  async ({ marketingHomePage, loginPage, mobileSetupGatePage }) => {
    const { email, password } = defaultUser();

    await test.step('STEP-1: Open the sign-in screen', async () => {
      await marketingHomePage.header.gotoLoginPage();
    });

    await test.step('STEP-2: Sign in with a valid email and password', async () => {
      await loginPage.loginViaPassword(email, password);
    });

    await test.step('STEP-3: A desktop login link is sent', async () => {
      await expect(
        mobileSetupGatePage.heading,
        'the user is asked to continue setup on desktop',
      ).toHaveText(mobileSetupGatePage.headingText);
      await expect(
        mobileSetupGatePage.recipientEmail,
        'the desktop login link is sent to the signed-in email',
      ).toHaveText(email);
    });
  },
);
