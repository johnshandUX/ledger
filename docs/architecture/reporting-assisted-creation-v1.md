# Reporting assisted creation V1

## Boundary

Ledger Bank owns deterministic reporting interpretation, Caldermere account and transaction grounding, configuration validation, coverage decisions and navigation. The Ledger conversation package remains domain-independent and continues to own only generic messages, interaction state, clarification controls, actions and cancellation.

No model, external service, API route, durable storage or alternate reporting engine is involved.

## Interpretation

`src/reporting/conversation.ts` combines small parsers for supported report types, account references, currencies, reporting periods, directions, amount boundaries and monthly recurrence. Each turn is interpreted with prior user messages, so a clarification answer refines the pending request instead of discarding earlier criteria. Unsupported domains return an explicit unsupported outcome.

Strict amount language is converted to the nearest representable minor-unit boundary: for example, “over £5,000” becomes an inclusive minimum of `5000.01`. No currency conversion occurs.

## Data grounding

The Reporting homepage constructs interpreter context from the active organisation’s effective accounts. Coverage is calculated through the existing `queryTransactionsForReport` function against the Bank baseline transaction dataset. Earliest and latest values are described as observed records, never as proof of complete history. Per-account ranges and accounts without history remain distinct.

Requested dates are never changed automatically. Customers may keep them, adjust the necessary bounds to the observed record range, or continue to the workspace to choose another period.

## Handoff and lifecycle

The existing Reporting provider carries one cloned `ReportConfiguration` during client navigation. `/reports/new` reads it as initial form state and consumes the handoff. Direct navigation uses the established default. The configuration remains editable and execution still requires the existing Generate report or Create schedule action.

The provider is in memory: client navigation preserves the handoff, while reload or provider remount clears it. No configuration is placed in the URL or browser storage.

## Supported scope

V1 supports transaction activity, eligible accounts by currency, recognised account names and identifiers, unambiguous multiple accounts, last month, last three complete months, rolling 12/24 months, this month, ISO date ranges, incoming/outgoing/all direction, minimum/maximum/range filters, CSV and monthly recurring preparation.

Formal statements, balance summaries, expense reports, payment-activity reports, unsupported recurrence frequencies, fuzzy dates, currency conversion and automatic execution remain outside scope.
