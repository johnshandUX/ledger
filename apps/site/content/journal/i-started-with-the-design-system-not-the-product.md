---
number: "002"
title: "I started with the design system, not the product"
slug: "i-started-with-the-design-system-not-the-product"
summary: "Why LedgerOS began with foundations and components, then used Ledger Bank to test what genuinely belongs in the system."
publishedDate: "2026-10-04"
status: "published"
tags:
  - Design systems
  - Ledger Bank
  - Systems thinking
---

One of my first decisions with Ledger was to start with the design system.

That probably sounds backwards.

AI makes it incredibly easy to describe a banking dashboard and have something convincing appear a few minutes later. I could have started there, refined the screens and extracted a design system afterwards.

I deliberately went the other way.

I started with tokens, typography and some fairly boring components: Button, Input, Textarea, Select, Checkbox, Radio and FormField.

There was a practical reason for it.

I wanted to find out whether I could get AI to build with a system, rather than repeatedly asking it to make things that looked roughly the same.

That distinction has become increasingly important as I’ve worked on LedgerOS.

If I ask an agent to make a button a certain colour, height and radius, I’ve designed one button through a prompt.

If the agent uses the Button from my design system, I’ve encoded that decision once.

The same principle applies much further than buttons.

If colour is tokenised, I can change the visual language without finding every place a colour has been used. If form behaviour is handled by shared components, improving that component improves every product using it. If a requirement changes, I want to know how much of that change can happen at the system level rather than asking every product team to solve it independently.

That matters in financial products.

They change constantly. New features arrive. Regulation changes. Accessibility requirements develop. Brands change. Products get added, merged or retired.

The value of the system becomes much clearer when something changes.

There was a downside to starting this way.

It’s very easy to disappear into design-system work and invent abstractions for problems the product doesn’t actually have.

I started noticing that quite quickly.

So the approach changed.

I built enough foundation to establish the system, then started building Ledger Bank. Accounts gave me the first proper product slice. The product could then tell me what the design system was missing.

That created a much healthier loop.

Build some system. Use it in a real product. Find the gaps. Decide whether those gaps genuinely belong in the system. Repeat.

That last part matters.

Not everything reusable-looking needs to become a component.

I’m still working out where that line sits, but Ledger Bank gives me somewhere to test the decision rather than guessing.

So I’d still start with the design system.

I just wouldn’t try to finish it first.
