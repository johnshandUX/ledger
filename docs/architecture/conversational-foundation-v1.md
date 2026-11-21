# Conversational foundation V1

## Architecture assessment

Ledger had no shared conversation model or message/clarification components. Ledger Bank Reporting had a polished controlled Textarea composition with suggestions and a deliberately disabled future submit action. Its report configuration, validation, query, generation, scheduling and ephemeral reporting state were already correctly domain-owned. LedgerOS Playground had a separate curated-prompt selector and predefined preview renderer; it did not interpret free text or maintain a conversation.

The existing design-system package already owns cross-product interaction primitives, semantic tokens, Storybook, tests and dedicated client entries. A new package would duplicate its publication and dependency boundary without isolating a distinct domain. The foundation therefore extends the design system through the client-only `./conversation` entry; the Server Component-safe root remains unchanged.

## Reuse and ownership

Conversation composes Ledger Button, Textarea and Radio and uses existing tokens. Reporting retains its product surface, heading icon and unavailable action treatment. Report interpretation, account discovery, Synthetic Finance access, configuration validation, report execution, previews, schedules, My reports, Connected reporting and ERP destinations remain in Ledger Bank. Playground prompt selection, intent interpretation and preview generation remain in LedgerOS.

## Shared contracts

The entry defines typed messages, meaningful interaction states, clarifications, domain-defined structured actions, a validated outcome union, and an asynchronous interpreter interface. Interpreters receive domain context, message history, an AbortSignal and request sequence. A pure reducer plus optional React hook manage ephemeral messages, status, outcomes, clarification selection, reset, cancellation and stale-response protection. Persistence is intentionally consumer-owned.

System-role messages may exist for interpretation context but the shared message presenter never renders them as customer-facing messages. Domain action objects must carry a discriminant and are rendered and executed only by consumers.

## Compatibility

At the original foundation checkpoint, Reporting consumed only the shared controlled input and submission remained unavailable. The combined V1.3 release adds the Bank-owned assisted Reporting adapter without moving Caldermere data access or interpretation into the shared layer.

Playground can later adopt messages, input, clarification, state and interpreter contracts while retaining a broader product-specification action type and a model-backed or deterministic interpreter. Its existing curated prompt-to-preview selector is not a conversation and remains unchanged. The shared action generic avoids assuming that outcomes are reports.

## Potential compatibility issues

The conversation entry is client-oriented because it includes a hook and interactive components. Consumers needing contracts in Server Components should use type-only imports so no runtime client dependency crosses the boundary. The current clarification UI implements the approved single-choice requirement; free-text clarification is represented in the contract/state but deliberately has no speculative combined control. Figma has no Conversation pattern yet and needs a future parity update after human visual approval.

## Deferred decisions

No persistence policy, provider, transcript storage, model SDK, API route, orchestration layer, multi-choice clarification, streaming protocol or domain execution mechanism is defined. Those require demonstrated consumer needs. Reporting interpretation and Playground interface generation remain future product work.
