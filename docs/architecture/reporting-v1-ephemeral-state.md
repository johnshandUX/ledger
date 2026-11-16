# Reporting V1 ephemeral state

Reporting V1 Phase 2B follows EDS-001 with a dedicated `ReportingStateProvider` mounted once in
Ledger Bank's root layout, inside the existing Bank provider. The provider owns a narrow reducer
for generated report definitions, completed runs, immutable output snapshots and illustrative
monthly schedules. It remains mounted during App Router client navigation and is recreated on a
full reload or in a separate browser tab.

Reporting records are deliberately separate from the Synthetic Finance overlay. Synthetic Finance
continues to provide immutable transaction inputs. Effective in-memory account metadata is supplied
at query time so generated snapshots reflect account changes already made in the active application;
pure framework-independent modules
query those inputs, create CSV snapshots and calculate monthly run times. Named reporting outcomes
are dispatched atomically to the provider. No page component, module singleton, browser storage,
cookie, API write path, database, scheduler or object store owns reporting state.

Downloads use the CSV string captured when the report was generated. They do not rerun the query,
which keeps repeated downloads stable for the lifetime of the application instance. Recurring
schedules are configured records only and never create future runs or perform ERP delivery.
