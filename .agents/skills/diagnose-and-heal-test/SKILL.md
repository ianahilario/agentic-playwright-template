---
name: diagnose-and-heal-test
description: Diagnose, repair, and verify Playwright tests. Use after creating or changing a test, when a test fails, or when asked to debug, heal, fix, run, or verify a Playwright spec.
---

# Diagnose and Heal Test

Run the target test, classify the observed result, apply the smallest
evidence-backed fix when the test is defective, and repeat until reaching a
terminal verdict. Do not ask questions when the repository, ticket, or runtime
evidence provides a reasonable answer.

## Inputs

- target spec path or test title
- Playwright project, inferred from the target suite unless supplied
- environment, base URL, credentials, and other config from Playwright config,
  package scripts, env files, or the caller
- expected behavior from the ticket or existing test annotations

Derive config from the spec path, fixtures, Playwright config, package scripts,
or caller payload. Never copy values from an unrelated example.

## Verdicts

Return exactly one:

- `verified` — execution passes
- `test-bug` — test code is wrong; fix it and continue the loop
- `flaky` — intermittent noise, an unhandled dialog, or a near-timeout action;
  clean rerun, capped at two retries
- `product-bug` — the test correctly exposes behavior that violates the ticket

`test-bug` is an intermediate verdict while a safe fix is available.
`verified`, `product-bug`, and `flaky` after the retry cap are terminal.

## Procedure

### 1. Read the test and supporting code

Read the complete spec, imported fixture, relevant page models, data objects,
environment helpers, and ticket acceptance criteria. Establish:

- the intended scenario and final observable outcome
- authentication and user-role requirements
- selectors, expected values, and page-object methods involved
- Playwright project and environment requirements
- whether the test mutates shared data or user state

Follow existing page-object, fixture, locator, and import conventions. Existing
page objects may contain domain assertions; preserve that design unless the fix
has a clear reason to move responsibility.

### 2. Clean artifacts and run once

Delete stale artifacts before every diagnostic or verification run:

```bash
rm -rf test-results/ results.xml
```

Also remove any other Playwright output dirs the repo uses (for example
`playwright-report/`) when they would confuse diagnosis.

Run only the target spec with one worker:

```bash
npx playwright test <path-to-spec> --project=<project> --workers=1
```

Pass any env vars, `--project`, or other flags required by this repo's
Playwright config and package scripts. Use values supplied by the caller when
present. Otherwise infer them from Playwright config, nearby tests, and
package.json.

If the run passes, return `verified` without inspecting a trace. If it fails,
record the failed test, step, error, source line, and artifact path.

### 3. Diagnose a failed run

Start with the test output, source line, screenshot, current DOM evidence, and
relevant application or network behavior. Classify the root cause from that
evidence whenever possible.

Use the trace only when the test failed and the available evidence is
insufficient to diagnose the issue properly. Do not inspect traces for passing
tests or as a routine verification step.

When trace evidence is necessary, open the retained failure trace:

```bash
npx playwright show-trace test-results/<result-folder>/trace.zip
```

Inspect only the evidence needed to resolve the ambiguity, such as the page and
DOM state at the failed action, overlays, console or page errors, network
activity, and action timing.

For live-page inspection, use Playwright CLI or a headed run. Follow the repo's
browser tooling if it documents one.

### 4. Classify the failure

Classify the root cause, not merely the final exception:

| Evidence | Likely cause |
| --- | --- |
| locator timeout or zero matches | stale selector, wrong page, auth failure, or missing state |
| strict-mode violation | ambiguous selector |
| text/value mismatch | stale expectation, wrong fixture data, or product defect |
| URL/navigation mismatch | changed route, redirect, auth, or product defect |
| API/network failure | request contract, auth, environment, or external dependency |
| passing run with prior failed assertions | timing defect hidden by polling/retry |

For selector, page-state, or behavior uncertainty, inspect the live page in the
same environment and user state before editing. Confirm whether the expected
element exists under another tag, role, text, or stable attribute.

Do not label a failure as environmental until runtime evidence rules out test
logic, data setup, selectors, and configuration.

### 5. Heal test defects

Apply the smallest root-cause fix:

- stale selector: update the page model from discovered DOM evidence
- ambiguous selector: scope it to a stable semantic or component boundary
- stale expectation: change it only when the ticket or authoritative product
  behavior proves the old value wrong
- timing defect: wait for the actual outcome with locator assertions,
  `waitForResponse`, or another observable signal
- broken page method: repair the shared page model when all callers use the
  changed behavior
- data/setup defect: use the repo's existing test data and API helpers

Never:

- weaken an assertion merely to make the test pass
- add `waitForTimeout`, manual retry loops, or `networkidle`
- use `expect.poll` to hide an unclear readiness signal
- guess selectors without DOM evidence
- use `test.fixme()`

After each fix, return to step 2. Fix one root cause at a time so each rerun
provides useful evidence.

### 6. Handle product defects and flakiness

Return `product-bug` only when all are true:

1. fresh DOM inspection confirms the test targets the correct current UI
2. the ticket or approved specification confirms the expected behavior
3. test code, data, auth, and environment have been ruled out

If the repo has a convention for tagging known product bugs, follow it. Do not
invent a bug ticket. If none is available, return the product-bug evidence and
required follow-up without weakening or disabling the test.

For `flaky`, perform a clean rerun from step 2. Allow at most two flaky reruns.
A third flaky result is terminal and must include the exact trace evidence.

### 7. Produce the final clean evidence run

After any healing edit, run the repo's typecheck if it has one (for example
`npx tsc --noEmit`), then clean and execute once more using the step 2 command.
A passing final run produces `verified` evidence for a PR without a trace audit.

## Output

Return:

- verdict
- exact command and target spec
- environment and Playwright project
- root cause and evidence
- edits made
- run count and flaky retry count
- trace path, only when trace inspection was required
- concise recommendation for any non-verified terminal verdict

Do not claim verification from static review alone. A passing execution of the
target spec is sufficient for `verified`.
