---
number: "005"
title: "Teaching the agent how to design"
slug: "teaching-the-agent-how-to-design"
summary: "Making an agentic design system that's both human and machine readable."
publishedDate: "2026-10-05"
status: "draft"
tags:
  - "AI-design"
  - "design systems"
  - "steering docs"
---

Giving an AI agent access to a design system doesn't mean it knows how to design with it.

That became obvious quite quickly.

An agent can inspect a component library and find a Button, Input, Table or Dialog. It can read the props and work out how to put those components on a page.

Technically, it's using the design system.

But that's quite different from using it well.

A designer looking at the same library brings a lot of knowledge that isn't necessarily captured anywhere.

They know that a destructive action probably shouldn't sit next to the primary action looking exactly the same. They know when a table is appropriate and when it isn't. They understand hierarchy, expected behaviours and the conventions that have developed around the product.

A lot of that knowledge is surprisingly informal.

It's picked up through critique, conversations, previous work, documentation and simply spending time with the product.

An agent doesn't have that history.

So I've started thinking about design-system documentation differently.

Traditionally, I might document a component for another designer or developer:

Here's the component.  
Here are the variants.  
Here are the states.  
Here's how to use it.

For an agent, I also need to think about the decisions surrounding it.

When should you use this?

When shouldn't you?

What should it be composed with?

What assumptions can you make?

What should you never change?

Which parts of the API are intentionally constrained?

And when should the agent stop and ask rather than make the decision itself?

I've started experimenting with this in LedgerOS using things like component documentation and `AGENTS.md`.

The interesting part is finding the right level of instruction.

I don't want to write enormous prompt files describing every possible situation. Apart from being difficult to maintain, that would effectively turn the design system into a very long instruction manual.

I'd rather put knowledge as close as possible to where it belongs.

If something can be enforced by the component API, enforce it there.

If it's a visual decision, it probably belongs in tokens or styles.

If it's component-specific guidance, document it with the component.

If it's a rule about how Ledger Bank behaves, that probably belongs with the product.

And if it's a broader instruction about how an agent should work with the repository, that's where something like `AGENTS.md` becomes useful.

This is starting to feel less like writing prompts and more like designing context.

That's an important distinction.

A huge prompt can tell an agent what to do once.

A well-structured system can help an agent make the same decision correctly next time without me repeating myself.

There's another benefit too.

Making these rules explicit for an agent exposes how much design knowledge normally lives in people's heads.

If I can't explain why something should be done a certain way, perhaps the system isn't as well defined as I thought.

So teaching an agent how to use LedgerOS is also forcing me to document LedgerOS properly.

That's useful whether the next consumer is an AI agent, a designer, a developer or someone I've never met.

The agent just happens to be very good at exposing the gaps.
