---
name: dom-discovery
description: Explore the live page with playwright-cli before writing or changing Playwright tests. Captures real selectors, navigation, and post-action DOM. Use before creating, updating, or healing any Playwright test, page object, or selector-based assertion.
---

# DOM discovery

## When to use

Before creating or updating any Playwright test, page object, or selector. Specs describe intended behavior. The live DOM is the source of truth for selectors and flow.

## Why inspect first

Guessing from a ticket or existing locators is the usual reason tests fail on first run:

- The spec says a search box placeholder is "Search the web". Google's field is a `textarea` with `aria-label="Search"` and `name="q"`.
- The spec says type to filter the homepage. Submitting actually navigates to `https://www.google.com/search?q=...`.
- The spec says an Images dropdown next to the box. Images is a tab on the results page, not a control on google.com.

Inspect first. Do not write test code, then discover.

## Procedure

### 1. Learn how this repo logs in and navigates

Find the existing Playwright fixtures, auth helpers, and page objects for the area under test. Read `AGENTS.md`, `CLAUDE.md`, or equivalent notes next to the tests. Those files record broken patterns and the path that works.

If the app requires login, replicate the same helper sequence the tests use (storage state, API-created users, OAuth, cookies, or whatever this repo already does). Do not invent a shorter login.

### 2. Open a playwright-cli session that matches the Playwright project

Read `playwright.config.ts`. Use the same `devices[...]` name and `viewport` as the project you are writing or healing. Bare `playwright-cli open` is desktop Chrome at the host window size. `playwright-cli resize` does not change the user agent.

Do not write a temporary spec, helper, or `.ts` file for discovery. Do not run an existing test just to poke at the page.

```bash
# desktop-chrome
PLAYWRIGHT_MCP_DEVICE="Desktop Chrome" PLAYWRIGHT_MCP_VIEWPORT_SIZE=1920x1080 \
  playwright-cli -s=desktop-chrome open --headed --browser=chrome

# mobile-chrome
PLAYWRIGHT_MCP_DEVICE="Pixel 5" PLAYWRIGHT_MCP_VIEWPORT_SIZE=360x800 \
  playwright-cli -s=mobile-chrome open --headed --browser=chrome
```

If the config has another project, copy that project's device descriptor and viewport. Do not invent a device. If the spec runs on desktop and mobile and the product can diverge, open a session per project.

Before any `goto`, confirm the session matches the project:

```bash
playwright-cli -s=<project> eval "() => ({ ua: navigator.userAgent, width: innerWidth, height: innerHeight, touch: navigator.maxTouchPoints })"
```

A mobile project must have `Mobile` in the UA, `touch >= 1`, and the configured width. A desktop project must not use a phone UA. If this is wrong, `playwright-cli -s=<project> close` and reopen. Do not inspect the page yet.

```bash
playwright-cli -s=<project> goto "<url>"
playwright-cli -s=<project> snapshot
playwright-cli -s=<project> click "<ref-or-selector>"
playwright-cli -s=<project> fill "<ref-or-selector>" "<value>"
```

Use the shell for any API calls the auth helpers make. Use playwright-cli for navigation, forms, and dismissing onboarding UI.

### 3. Snapshot the page

`playwright-cli snapshot` gives roles, accessible names, hierarchy, and refs.

For each control the test will use, record a locator in this order (see `memory-bank/ARCHITECTURE.md`):

1. `data-testid` (`getByTestId`)
2. Dynamic XPath on a unique attribute (`@data-*` or similar). Not a positional path.
3. `getByRole` / `getByText` only if (1) and (2) are missing. Note that these break when the UI locale changes.

### 4. Exercise the action

If the test clicks, types, or submits, do that in playwright-cli and snapshot again. Confirm:

- Whether the URL changed
- What appeared or disappeared
- Which network calls matter for waits or assertions

### 5. Write down findings before coding

Capture confirmed selectors, the actual user flow vs the spec, and any endpoints to wait on or assert. Then close the session with `playwright-cli -s=<project> close`.

## Rules

- Never guess selectors from the spec or ticket. They can be wrong or describe intent, not markup.
- Never hit a URL directly if existing page objects navigate in-app. SPA routes often 404 on a cold load.
- If login fails or a page 404s, re-read the auth and navigation code. Do not assume the environment is broken and retry the same URL.
- Never invent an alternative auth flow. Follow the project's helpers via playwright-cli.
- Never write a spec, helper, or script labeled one-shot or discovery-only. Interactive playwright-cli is the method.
- Never substitute `npx playwright test --trace` for live exploration. A trace shows what the test already tried, not other states or paths. If auth blocks you, report the error instead of switching to traces.
- Never discover a mobile project in desktop Chrome, or a desktop project with a phone user agent.
