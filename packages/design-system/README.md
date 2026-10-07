# Ledger Design System

The shared tokens, components, patterns and guidance used by LedgerOS and Ledger Bank.

## Package API

Main design-system components can be imported from the package root:

import {
	Button,
	Card,
	Checkbox,
	formatCurrencyAmount,
	FormField,
	Input,
	Radio,
	Select,
	Textarea
} from "@johnshandux/ledger-design-system";

Import `@johnshandux/ledger-design-system/styles.css` once in an application to consume Ledger
tokens, global typography, and the framework-neutral `.ledger-link` anchor convention. The package
exports server-safe components including `Badge`, `Alert`, `Card`, `Separator`, `Skeleton`,
`Spinner` and `AspectRatio`. It does not export a React `Link` component; use the `.ledger-link`
convention for semantic anchors.

Icons are available through the governed `Icon` API from the `icons` subpath and are separated from the main entry:

import { Icon } from "@johnshandux/ledger-design-system/icons";

<Icon name="search" />;
<Icon name="warning" aria-label="Payment requires review" />;

Lucide is the underlying source, while Ledger owns semantic naming, the supported catalogue,
sizing, accessibility, product meaning, and future custom replacements. Applications should not
import Lucide directly. The dedicated bundle keeps that implementation out of the server-safe root entry.

Interactive data tables use their dedicated client entry:

```tsx
"use client";

import {
  DataTable,
  type DataTableColumn,
} from "@johnshandux/ledger-design-system/data-table";
```

`Table` remains the semantic structural primitive. `DataTable` composes it with typed columns,
sorting, pagination, density, overflow, result counts, and data-state foundations.

Progress and Avatar use dedicated client entries:

```tsx
import { Progress } from "@johnshandux/ledger-design-system/progress";
import { Avatar } from "@johnshandux/ledger-design-system/avatar";
```

Roadmap records in the typed documentation manifest track implementation lifecycle separately from
publication. A planned record does not define an import path, public API or usable component.
