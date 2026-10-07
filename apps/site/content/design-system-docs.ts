import { availableComponentManifest, componentManifest } from "@johnshandux/ledger-design-system/docs";

export const componentCatalog = availableComponentManifest;
export const componentRoadmap = componentManifest.filter((component) => component.lifecycle === "Planned");

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

export const packageEntries = [
  ["@johnshandux/ledger-design-system", "Server-safe controls, Table and formatCurrencyAmount"],
  ["@johnshandux/ledger-design-system/data-table", "Interactive DataTable and typed row-model utilities"],
  ["@johnshandux/ledger-design-system/styles.css", "Tokens, global conventions and component styles"],
  ["@johnshandux/ledger-design-system/icons", "Governed semantic Icon API and catalogue"],
  ["@johnshandux/ledger-design-system/dialog", "Dialog family"],
  ["@johnshandux/ledger-design-system/tooltip", "Tooltip"],
  ["@johnshandux/ledger-design-system/popover", "Popover family"],
  ["@johnshandux/ledger-design-system/dropdown-menu", "DropdownMenu family"],
  ["@johnshandux/ledger-design-system/alert-dialog", "AlertDialog family"],
  ["@johnshandux/ledger-design-system/sheet", "Sheet family"],
  ["@johnshandux/ledger-design-system/appearance-toggle", "Appearance toggle"],
  ["@johnshandux/ledger-design-system/docs", "Framework-neutral component documentation manifest"],
  ["@johnshandux/ledger-design-system/examples", "Client-aware reusable public-API component examples"],
  ["@johnshandux/ledger-design-system/progress", "Accessible determinate and indeterminate Progress"],
  ["@johnshandux/ledger-design-system/avatar", "Load-aware Avatar image and fallback"],
] as const;

export const agentRules = [
  ["Reuse before creating", "Inspect Ledger tokens, components and contracts before adding a local substitute."],
  ["Preserve the boundary", "Keep reusable UI in the design system and product journeys in Ledger Bank."],
  ["Protect semantics", "Maintain accessible names, keyboard behaviour, focus management and native HTML where sufficient."],
  ["Keep financial meaning explicit", "Never infer currency, transaction direction, conversion, aggregation or missing-value semantics."],
  ["Respect package entries", "Do not pull client-only interaction runtime into the server-safe root entry."],
  ["Describe reality", "Distinguish implemented APIs, visual conventions, emerging patterns and planned capabilities."],
] as const;
