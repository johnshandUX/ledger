# LedgerOS website

The public LedgerOS website is a separate Next.js workspace app. It consumes the local Ledger design-system package and does not embed Ledger Bank.

## Local development

From the repository root:

```bash
npm install
npm run dev:site
```

Open `http://localhost:3000`. To create a production build or run a standalone type check:

```bash
npm run build:site
npm -w apps/site run typecheck
```

## Environment

Copy `.env.example` to `.env.local` when needed.

- `NEXT_PUBLIC_LEDGER_BANK_DEMO_URL` — optional absolute URL overriding the verified Ledger Bank deployment at `https://bank-seven-delta.vercel.app`.
- `NEXT_PUBLIC_SITE_URL` — the website origin used for absolute social-preview metadata. Use the production LedgerOS URL in Vercel.

## Production deployment

The website is deployed as a separate Vercel project at `https://ledger-os-sigma.vercel.app`, with **Root Directory** set to `apps/site`. The repository uses npm workspaces, so Vercel installs from the monorepo lockfile and retains access to `packages/design-system`.

The bank link already points to its verified deployment. Set `NEXT_PUBLIC_LEDGER_BANK_DEMO_URL` only when moving the bank to another production origin, such as a custom domain.
