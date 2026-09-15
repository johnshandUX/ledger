<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Responsive data equivalence

When the same dataset has separate desktop and mobile presentations, both representations must
preserve the same records, domain meaning, important fields, ordering, currency source, status,
and available actions. Responsive adaptation may change layout, labels, or information density,
but it must not silently change the underlying data or transaction-direction semantics. Test the
shared meaning where practical. This is product guidance, not a mandate to create a generic
responsive-data component.
