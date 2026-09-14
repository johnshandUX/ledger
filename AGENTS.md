# Ledger Repository: Agent Guidance

These instructions apply across the repository. Also read and follow the nearest scoped `AGENTS.md`; for design-system work, read `packages/design-system/DESIGN_SYSTEM.md` and any relevant family or component contract before editing.

## Ledger purpose

Ledger is a fictional commercial banking product, a learning and portfolio project, and a code-first design system paired with a working banking prototype. It is not production banking software.

## Repository structure

- `apps/bank` is the working Ledger Bank product prototype. It owns product screens, journeys, and banking business logic, and consumes the design system.
- `packages/design-system` is the reusable source of truth for Ledger tokens, components, patterns, documentation, Storybook, tests, and package exports.

Keep reusable UI in the design system. Keep product-specific experiences in the bank app unless a banking pattern has been explicitly accepted as reusable.

## Design-system principles

- Ledger semantic tokens are authoritative. Use existing spacing, radius, typography, border, elevation, and semantic colour tokens; identify genuine token gaps instead of inventing arbitrary values.
- Do not introduce a parallel theme or token system, and do not enable Tailwind Preflight.
- shadcn and Radix may provide behavioural foundations for generic interaction components, but shadcn is not Ledger's public design system. Ledger owns the contract, API, styling, and documentation.
- Reuse Ledger components instead of duplicating them. Do not add speculative variants or states.
- Generic interaction components may build on shadcn/Radix foundations. Banking-domain components and patterns are Ledger-owned.
- Prefer small, opinionated Ledger APIs over exposing raw primitive APIs.
- Preserve semantic HTML, accessible names and relationships, keyboard behaviour, visible focus, focus management, and reduced-motion behaviour.
- Preserve Server Component/client boundaries. Do not pull client-only runtime into a Server Component-safe entry.
- Prefer native browser behaviour where it is sufficient. Do not add a third-party UI library unless explicitly requested.

## Component ingestion workflow

Use this repeatable path for new design-system components:

`shadcn/Radix behaviour -> Ledger contract -> Ledger-owned API -> Ledger semantic styling -> Storybook -> tests -> package export -> independent review -> visual review -> commit`

Every new component should include:

- `Component.tsx`
- `Component.css`
- `Component.stories.tsx`
- `Component.test.tsx` where meaningful
- `Component.md`

`Component.md` must describe purpose, anatomy, required and optional elements, behaviour, accessibility, usage guidance, anti-patterns, and relationships to related components. Stories must demonstrate the supported public API and important states rather than recreate the component with custom markup.

## Builder agent role

The Builder owns implementation, component documentation, Storybook, tests, builds, and a final report of changed files and material decisions.

The Builder must:

- work only within the explicit scope and avoid unrelated fixes
- inspect existing foundations, components, contracts, and conventions first
- make reasonable local decisions instead of interrupting for minor clarification; surface choices that would establish a new system convention
- run proportionate verification before reporting completion and never claim an unrun check passed
- not stage or commit files unless explicitly asked

## Reviewer agent role

The Reviewer must be independent from the Builder and is review-only by default. Unless explicitly instructed to edit, the Reviewer must not change files. Review architecture, accessibility, public API, tests, documentation, package boundaries, client boundaries, and regressions; inspect the actual repository state rather than trusting the Builder's report.

Classify findings as:

- `BLOCKER`
- `IMPORTANT`
- `MINOR`
- `GOOD`

Conclude with exactly one recommendation:

- `ACCEPT`
- `ACCEPT WITH MINOR FOLLOW-UP`
- `REVISE BEFORE MERGE`

## Review loop

`Builder -> Reviewer -> Builder revisions -> Reviewer re-review -> human visual review -> commit`

`BLOCKER` and `IMPORTANT` findings should normally be resolved before commit. `MINOR` findings may be deferred intentionally. The Builder should assess each finding against the repository and component contract rather than implement it blindly.

## Verification gates

Before a component-family batch is ready for human review, run and report:

- TypeScript check
- design-system build
- relevant tests
- Storybook production build
- `git diff --check`
- scope audit
- token/theme leakage audit
- package export and client-boundary review

If browser interaction tests cannot run because local browser binaries are unavailable, compile them, report the limitation clearly, and do not claim they executed.

## Human review

Agents do not replace design judgement. Before commit, a human should review the relevant Storybook stories for spacing, typography, hierarchy, layout, responsive behaviour, destructive emphasis, overlays, focus treatment, motion, and consistency across related components. Identify any change that also needs a Figma update.

## When to use multi-agent review

Use an independent Builder and Reviewer for component families, architecture changes, package/export changes, cross-cutting design-system work, and substantial refactors. The full workflow is not required for trivial copy edits, tiny documentation corrections, or obviously isolated low-risk changes.

## Commit discipline

- Start major agent runs from a clean working tree; if it is not clean, preserve existing user changes and keep scope explicit.
- Do not mix unrelated fixes into a component-family batch.
- Review `git status` before commit.
- Commit only after independent review and human visual review, and only when explicitly asked.
- Keep commits coherent and descriptive.

## Current architectural notes

- Interactive components use dedicated client package entries; the root design-system entry must remain Server Component-safe.
- `Dialog`, `AlertDialog`, and `Sheet` are distinct public components.
- Introduce shared internal abstractions only when actual drift justifies them.
- Tooltip Provider architecture is intentionally deferred.
- Broader z-index, motion, and dimension token systems are not yet formalised. Do not invent them opportunistically.
- Destructive intent uses Ledger semantic error tokens and the `Button` destructive variant.

## Existing scoped guidance

For design-system changes, preserve and follow `packages/design-system/AGENTS.md`, including its rules for component-family specifications, Storybook/Figma parity, accessibility, token use, scope control, and honest validation reporting. For bank-app changes, preserve the generated Next.js guidance in `apps/bank/AGENTS.md` and consult the installed Next.js documentation it identifies.
