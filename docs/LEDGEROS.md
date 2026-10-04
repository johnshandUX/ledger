# LedgerOS direction

LedgerOS is the main website, documentation and playground for a code-first commercial banking project. It presents the Ledger Design System and Ledger Bank, and is a learning and portfolio project rather than production banking software.

## Proposition and audiences

LedgerOS connects the Ledger Design System, Ledger Bank and practical guidance for AI-enabled workflows. It is intended for product designers, developers and teams exploring how constrained agents can support commercial banking prototyping.

## Project areas

- **Public website (`apps/site`)**: the overall project destination and explanation of the work.
- **Ledger Design System**: human-readable documentation for implemented foundations and components, emerging financial patterns, planned AI guidance and installation status.
- **Playground**: curated prompts paired with predefined examples today; grounded live generation is planned.
- **Ledger Bank (`apps/bank`)**: a separate, full-screen reference product that demonstrates the system in context.
- **Journal**: a maintainable home for future project decisions and learnings; no articles are published yet.
- **Ledger Design System package (`packages/design-system`)**: the reusable coded source of truth consumed by Ledger applications.

LedgerOS is the project destination. The Ledger Design System supplies the reusable implementation, and Ledger Bank consumes it to demonstrate product experiences without becoming part of the website.

## Routes

- `/`
- `/design-system`
- `/design-system/foundations`
- `/design-system/components`
- `/design-system/patterns`
- `/design-system/ai-guidance`
- `/design-system/installation`
- `/playground`
- `/ledger-bank`
- `/journal`

## Current and planned capability

Implemented now: the public website scaffold, real token and component documentation, predefined Playground examples, Ledger Bank showcase, and Journal empty state. The design-system foundations and component package and the separate Ledger Bank prototype pre-date the public site.

Planned: deeper documentation and financial patterns, stable machine-readable agent guidance, verified package distribution, and live Playground generation grounded in Ledger guidance.

## Milestones

1. Public website scaffold — live at `https://ledger-os-sigma.vercel.app`.
2. Documentation with richer real examples.
3. Hosted Ledger Bank demo — live and linked from LedgerOS at `https://bank-seven-delta.vercel.app`.
4. Supported package distribution.
5. Grounded live Playground generation.

New work should materially support at least one of these outcomes.
