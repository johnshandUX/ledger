# Ledger Bank

Ledger Bank is the separate reference implementation for LedgerOS. It is a fictional commercial banking prototype using the shared Caldermere synthetic-finance environment and the local Ledger Design System package. It is not a production banking service.

## Finance data

The consumer boundary is intentionally narrow:

`Caldermere finance environment → shared selectors/calculations → Bank finance adapter → product UI`

`src/finance` creates the default `normal-trading` environment once and exposes typed account, transaction, payment, user and reporting queries. Presentation components do not construct scenarios, inspect raw fixture arrays or redefine finance rules. Account balances remain integer minor units until the shared Bank formatting adapter converts them for display.

The migrated Accounts and account-detail experiences now use the complete Caldermere account estate and recent Caldermere transactions. The old app-local account, transaction, payment, beneficiary, business and user fixtures were removed so there is one finance source of truth. Amelia Hart (`user-amelia-hart`) is the deterministic development identity; this is presentation context, not authentication or session management.

Future Bank features should consume shared synthetic-finance selectors and calculations through this adapter. Replacing Caldermere with a backend should change the adapter rather than presentation components.

## Local development

From the repository root:

```bash
npm install
npm run dev:bank
```

Open the local URL printed by Next.js, normally `http://localhost:3000`.

## Validation

```bash
npx tsc -p apps/bank/tsconfig.json --noEmit
npm -w apps/bank run lint
npm -w apps/bank run test
npm run build:bank
```

The application currently has no environment variables, authentication, API keys, persistence or paid-service dependencies.

## Production deployment

The bank is deployed as a dedicated Vercel project, separate from the LedgerOS website:

- **Public URL:** `https://bank-seven-delta.vercel.app`
- **Project:** `john-shands-projects/bank`

- **Root Directory:** `apps/bank`
- **Framework Preset:** Next.js
- **Install Command:** leave automatically detected
- **Build Command from the app root:** `npm run build`
- **Required workspace access:** `packages/design-system` and `packages/synthetic-finance`
- **Environment variables:** none currently

In the Root Directory settings, keep **Include source files outside of the Root Directory in the Build Step** enabled so Vercel can read the root lockfile and both shared packages. Vercel enables this by default for modern projects, but it should be verified during import. The repository uses standard npm workspaces, so the install command should remain auto-detected rather than overridden.

When moving to another production URL:

1. Set `NEXT_PUBLIC_LEDGER_BANK_DEMO_URL` on the separate `apps/site` Vercel project.
2. Rebuild the LedgerOS website so its showcase links to the bank.
3. Test the external link, desktop/mobile account views and account-detail routes in production.
4. Configure a bank subdomain only after the generated Vercel URL is working.

The generated Vercel URL has been verified against the account overview and account-detail routes. Configure a custom bank subdomain only when the wider LedgerOS domain is ready.
