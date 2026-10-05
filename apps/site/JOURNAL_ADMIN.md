# Journal admin configuration

The Journal admin writes canonical Markdown to GitHub. Keep every credential server-side and use a non-production branch until the workflow has been manually verified.

## Required environment variables

```text
AUTH_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
JOURNAL_ADMIN_GITHUB_USER_ID=
JOURNAL_GITHUB_TOKEN=
JOURNAL_GITHUB_OWNER=johnshandUX
JOURNAL_GITHUB_REPOSITORY=ledger
JOURNAL_GITHUB_BRANCH=journal-admin-test
```

`JOURNAL_GITHUB_TOKEN` must be a fine-grained personal access token restricted to the `johnshandUX/ledger` repository with Contents read and write permission. `JOURNAL_ADMIN_GITHUB_USER_ID` is the immutable numeric ID of the only GitHub account allowed to sign in.

Do not prefix any private value with `NEXT_PUBLIC_`.

The first manual publishing test must target `journal-admin-test` or another non-production branch. Change `JOURNAL_GITHUB_BRANCH` to `main` only after authentication, draft creation, publishing, optimistic conflict handling, and Vercel deployment behavior have been verified.
