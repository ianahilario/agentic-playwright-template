# SleekFlow Playwright tests

Playwright coverage for [SleekFlow](https://sleekflow.io), an omnichannel inbox. Specs describe what a person does in the product. Page objects and fixtures own how the browser is driven.

This repo is not the SleekFlow application. `src/` is automation only. Tests run against the live SSO and app at `sso.sleekflow.io` and `app.sleekflow.io`.

## Getting started

These steps assume a new laptop with nothing installed yet.

### 1. Install Git and Node.js

You need Git and a current Node.js LTS. npm ships with Node.

**macOS.** Install [Homebrew](https://brew.sh), then:

```bash
brew install git node
```

Or skip Homebrew and use the installers from [git-scm.com](https://git-scm.com) and [nodejs.org](https://nodejs.org). Pick the LTS build.

**Windows.** Install [Git for Windows](https://git-scm.com/download/win) and the Node.js LTS installer from [nodejs.org](https://nodejs.org). Tick the option that adds Git to PATH.

**Linux.** Use your package manager, or the NodeSource / nvm install for Node LTS, plus `git`.

Confirm both tools work:

```bash
git --version
node -v
npm -v
```

CI uses the Playwright Docker image's Node. Stay on LTS locally so you do not debug version skew.

### 2. Clone the repo

```bash
git clone https://github.com/ianahilario/sleekflow-technical-exam.git
cd sleekflow-technical-exam
```

### 3. Install npm packages and browsers

```bash
npm ci
npx playwright install --with-deps
```

`npm ci` installs from `package-lock.json` and runs Husky so commits get lint and typecheck. `playwright install` downloads Chromium. `--with-deps` installs OS libraries Playwright needs. That flag matters most on Linux. It is still the right default on a new machine.

### 4. Add credentials

Copy the example file, then fill in real values. Never commit the filled file.

```bash
cp .env.secret.example .env.secret
```

| Variable                | Used for                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `USER_DEFAULT_EMAIL`    | An existing SleekFlow account that can sign in with a password                                                                  |
| `USER_DEFAULT_PASSWORD` | Password for that account                                                                                                       |
| `USER_SIGNUP_EMAIL`     | A mailbox you control, with `[replace]` in the local part so each run gets a unique address. Example: `you+[replace]@gmail.com` |
| `USER_SIGNUP_PASSWORD`  | Password for new sign-ups                                                                                                       |

`USER_SIGNUP_EMAIL` must contain the literal string `[replace]`. The suite swaps it for a unique value so parallel workers do not collide.

Do not put credentials in specs. For GitHub Actions, paste the same file into a repository secret named `ENV_SECRET`.

### 5. Run the tests

```bash
npm test
```

That opens Playwright UI. Pick a test and run it from there. It is the least painful first run because you can see the browser.

Headless, same as CI:

```bash
npx playwright test
```

Smoke only, after a deploy:

```bash
npm run test:smoke
```

A failed run writes a trace, screenshot, and video. Open the HTML report with `npx playwright show-report`.

## Layout

All automation lives under `src/`. Config, CI, and gitignored auth stay at the repo root.

```
src/
  tests/          Specs. One folder per product module, one file per journey
  fixtures/       Custom `test` / `expect`. Specs import from here only
  pages/          One class per screen
  components/     Widgets reused on more than one screen
  helpers/        Env, waits. No locator strings
  data/           Users, URLs, tags, factories
playwright.config.ts
.github/workflows/run-playwright-tests.yml
.github/workflows/ci.yml
.github/workflows/nightly.yml
```

## AI setup

Coding agents in this repo follow a local instruction set: how tests are structured, how to drive the browser, and how to heal a failure. Those files and skills are gitignored. A clone from GitHub will not include them.

## Commands

| Command                                        | What it does                  |
| ---------------------------------------------- | ----------------------------- |
| `npm test`                                     | Playwright UI                 |
| `npx playwright test`                          | Full suite, headless          |
| `npx playwright test --project=desktop-chrome` | Desktop Chrome only           |
| `npx playwright test --project=mobile-chrome`  | Pixel 5 viewport only         |
| `npm run test:smoke`                           | Specs tagged `@smoke`         |
| `npm run lint`                                 | ESLint                        |
| `npm run format`                               | Prettier write                |
| `npm run typecheck`                            | TypeScript check with no emit |

Timeouts, retries, and projects live in `playwright.config.ts`. Do not raise timeouts in a spec to hide a flake.

Local runs use as many workers as the machine has. CI uses one worker and two retries.

## CI

Jobs run in Microsoft's Playwright Docker image, pinned to the Playwright version in `package-lock.json`. [`.github/workflows/run-playwright-tests.yml`](.github/workflows/run-playwright-tests.yml) is the reusable workflow. Callers pass `suite: smoke` or `suite: full`.

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs `@smoke` tests when:

- someone pushes to `main`
- a non-draft pull request is opened, updated with new commits, reopened, or marked ready for review

Draft pull requests do not run. A failed smoke job does not fail the workflow, so it will not block a deploy that waits on CI.

[`.github/workflows/nightly.yml`](.github/workflows/nightly.yml) runs the full suite every day at 08:00 Hong Kong time, and on demand from Actions. Nightly failures fail the run.

Each run uploads an HTML report artifact (`playwright-report-smoke` or `playwright-report-full`) for 30 days. Traces, screenshots, and videos are inside that zip. Download it, unzip, then open with `npx playwright show-report`.

Paste the contents of `.env.secret` into the repository secret `ENV_SECRET`. The job writes that file before tests, so Playwright loads it the same way as a local run.

## Coding rules in short

TypeScript, `strict`, no `any`. Prettier `singleQuote`, `printWidth` 100. Husky runs lint-staged and typecheck on commit.

Tests must not depend on another spec's leftover UI state. Unique faker or `[replace]` emails keep parallel workers from clashing.
