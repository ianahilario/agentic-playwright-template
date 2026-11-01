# Agentic Playwright template

This is a template repository. It includes an AI-assisted Playwright test suite for writing and maintaining tests.

The sample tests run against the demo site `www.saucedemo.com`.

## Getting started

Create your own repository from this template, then install the tools and point the suite at your app.

You need Git and a current Node.js LTS. npm ships with Node.

On the GitHub page for this repository, select **Use this template**, then **Create a new repository**. Choose an owner and a name.

Clone the repository you created.

```bash
git clone https://github.com/<owner>/<repo>.git
cd <repo>
npm ci
npx playwright install --with-deps
```

`npm ci` installs from `package-lock.json` and sets up Husky, so commits run lint and typecheck. `playwright install` downloads Chromium. `--with-deps` installs the OS libraries Playwright needs. That flag matters most on Linux.

Copy the `.env.secret.example` file to a `.env.secret` file and set `USER_PASSWORD`. Swag Labs publishes the shared password. For your own app, put that app's password in the same file.

```bash
cp .env.secret.example .env.secret
```

Point the suite at your app before you replace the sample tests.

- Rewrite `memory-bank/TEST-AUTOMATION-STRATEGY.md` so it describes your app, the risks you care about, and which cases the suite should skip.
- Replace `src` with changes for your own app.
- Prompt the agent to explore your app and create tests. If the app requires a sign-in, add at least one test that signs in first. The agent can then find the function that test uses to authenticate, and reuse it so later tests can get past sign-in.

Open the Playwright UI and run a test from there. You can watch the browser while it runs.

```bash
npm test
```

To open only the tests that match your changes since `main`:

```bash
npm run test:changed
```

## Folder structure

```
src/
  tests/                 One folder per product area, one spec file per journey
  page-objects/
    pages/               One class per screen
    components/          A widget used on more than one screen
  fixtures/              The only test and expect that specs import
  helpers/               Env checks and page-load waits. No locator strings
  data/                  Accounts, URLs, tags, feature stories
memory-bank/
  ARCHITECTURE.md        Folders, locators, fixtures, and how a spec is shaped
  TEST-AUTOMATION-STRATEGY.md
                         What this product covers, and which cases to skip
AGENTS.md                Rules Cursor loads every turn
CLAUDE.md                The same rules for Claude Code
.cursor/skills/          Skills Cursor discovers
.claude/skills/          The same skills for Claude Code
.agents/skills/          The same skills for other agents
playwright.config.ts     baseURL, projects, timeouts. testDir is ./src/tests
playwright-smart-runner.config.ts
                         Which tests run for a changed file
scripts/open-changed-specs-ui.cjs
                         Opens the Playwright UI for that list
```

### CI

#### On pull request

The changed suite runs when a pull request is raised for review. `npx playwright-smart-runner --list` prints the tests that match the diff, and Playwright runs that list. The pull request comment shows passed, failed, skipped, passed on retry, and the total.

When a test fails, the merge is blocked.

#### On schedule

The full suite runs nightly at midnight Hong Kong time.

#### On main

When a run on `main` has a failed test, those failures are grouped by error. Cursor writes a GitHub issue for a new group and comments on the open issue for a known group. In that same run, an issue is closed when every test listed on it passed without a retry. This uses the `CURSOR_API_KEY` secret.

The Playwright workflow calls `.github/workflows/file-test-failure-issues.yml` to open, update, and close those issues. Another workflow can call it with the same inputs.

`artifact` is the artifact that contains `results.json`. `assignee` is one GitHub username. This repository passes `ianahilario`. In a repository created from this template, set `assignee` to that repository's owner. `custom-labels` is a comma-separated list of extra labels.

The workflow always applies `test-triage` on every issue it opens or updates, then adds the labels from `custom-labels`. A new issue also gets a hypothesis label and a project label when the grouped failure has them.

## What makes this agentic

This repository has been set up with an AGENTS.md, skill files, and a memory bank which provides context on how the AI Agent should act.

AGENTS.md and skill files are symlinked so they work with different model providers.

### AGENTS.md

`AGENTS.md` focuses on high-level instructions on how the agent should interact with the browser, how to handle solutions, the tone it should write the tests with, and a brief instruction that points it toward the rest of the context it needs.

### Skills

The skills here enable the AI Agent to better handle browser exploration and test healing. No test creation skill is needed as this repo already outlines the standards in `ARCHITECTURE.md` and has established the pattern for writing tests, page objects, and the rest, which the model can follow.

### Playwright CLI over MCP

This repo currently prefers the use of `playwright-cli` over `Playwright MCP` for token efficiency. We can switch this later when we see an advantage of preferring the MCP.

### Memory Bank

The `memory-bank` folder contains documents the AI agent can refer to for more context on how to write the tests and how to judge whether a test should exist.

**Where humans come in:** When setting up the repo, the human should update the `memory-bank/TEST-AUTOMATION-STRATEGY.md` with the context of their app under test. Over time, continue to improve the memory bank so that the agent has the context it needs to perform well.

### AI Code Review

`.github/workflows/pr-review.yml` reviews a pull request with the Cursor CLI. It runs when a PR is raised and ready for review.

It includes instructions to scan the changes and flag any violations of the defined hard and soft requirements. Any hard requirement validations will result in a failure. This enables fast feedback when a PR is raised, and makes sure the common and key rules not covered by static analysis are flagged.

**Where humans come in:** Continue to iterate on the review instructions as needed. By having the agent cover nitpicky violations, the human can focus their review more on the test design, why we need the test, what it covers, and how it covers.

## Example prompts

### Test creation

```text
Add a test that a user can sort the catalog by price, low to high.
```

The AI Agent would typically open the browser to explore the app and run the scenario via `playwright-cli`. Once it's satisfied, it should write the tests and add/update page objects as needed.

**Where humans come in:** Verify if the created test is up to your standard since the prompt does not detail the steps for how you specifically want it to assert the scenario. Keep giving it instructions, or edit it yourself, until the test is good.

### Test fixing and maintenance

```text
/diagnose-and-heal-test [test] failed with error [error details].
```

**Where humans come in:** Ensure the quality of the error log by making the test fail at the right point of failure and adding meaningful error messages. Provide correct error context to the agent. And like with test creation, verify whether the fixed test is up to your standard.

## Always keep the human in the loop

A green test is not a sign the test is good enough. Tests are now all the more important in this agentic era. Make sure they cover the risks you want to guard against, with solid assertions.
