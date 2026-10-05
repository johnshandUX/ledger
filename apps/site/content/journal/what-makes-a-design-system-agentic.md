---
number: "003"
title: "What makes a design system agentic?"
slug: "what-makes-a-design-system-agentic"
summary: "A design system for agents needs more than accessible code: it needs explicit knowledge, constraints and guidance for making design decisions."
publishedDate: "2026-10-04"
status: "published"
tags:
  - Agentic design systems
  - AI-assisted design
  - Design systems
---

I’ve been calling LedgerOS an agentic design system.

I should probably explain what I mean by that.

A normal coded design system already gives an AI agent quite a lot to work with. There are components, properties, tokens and code. Give an agent access to it and it can inspect those things and use them.

But that doesn’t mean it understands the system.

Knowing that a component called `Button` exists is the easy bit.

Knowing when to use a primary button, when not to use one, how actions should be arranged, what content belongs inside it and which accessibility requirements apply is much closer to design knowledge.

That’s the bit I’m interested in.

I want LedgerOS to contain enough information for an agent to make sensible design decisions using the system, rather than simply having access to a component library.

Some of that knowledge lives naturally in code.

A component API constrains what an agent can do. Design tokens constrain visual decisions. TypeScript types can define which values are valid.

Some of it needs to be explained.

That might be usage guidance, documentation, financial formatting rules or instructions about which layer of the system owns a particular decision.

And eventually I think some of it could become much more explicit.

Financial services are highly regulated. Accessibility matters. Certain behaviours shouldn't be left to interpretation. If these rules can be expressed as part of the system, an agent has a much clearer set of boundaries to work within.

That raises a bigger question for me.

Could parts of a design system eventually become auditable?

Could we know not only which component an agent used, but why it was allowed to use it, which version it used and which rules governed that decision?

I don't know yet.

But that's much more interesting to me than simply asking AI to generate interfaces.

I’ve already experimented with files such as `AGENTS.md` and design-system documentation to give agents additional context. Storybook provides another view of the components. The application itself becomes evidence of how the system is actually being used.

I’m starting to see the design system less as a collection of reusable UI and more as a body of knowledge about how a product should be built.

That knowledge has two audiences now.

People and agents.

And I think that changes how design systems need to be designed.

A beautifully documented component library that requires a human designer to interpret all of its unwritten rules is still useful. But an agent can’t reliably infer years of design-team knowledge from a set of screenshots.

The rules need to become explicit.

The interesting question is how far we can take that.

LedgerOS is where I’m trying to find out.
