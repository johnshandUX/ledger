---
number: "006"
title: "Libraries: Core, Finance Domain, Product"
slug: "libraries-core-finance-domain-product"
summary: "When is a components core, financial or product specific."
publishedDate: "2026-10-05"
status: "published"
tags:
  - "Design systems"
  - "categorisation"
  - "hierarchy"
  - "taxonomy"
---

One of the harder questions in building LedgerOS has been deciding where things belong.

A Button is easy.

It belongs in the design system.

An Accounts Table built specifically for Ledger Bank is also fairly easy. That’s product UI.

The difficult stuff sits somewhere in between.

Take an Account Card.

Accounts aren’t specific to Ledger Bank. They’re a common concept across financial products. A business banking app might use them. An accounting product might use them. A lending product could need them too.

But an Account Card definitely isn’t a foundational UI component in the same way as a Button.

That problem led me to start thinking about LedgerOS in three layers.

Core. Domain. Product.

Core contains the product-agnostic foundations.

Buttons, inputs, tables, dialogs, typography, spacing, colour, elevation and the other primitives needed to build an interface.

Core shouldn’t know what an account is.

The domain layer does.

For LedgerOS, that domain is finance.

This is where concepts such as accounts, money, transactions, payments and financial formatting can start to exist.

Then there’s the product layer.

Ledger Bank can take those foundations and financial concepts and turn them into something specific to commercial banking.

That separation sounds tidy written down.

In practice, it isn’t always obvious.

I’ve found myself repeatedly asking whether something is genuinely a shared financial pattern or whether I’m promoting it into the system because I’ve happened to need it twice.

That’s an important distinction.

If everything becomes reusable, the shared system eventually becomes full of product decisions.

If nothing becomes reusable, every new product starts solving the same problems again.

So I’ve started using a fairly simple test.

Would this still make sense if Ledger Bank didn’t exist?

A Button obviously would.

Formatting £1,250.00 probably would.

A very specific account table with Ledger Bank’s columns, actions and filtering probably wouldn’t.

The interesting cases are the ones where I can’t answer immediately.

Those are usually worth leaving in the product until there’s evidence that they should move.

This matters because I don’t want LedgerOS to become a design system for one fictional bank.

The bigger experiment is whether I can build another financial product on top of the same foundations without starting again.

Maybe that’s accounting.

Maybe pensions.

Maybe expenses.

I don’t actually need to decide yet.

When that second product arrives, it will put this architecture under much more pressure.

It will expose which parts of LedgerOS are genuinely shared and which parts only looked reusable because Ledger Bank was the only consumer.

That’s the bit I’m looking forward to.

A second product won’t simply demonstrate that the system scales.

It will tell me whether I designed the system properly in the first place.
