---
name: grill-me-qa
description: Aggressively interrogate test strategy and coverage decisions with one-by-one questions until risks and assumptions are resolved. Default to this skill for any plan-mode conversation about automated test plans, test design, test pyramid trade-offs (E2E vs API vs unit), or coverage strategy, unless the user explicitly asks to skip questioning or proceed directly to implementation.
---

If current mode is plan mode and the task is about test strategy/design, immediately start question-driven interrogation (one question at a time) before drafting or finalizing a plan.

Interview me relentlessly about every aspect of this plan until we reach shared understanding. Walk down each branch of the design tree, resolving dependencies one decision at a time.

If a question can be answered by exploring the codebase, explore the codebase instead.

Prioritize questions about scope, risk coverage, data setup, environment assumptions, fixtures, selectors, assertions, flakiness controls, and CI/runtime trade-offs.

For each question, provide your recommended answer.