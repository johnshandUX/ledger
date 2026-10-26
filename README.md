# LedgerOS

LedgerOS is a fictional commercial banking project built as a public learning and portfolio exercise. It combines a code-first design system, a working banking prototype, documentation and a small playground for exploring how the system can support product work. It is not production banking software.

## How the project fits together

- **Ledger Design System** is the reusable source of truth for design tokens, React components, interaction patterns, documentation and Storybook examples.
- **Ledger Bank** is the reference product. It consumes the design system and demonstrates commercial banking journeys and domain decisions in context.
- **Playground** is part of the LedgerOS website. It currently pairs curated prompts with predefined previews; live generation grounded in Ledger guidance is planned.
- **LedgerOS website** is the public project destination. It brings together the design-system documentation, Playground, Ledger Bank overview and project journal.

The design system owns reusable interface code. Ledger Bank owns banking-specific experiences and business logic. The website explains and demonstrates both without embedding the full bank application.

## Repository structure

```text
apps/
  bank/                 Ledger Bank Next.js application
  site/                 LedgerOS website, documentation and Playground
packages/
  design-system/        Tokens, components, docs, tests and Storybook
  synthetic-finance/    Shared deterministic demo finance data
docs/                   Architecture and project documentation
```

## Prerequisites

- Node.js 20.9 or later (required by the current Next.js version)
- npm 11 or a compatible npm version with workspace support
- Git, if you want to clone and contribute to the repository

## Install dependencies

From the repository root, install the locked workspace dependencies:

```bash
npm ci
```

Use `npm install` instead when intentionally updating dependencies or the lockfile.

## Run locally

Each command below runs from the repository root. The first run builds the local packages consumed by the application.

### LedgerOS website

```bash
npm run dev:site
```

Open [http://localhost:3000](http://localhost:3000).

### Ledger Bank

```bash
npm run dev:bank
```

Open the local address printed by Next.js. Stop the website first or choose another port if port 3000 is already in use.

### Design-system Storybook

```bash
npm -w packages/design-system run storybook
```

Open [http://localhost:6006](http://localhost:6006).

## Build, test and type-check

Build all packages and both applications:

```bash
npm run build
```

Build an individual application and its local dependencies:

```bash
npm run build:site
npm run build:bank
```

Build Storybook:

```bash
npm -w packages/design-system run build-storybook
```

Run the available unit tests:

```bash
npm -w packages/design-system run test
npm -w packages/synthetic-finance run test
npm -w apps/bank run test
npm -w apps/site run test:journal
```

Run the standalone type checks:

```bash
npm -w packages/design-system run typecheck
npm -w packages/synthetic-finance run typecheck
npm -w apps/site run typecheck
```

The Next.js production builds also validate the application TypeScript used by Ledger Bank and the LedgerOS website.

## Explore or download the source

Browse the project on [GitHub](https://github.com/johnshandUX/ledger), or clone it locally:

```bash
git clone https://github.com/johnshandUX/ledger.git
cd ledger
npm ci
```

GitHub also provides a **Download ZIP** option from the repository's **Code** menu if you do not need Git history.

## Package distribution status

The Ledger Design System works as a local npm workspace package and is consumed by the LedgerOS and Ledger Bank applications in this repository. Its package metadata includes GitHub Packages registry configuration, but external installation, release automation, compatibility testing and a supported public distribution flow have not yet been verified. Treat the source repository and local workspace as the supported way to explore the system for now.

## Project status and contributions

LedgerOS is a personal, public portfolio and learning project under active development, rather than a maintained production banking product. Issues and thoughtful feedback are welcome; please open an issue before investing in a substantial contribution so the proposed work can be aligned with the project's direction.

This repository currently has no root licence file. Some package manifests contain licence metadata, but a repository-wide licence has not been selected or added. Please do not assume permission to reuse or redistribute the code until that decision is made.
