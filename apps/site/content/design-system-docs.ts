export type DocumentationStatus = "Implemented" | "Dedicated entry" | "Convention" | "Planned";

export const tokenGroups = [
  { name: "Spacing", description: "A nine-step scale from 4px to 64px.", tokens: [
    ["--ledger-space-1", "4px"], ["--ledger-space-2", "8px"], ["--ledger-space-3", "12px"], ["--ledger-space-4", "16px"], ["--ledger-space-5", "24px"], ["--ledger-space-6", "32px"], ["--ledger-space-7", "40px"], ["--ledger-space-8", "48px"], ["--ledger-space-9", "64px"],
  ] },
  { name: "Radius", description: "From square geometry to fully rounded controls.", tokens: [
    ["--ledger-radius-none", "0px"], ["--ledger-radius-small", "4px"], ["--ledger-radius-medium", "8px"], ["--ledger-radius-large", "16px"], ["--ledger-radius-full", "9999px"],
  ] },
  { name: "Borders", description: "No border, a structural 1px border and a 2px interactive boundary.", tokens: [
    ["--ledger-border-width-none", "0px"], ["--ledger-border-width-thin", "1px"], ["--ledger-border-width-thick", "2px"],
  ] },
  { name: "Elevation", description: "Restrained shadows; borders and spacing remain the default separators.", tokens: [
    ["--ledger-shadow-none", "none"], ["--ledger-shadow-small", "0 1px 2px / 6%"], ["--ledger-shadow-medium", "0 4px 12px / 8%"], ["--ledger-shadow-large", "0 12px 32px / 12%"],
  ] },
] as const;

export const componentCatalog: ReadonlyArray<{ name: string; status: DocumentationStatus; entry: string; purpose: string; contract: string }> = [
  { name: "Button", status: "Implemented", entry: "root", purpose: "Triggers an action.", contract: "Primary, secondary and destructive variants. Native button attributes pass through; disabled is not a supported Ledger pattern." },
  { name: "Input", status: "Implemented", entry: "root", purpose: "Collects a single-line value.", contract: "Requires a label and supports hint and error text with linked accessible descriptions." },
  { name: "Textarea", status: "Implemented", entry: "root", purpose: "Collects longer text.", contract: "Matches the Input field structure and remains vertically resizable." },
  { name: "Select", status: "Implemented", entry: "root", purpose: "Chooses one value from a defined list.", contract: "Uses a native select and preserves native keyboard and form behaviour." },
  { name: "Checkbox", status: "Implemented", entry: "root", purpose: "Toggles an independent choice.", contract: "Uses a native checkbox with a clickable label, hint and error support." },
  { name: "Radio", status: "Implemented", entry: "root", purpose: "Chooses one option in a group.", contract: "Uses a native radio input and retains browser arrow-key behaviour within a named group." },
  { name: "FormField", status: "Implemented", entry: "root", purpose: "Composes shared field state.", contract: "Passes identifiers, labels and state to a compatible child control. It is a composition pattern, not a replacement for native semantics." },
  { name: "Table", status: "Implemented", entry: "root", purpose: "Presents structured tabular data.", contract: "Composable semantic table primitives with accessible naming and left, centre or right alignment." },
  { name: "Dialog", status: "Dedicated entry", entry: "./dialog", purpose: "Contains a compact focused task.", contract: "Requires a visible title. Radix supplies modal semantics, focus management, Escape dismissal and focus return." },
  { name: "Tooltip", status: "Dedicated entry", entry: "./tooltip", purpose: "Adds brief non-interactive supplementary text.", contract: "Accepts one trigger element and required content; opens after a 400ms default delay." },
  { name: "Popover", status: "Dedicated entry", entry: "./popover", purpose: "Shows contextual interactive content.", contract: "Non-modal, trigger-anchored content with dismissal and focus return." },
  { name: "DropdownMenu", status: "Dedicated entry", entry: "./dropdown-menu", purpose: "Offers a compact keyboard-navigable action list.", contract: "Supports default and destructive item intent, disabled items and separators." },
  { name: "AlertDialog", status: "Dedicated entry", entry: "./alert-dialog", purpose: "Confirms a high-consequence decision.", contract: "Requires a visible title plus explicit cancel and action elements." },
  { name: "Sheet", status: "Dedicated entry", entry: "./sheet", purpose: "Presents supporting content from a viewport edge.", contract: "Requires a title and supports left or right placement, an optional description and close control." },
  { name: "AppearanceToggle", status: "Dedicated entry", entry: "./appearance-toggle", purpose: "Switches the effective application appearance.", contract: "Controlled light/dark presentation with a stable pressed-state accessibility contract; applications own system preference and runtime state." },
  { name: "Status icons", status: "Dedicated entry", entry: "./icons", purpose: "Communicates information, success, warning or error.", contract: "Small, medium and large sizes; decorative by default, with aria-label support for meaningful use." },
  { name: "Link", status: "Convention", entry: "styles.css", purpose: "Navigates to another destination.", contract: "Use a semantic anchor with the .ledger-link class. Routing remains application-owned." },
  { name: "Badge", status: "Planned", entry: "—", purpose: "Will communicate compact status or classification.", contract: "Specified in principle but no public React component exists." },
  { name: "Card", status: "Planned", entry: "—", purpose: "Will group related content where a surface improves comprehension.", contract: "Specified in principle but no public React component exists." },
];

export const packageEntries = [
  ["@johnshandux/ledger-design-system", "Server-safe controls, Table and formatCurrencyAmount"],
  ["@johnshandux/ledger-design-system/styles.css", "Tokens, global conventions and component styles"],
  ["@johnshandux/ledger-design-system/icons", "Ledger status icons"],
  ["@johnshandux/ledger-design-system/dialog", "Dialog family"],
  ["@johnshandux/ledger-design-system/tooltip", "Tooltip"],
  ["@johnshandux/ledger-design-system/popover", "Popover family"],
  ["@johnshandux/ledger-design-system/dropdown-menu", "DropdownMenu family"],
  ["@johnshandux/ledger-design-system/alert-dialog", "AlertDialog family"],
  ["@johnshandux/ledger-design-system/sheet", "Sheet family"],
  ["@johnshandux/ledger-design-system/appearance-toggle", "Appearance toggle"],
] as const;

export const agentRules = [
  ["Reuse before creating", "Inspect Ledger tokens, components and contracts before adding a local substitute."],
  ["Preserve the boundary", "Keep reusable UI in the design system and product journeys in Ledger Bank."],
  ["Protect semantics", "Maintain accessible names, keyboard behaviour, focus management and native HTML where sufficient."],
  ["Keep financial meaning explicit", "Never infer currency, transaction direction, conversion, aggregation or missing-value semantics."],
  ["Respect package entries", "Do not pull client-only interaction runtime into the server-safe root entry."],
  ["Describe reality", "Distinguish implemented APIs, visual conventions, emerging patterns and planned capabilities."],
] as const;
