# Agentic Playwright template

This repo writes and maintains a Playwright test suite with capabilities to be assisted by an AI agent.

The sample tests run against the demo site `www.saucedemo.com`.

## Getting started

You need Git and a current Node.js LTS. npm ships with Node.

```bash
git clone https://github.com/ianahilario/agentic-playwright-template.git
cd agentic-playwright-template
npm ci
npx playwright install --with-deps
```

`npm ci` installs from `package-lock.json` and sets up Husky, so commits run lint and typecheck. `playwright install` downloads Chromium. `--with-deps` installs the OS libraries Playwright needs. That flag matters most on Linux.

Copy the `.env.secret.example` file to a `.env.secret` file and set `USER_PASSWORD`. Swag Labs publishes the shared password.

```bash
cp .env.secret.example .env.secret
```

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

## What makes this agentic

This repository has been set up with an AGENTS.md, skill files, and a memory bank which provides context on how the AI Agent should act.

AGENTS.md and skill files are symlinked so it can work on different model providers.

### AGENTS.md

`AGENTS.md` focuses on high-level instructions on how the agent should interact with the browser, how to handle solutions, the tone it should write the tests with, and brief instruction pointing it to more context it needs.

### Skills

The skills here enable the AI Agent to better handle browser exploration and test healing. No test creation skill is needed as this repo already outlines the standards in `ARCHITECTURE.md` and has established the pattern to write the tests, page objects and such which the model can just follow.

### Playwright CLI over MCP

This repo currently prefers the use of `playwright-cli` over `Playwright MCP` for token efficiency. We can switch this later when we see an advantage of preferring the MCP.

### Example prompts

#### Test creation

```text
Add a test that a user can sort the catalog by price, low to high.
```

The AI Agent would typically open the browser to explore the app and run the scenario via `playwright-cli`. Once it's satisfied, it should write the tests and add/update page objects as needed.

**Where humans come in:** Verify if the created test is up to your standard since the prompt does not detail the steps for how you specifically want it to assert the scenario. Keep giving it instructions or edit it by yourself until the test is good.

#### Test fixing and maintenance

```text
/diagnose-and-heal-test [test] failed with error [error details].
```

**Where humans come in:** Same as creation, verify if the fixed test is up to your standard.

#### Always keep the human in the loop

A green test is not a sign the test is good enough. Tests are now all the more important in this agentic era. Make sure it covers the risks you want to protect with solid assertions.
