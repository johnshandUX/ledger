# Icon

## Purpose

`Icon` renders the approved Ledger icon catalogue. Lucide supplies the initial artwork; Ledger owns each semantic name, supported use, size, accessibility contract and future replacement.

Applications consume `Icon` from `@johnshandux/ledger-design-system/icons` and must not depend directly on Lucide. A registry entry can therefore move from a Lucide component to a custom Ledger component without changing product code.

## Anatomy

An icon is a single outline SVG that inherits `currentColor`. Its semantic `name` selects the implementation from the governed registry.

## API

- `name` is required and accepts only an approved `IconName`.
- `size` is optional: `small` (16px), `medium` (20px, default), or `large` (24px).
- `aria-label` makes a standalone meaningful icon available to assistive technology.
- Compatible SVG attributes such as `className` may be passed through. Ledger retains control of colour, dimensions, fill and stroke.

```tsx
import { Icon } from "@johnshandux/ledger-design-system/icons";

<Icon name="search" />
<Icon name="warning" aria-label="Payment requires review" />
```

## Behaviour and accessibility

Icons are non-interactive. Without an `aria-label`, an icon is decorative and receives `aria-hidden="true"`. With an `aria-label`, it receives `role="img"`. Interactive controls still require their own accessible names; do not rely on the icon's label to name a button or link.

Colour inherits from surrounding text through `currentColor`. Use a semantic Ledger colour token on the owning context. Icons do not create status meaning through colour alone.

Ledger defines exactly four status-icon colour roles: `--ledger-color-icon-status-info`, `--ledger-color-icon-status-success`, `--ledger-color-icon-status-warning`, and `--ledger-color-icon-status-error`. Higher-level feedback components own when those roles apply. `Icon` deliberately has no `status` or arbitrary colour prop: ordinary information, success, warning, and error glyphs still inherit the standard surrounding colour unless they are communicating explicit semantic state.

## Usage guidance

Use icons to reinforce an action, destination, object or status. Prefer visible text when an unfamiliar symbol could be ambiguous. Use one of the supported sizes and preserve the icon's proportions.

Do not import from `lucide-react` in product applications, select arbitrary Lucide artwork, use icons as the only expression of important information, or override Ledger's stroke and sizing contract.

## Relationships

`Icon` may appear beside text or inside controls such as Button and Input when those component contracts support icon composition. The control remains responsible for interaction semantics, focus and accessible naming.
