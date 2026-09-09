# ledger-design-system
A production-focused design system and prototype for a modern business banking platform

## Package API

Main design-system components can be imported from the package root:

import {
	Button,
	Checkbox,
	FormField,
	Input,
	Radio,
	Select,
	Textarea
} from "@johnshandux/ledger-design-system";

Icons are available from the `icons` subpath and are separated from the main entry:

import {
	InformationIcon,
	SuccessIcon,
	WarningIcon,
	ErrorIcon
} from "@johnshandux/ledger-design-system/icons";

Icons are provided from a dedicated bundle so the icon dependency and runtime
implementation do not affect the server-compatible main design-system entry.
