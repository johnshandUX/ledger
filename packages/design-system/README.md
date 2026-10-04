# Ledger Design System

The shared tokens, components, patterns and guidance used by LedgerOS and Ledger Bank.

## Package API

Main design-system components can be imported from the package root:

import {
	Button,
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
does not export React `Link`, `Card`, or `Badge` components.

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
