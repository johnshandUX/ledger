# Conversation

## Purpose

Conversation is a client-only core pattern for intent-led interactions. It manages presentation and ephemeral interaction state while the consuming application owns interpretation, validation, domain context and execution.

## Anatomy

The family contains a controlled multiline input, ordered message presentation, single-choice clarification controls, a domain-supplied action container, typed contracts, a pure reducer and an optional `useConversation` controller.

## Behaviour

Enter submits a non-empty enabled request; Shift+Enter inserts a line break. Suggestions only populate the controlled value. Interpretation is asynchronous and receives an `AbortSignal` plus monotonically increasing request identifier. Starting a new request clears the previous clarification or outcome presentation. Superseded and reset requests cannot overwrite newer state.

## Accessibility

Inputs require an accessible label and the input section is named by its optional heading or label. Consumers may select heading level two or three to preserve page hierarchy. Messages use an ordered list and only new items are politely announced. Timestamps are omitted unless a consumer supplies a stable formatter. System messages are retained in state but excluded from customer-facing presentation. Clarifications use a native fieldset and radio group. Processing and errors use visible text rather than colour alone.

## Usage

Use the `./conversation` package entry. Define a domain action as a discriminated object with a `type` property and provide an interpreter at the application boundary. Render and execute actions in the application.

## Anti-patterns

Do not place domain validation, persistence policy, model-provider code, system instructions, or autonomous orchestration in this family. Do not expose an action unless the consumer implements it.

## Relationships

Conversation composes Button, Textarea and Radio. Alert may present additional domain feedback. Product-specific layouts and visual identity remain in applications.
