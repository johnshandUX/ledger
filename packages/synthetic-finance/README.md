# Ledger Synthetic Finance

`@johnshandux/ledger-synthetic-finance` is the shared foundation for Ledger's deterministic fictional finance environment. It is intended to behave like a lightweight fake finance backend: consumers use common domain contracts and services instead of maintaining separate, drifting JSON fixtures.

**Status: v1 foundation complete.** Caldermere Ltd is the current canonical fictional commercial customer.

The package is organised around seven distinct concepts:

> **DOMAIN**
> What financial things mean.
> **DATASET**
> Who and what exists.
> **ANCHOR DATA**
> Stable, deliberately hand-authored Caldermere facts.
> **GENERATED ACTIVITY**
> Deterministic background financial activity.
> **SELECTORS**
> Return domain entities matching a query.
> **CALCULATIONS**
> Derive financial meaning from those entities.
> **SCENARIO**
> What is happening to them at a given point in time.

Ledger Bank, Storybook, automated tests, screenshots, marketing, and the future Ledger Playground consume or can opt into the same canonical synthetic finance environment. Consumers should not create duplicate copies of Caldermere finance data.

## Domain, dataset, and scenario

The domain defines the shared financial contracts and uses integer minor units for all monetary values. For example, `amountMinor: 1250400` with `currency: "GBP"` represents £12,504.00. Monetary values must be safe integers; the package does not use floating-point major-unit values for finance data.

Caldermere users have zero or one descriptive banking role: Administrator, Payment operator, Payment approver, or Viewer. Additional access is independent of banking role; the customer-neutral catalogue currently defines Developer access for developer tools, APIs, and integrations. Developer access does not grant banking permissions. Existing permission metadata remains available for established Bank behaviour, but v1 does not provide configurable entitlement management.

## Caldermere

Caldermere Ltd is the first canonical synthetic commercial banking customer. It currently contains one `Business` and one distinct `LegalEntity`, both named Caldermere Ltd, plus a deliberately broad estate of operating, reserve, restricted, historical, and foreign-currency accounts.

The anchor dataset is deterministic and anchored at `CALDERMERE_AS_OF`. It contains only stable, hand-authored records: named users, accounts, counterparties, payments, invoices, and representative transactions. Balance snapshots are the canonical current balances; transaction history is not intended to reconcile every account.

> **ANCHOR DATA**
> Stable, hand-authored Caldermere facts.
> **GENERATED ACTIVITY**
> Deterministic background financial activity.

## Generated Caldermere activity

`caldermereDataset` is the canonical hand-authored anchor data. `createCaldermereDataset()` returns a deep-cloned anchor plus deterministic background commercial banking activity.

```ts
import {
  createCaldermereDataset,
  CALDERMERE_AS_OF,
  CALDERMERE_DEFAULT_SEED,
} from "@johnshandux/ledger-synthetic-finance";

const dataset = createCaldermereDataset({
  seed: CALDERMERE_DEFAULT_SEED,
  asOf: CALDERMERE_AS_OF,
});
```

The default environment contains 1,200 transactions, 200 payments, and 120 invoices across roughly 90 days. Reusing the same seed and `asOf` produces structurally identical data; another seed varies the generated activity while preserving domain validity. Seeds are unsigned 32-bit integers (`0` through `4,294,967,295`), matching the generator's unique deterministic state space.

Generated records supplement rather than regenerate the anchors. They model recurring customer receipts, supplier payments, operating debits and credits, internal treasury movements, fees, foreign-currency activity, and historical invoices. External processes may appear in bank transaction descriptions—for example, “Monthly payroll”—without becoming payroll, procurement, tax, or accounting domains in this package.

Generated history does not recalculate balance snapshots. It also adds no current pending or failed payments and no pending approval actions, preserving Caldermere’s designed current payment and approval summaries.

## Caldermere scenarios

A scenario is a small deterministic overlay on the enriched Caldermere environment. It changes a focused finance condition without duplicating the company, regenerating its anchors, or mutating the canonical dataset.

```ts
import {
  createCaldermereScenario,
  getApprovalSummary,
} from "@johnshandux/ledger-synthetic-finance";

const dataset = createCaldermereScenario({
  scenario: "approval-backlog",
});

const approvals = getApprovalSummary(dataset, {
  businessId: "business-caldermere",
});
```

`createCaldermereScenario()` returns a standard `FinanceDataset`, so existing selectors and calculations work unchanged and do not need to know which scenario produced it. The same scenario, seed, and `asOf` produce the same independent output. `normal-trading` is the unmodified enriched baseline; the other supported overlays represent cash-flow pressure, overdue receivables, large outgoing payments, an approval backlog, and an additional restricted account.

> **ANCHOR DATA**
> Stable, hand-authored Caldermere facts.
> **GENERATED ACTIVITY**
> Deterministic normal background activity.
> **SCENARIO OVERLAY**
> A small deterministic change representing a specific finance condition.

Scenarios are not separate copies of the business, mutable sessions, forecasts, or process simulations.

## Selectors and calculations

The consumer flow is:

`Synthetic finance dataset → selectors → calculations → consumer`

Selectors accept a `FinanceDataset` explicitly and return matching domain entities without mutating it. Calculations compose selectors to produce payment, approval, liquidity, receivables, and financial-snapshot summaries. They are pure, deterministic, and read-only.

Key rules:

- pending payments are derived from `awaiting-approval`, `scheduled`, and `processing`
- overdue invoices are derived from due date, outstanding balance, and an explicit `asOf`, rather than trusted from stored status alone
- payments awaiting approval and outstanding approval actions remain separate measures
- time-dependent APIs require `asOf`; there is no hidden current-time dependency
- currencies are never added together; financial positions are grouped by currency
- all arithmetic remains in integer minor units
- current liquidity excludes closed accounts, includes restricted ledger balances, and respects each restricted account's stored available balance
- transaction `from` and `to` filters are inclusive and apply to `valueDate`
- entity selectors preserve dataset order; transactions, payments, and approval actions return newest first

## Consumers

Consumers should keep their presentation boundary separate from finance semantics:

`Caldermere finance environment → shared selectors/calculations → consumer adapter → UI, tests, or Playground`

Ledger Bank selects `normal-trading` through its own small adapter. Its Accounts, account-detail and transaction experiences no longer maintain duplicate finance fixtures. Product-composition Storybook stories can opt into `createCaldermereScenario()` without injecting finance state globally or coupling primitive design-system stories to banking data.

The future Playground can use `createFinanceQueryContext()` as a narrow read-only boundary:

```ts
import { createFinanceQueryContext } from "@johnshandux/ledger-synthetic-finance";

const finance = createFinanceQueryContext({
  scenario: "approval-backlog",
});

const approvals = finance.getApprovalSummary();
const accounts = finance.getAccounts({ currency: "GBP" });
```

The context exposes typed queries and calculations, not its underlying `FinanceDataset` and not mutation operations. Each result is copied from private scenario state, so consumer changes cannot mutate later results. Future AI orchestration should ground financial figures in these query results rather than inventing values; model prompting, chat UI and mutable sessions remain outside this package.

## Current scope

The package provides:

- typed contracts for businesses, legal entities, users, roles, permissions, accounts, balances, transactions, counterparties, beneficiaries, payments, payment approvals, and invoices
- a typed `FinanceDataset` container
- lightweight referential-integrity validation
- public package-root exports
- the canonical deterministic Caldermere anchor dataset
- deterministic enriched Caldermere background activity
- deterministic Caldermere scenario overlays
- pure selectors for querying domain entities
- currency-safe payment, approval, liquidity, receivables, and snapshot calculations
- a narrow read-only scenario-aware finance query context for future Playground use

It deliberately does not provide runtime-random data, persistence, mutable simulation sessions, a REST API, AI orchestration, forecasting, FX conversion, or broader accounting systems. Those remain outside v1.
