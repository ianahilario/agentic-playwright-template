# Test architecture

Read this before adding or changing tests. If a change would fight this document, update the document in the same change and say why.

## Folder structure

This repo is test automation only. All of that code lives under `src/`, as siblings. Config, CI, and gitignored auth stay at the repo root.

Keep new code in these folders. Do not add a second tree (`e2e/`, `lib/`, or another `tests/` at the root) unless this file is updated first.

```
src/
  tests/               Playwright specs. One folder per product module.
  fixtures/            Custom `test` / `expect` and setup that every spec should use
  page-objects/
    pages/             One class per screen or major route
    components/        Widgets reused on more than one screen (header, menu)
  helpers/             Env checks and page-load waits. No locator strings.
  data/                Accounts, page URLs, tags, feature stories
playwright.config.ts   Base URL, test id attribute, timeouts, projects. `testDir` is `./src/tests`
playwright-smart-runner.config.ts
                       Which tests the changed suite runs when a file changes
scripts/open-changed-specs-ui.ts
                       Opens the Playwright UI for that changed list
playwright/.auth/      Storage state (gitignored)
```

`@/*` maps to `src/*`. Specs import fixtures as `@/fixtures`. Page classes live under `src/page-objects/pages` and are imported as `@/page-objects/pages/login-page`. Shared widgets live under `src/page-objects/components`. `playwright.config.ts` sets `baseURL` to `https://www.saucedemo.com`. Page paths live in `src/data/urls.ts` and are relative to that base URL. A cold load of `/` opens the sign-in screen.

### Specs (`src/tests/`)

Each product module is a folder, not a spec file. Do not put every journey for a module in one `.spec.ts` file. Add a new `kebab-case.spec.ts` in that folder for each user journey.

Group folders by product area (`login/`, `products/`), not by account and not by Playwright concept. Do not add `*.spec.ts` files directly under `src/tests/`.

File names describe the journey (`wrong-password.spec.ts`, `locked-account.spec.ts`), not the module (`login.spec.ts`).

### Pages and components (`src/page-objects/`)

- File: `kebab-case.ts`. Class: `PascalCase`.
- A page object covers one screen. If a control appears on many screens, it is a component (`src/page-objects/components/site-header.ts`).
- Locators are class fields or getters and always end with `.describe(...)`.
- Copy that belongs only to that screen (error text, a unique heading) lives next to the locator as a string field.
- A method is a user action that takes more than one step. `login` fills the username, fills the password, and submits. Do not add a method whose body is only `locator.click()`. The spec clicks that locator.
- Navigation methods are named `goTo` plus the screen: `goToLoginPage`, `goToProductsPage`. Do not name them `goto` or `open`.
- An assertion method starts with `verify`. Add it to the page object only when more than one test makes that check. An assertion used by one test stays in that spec, on a locator the page object exposes.

### Fixtures (`src/fixtures/`)

`src/fixtures/index.ts` is the only `test` / `expect` specs import. That `test` is built in `src/helpers/test.ts` and re-exported here.

```ts
import { expect, test } from '@/fixtures';
```

## Test shape

Every `test()` must follow Arrange, then Act, then Assert pattern. Do not interleave them. A second act after the first assertion is a second test.

- **Arrange.** Put the product in the starting state (fixture data, open the right screen). Confirms that setup worked are allowed. Do not assert the behavior under test here.
- **Act.** The one user action the title names. Keep it tight. If you need two unrelated actions, split the spec.
- **Assert.** Only the outcome of that act. Several `expect`s are fine when they describe the same result. Prefer web-first `expect` on locators.

```ts
import { standardUser } from '@/data/users';
import { expect, test } from '@/fixtures';

test(
  {
    id: 'LOGIN-01',
    feature: {
      feature: 'login',
      story: 'able to log in',
    },
    actor: 'User',
    expectedOutcome: 'The user is able to log in with a valid username and password',
    scenario: `GIVEN the sign-in screen is open
                WHEN the user signs in with a valid username and password
                THEN the products are displayed`,
    viewport: 'all',
    isSmokeTest: true,
  },
  async ({ loginPage, productsPage }) => {
    await test.step('STEP-1: Open the sign-in screen', async () => {
      await loginPage.goToLoginPage();
    });

    await test.step('STEP-2: Sign in with a valid username and password', async () => {
      await loginPage.login(standardUser.username, standardUser.password);
    });

    await test.step('STEP-3: The products are displayed', async () => {
      await expect(productsPage.heading, 'the products are displayed').toHaveText(
        productsPage.headingText,
      );
    });
  },
);
```

- Options: every field on the object is required. A non-engineer should understand a failure from the title, step name, and expect message.
- `expectedOutcome` is a full sentence. Name who, then `is able` or `is unable`, then what they tried.
- Steps: `STEP-N:` plus user-facing language. Same voice as the outcome, not locator names.
- One behavior per `test()`. Shared arrange belongs in `beforeEach` or a fixture, not copy-pasted steps.

## Tagging

Tag strings live in `src/data/test-tags.ts`. Specs do not import them. `test()` in `src/helpers/test.ts` turns `viewport` and `isSmokeTest` into those tags. `viewport` is a required field, so a test cannot omit it. `desktop-chrome` and `mobile-chrome` grep `@desktop` or `@mobile`.

```ts
viewport: 'desktop';
viewport: 'mobile';
viewport: 'all';
isSmokeTest: true;
```

`viewport: 'all'` applies `@desktop` and `@mobile`. `isSmokeTest: true` also applies `@smoke`. Do not skip inside a test to dodge a viewport. Set `viewport`, or the test runs in the wrong project and fails.

### Viewport tags

These decide which Playwright project runs the spec.

| Tag        | Project          | Use when                                             |
| ---------- | ---------------- | ---------------------------------------------------- |
| `@desktop` | `desktop-chrome` | The flow is desktop, or it is the same on both sizes |
| `@mobile`  | `mobile-chrome`  | The flow is a phone, or it is the same on both sizes |

Use `all` when the behavior is shared. Use `desktop` or `mobile` when the product actually differs by viewport.

### Suite tags

Smoke does not replace a viewport. It selects a subset of tests that already have one. Set it with `isSmokeTest`.

| Tag      | Run                  | Use when                                                          |
| -------- | -------------------- | ----------------------------------------------------------------- |
| `@smoke` | `npm run test:smoke` | The happy path that proves the product still opens after a deploy |

Smoke is small on purpose. Do not add validation, error, or edge-case specs. Do not treat smoke as the full suite. The smoke spec is valid sign-in, `src/tests/login/valid-credentials.spec.ts`. The locked account, the empty fields, and the wrong password stay out of it.

### Run changed tests

`changed` is a CI suite option, not a tag. Do not add `@changed`. CI and `npm run test:changed` both start from `npx playwright-smart-runner --list`. CI runs that list. `npm run test:changed` opens the same list in the Playwright UI for `desktop-chrome` and `mobile-chrome`. The mapping is `playwright-smart-runner.config.ts`. A changed spec runs itself. A change to the sign-in page or the products page runs `src/tests/login/valid-credentials.spec.ts`. Any other relevant change runs `@smoke`. Markdown, the agent skill folders, and the Playwright code review workflow are ignored. A diff that only touches those paths runs nothing.

### Adding a tag

Put the string on `testTag` in `src/data/test-tags.ts` and teach `testDetails` in `src/helpers/test.ts` to apply it from a required field. Document the field here. Viewport tags belong in `ViewportTag` and need a matching `grep` on a Playwright project. Suite tags belong in `SuiteTag`. Do not invent tags in a spec.

## Locators

The live DOM is the source of truth. Before writing or healing a selector, inspect with playwright-cli (`AGENTS.md` and the `dom-discovery` skill). Do not guess from a ticket.

Prefer, in order:

1. **Test id.** `getByTestId('username').describe('username')`. `playwright.config.ts` sets `testIdAttribute` to `data-test`, which is the attribute Swag Labs uses. `getByTestId('username')` matches `data-test="username"`. Test ids survive layout changes. This is the default.
2. **XPath on unique attributes.** Use this when a test id is not there yet. Write XPath, and start every locator with `//` so Playwright treats it as XPath: `//*[@data-record-id="${id}"]`, `//input[@id="username"]`. Target a stable attribute that identifies the control the way a test id would: custom `@data-*`, ids that are not auto-generated noise, or another unique attribute. Do not start with a single `/` (`/html/body/...`, `/div[3]/span[2]`). Do not use `nth` or class-based XPath. Those break when the layout shifts.
3. **`getByRole` / `getByText`.** Last. Accessible names and visible copy follow the UI language. `Confirm now` in en-US is `지금 확정하기` in ko-KR. The same spec must run across locales, so do not key locators on English (or any one language) unless the control has no test id and no unique attribute.

Do not use CSS selectors (`#username`, `.btn`, `button._button-login-id`).

When there's multiple instance of the same locator:

- Check if using `locator.filter({visible:true})` works.

Every locator ends with `.describe('…')`. Write the description the same way as an expect message: what the control is for the user, not the XPath or test id. Queries that return a locator describe it in that method before returning.

Keep locators inside pages and components. If a spec needs a new locator, add it to the page object in the same change. Ask for a `data-test` attribute when neither (1) nor a unique attribute exists. Do not settle on role or text as the long-term locator.

## Auth, data, and isolation

Tests must not depend on another spec's leftover UI state.
