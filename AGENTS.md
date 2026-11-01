---
description: Agent instructions for Playwright test automation
alwaysApply: true
---

Read `memory-bank/ARCHITECTURE.md` before creating or changing tests. Folder layout, layers, locators, fixtures, and naming live there. Do not invent a parallel structure.

Read `memory-bank/TEST-AUTOMATION-STRATEGY.md` before deciding whether a test should exist. That file is what this product covers, and which variants must not be duplicated.

## 1. Browser interaction

- For opening a browser, navigating to URLs, clicking, forms, screenshots, or ad-hoc page exploration: use **playwright-cli** in the terminal. Do not use MCP or IDE browser tools for those flows.

## 2. Demand Elegance (Balanced)

- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

## 3. Asking the user (choices)

- When the user must pick an option, confirm, or choose between paths, always use the **`AskQuestion`** tool—not a plain markdown list of choices.

## 4. Test Naming and Step Tone

- Step text stays user-facing (what the customer does or sees), not implementation details (how the test is coded).
- Use "STEP-N:" for test.steps inside the spec files to make failures easier to reference when debugging.
- Avoid technical phrasing in titles and steps (for example locator names, API methods, CSS selectors, internal variable names, or framework jargon).
- Keep wording clear enough that a non-technical stakeholder can understand the scenario without reading code.
- Structure each test as Arrange, then Act, then Assert. One act per test. Do not put outcome assertions in setup, and do not start a second user action after the first assertion.

## Pull Requests

- Before opening a pull request, you MUST read `.github/pull_request_template.md`.
- For the PR titles and commit messages, follow the standard conventions.
- Ensure the PR description strictly follows the headings, structure, and format defined in the template. Do not use generic summaries.

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
