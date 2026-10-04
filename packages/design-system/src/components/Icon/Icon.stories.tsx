import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from "./Icon";
import { iconCatalog, iconCategories } from "./icons";
import type { IconSize } from "./Icon.types";

const sizes: IconSize[] = ["small", "medium", "large"];
const semanticStatuses = [
  { label: "Info", name: "information", token: "--ledger-color-icon-status-info", usage: "Informational feedback and guidance" },
  { label: "Success", name: "success", token: "--ledger-color-icon-status-success", usage: "Completed or confirmed outcomes" },
  { label: "Warning", name: "warning", token: "--ledger-color-icon-status-warning", usage: "Conditions requiring attention" },
  { label: "Error", name: "error", token: "--ledger-color-icon-status-error", usage: "Errors and failed validation" },
] as const;

function SemanticStatusSpecimens() {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--ledger-space-4)" }}>{semanticStatuses.map((status) => <article key={status.name} style={{ display: "grid", gap: "var(--ledger-space-3)", padding: "var(--ledger-space-5)", border: "var(--ledger-border-width-thin) solid var(--ledger-color-border)", borderRadius: "var(--ledger-radius-medium)", background: "var(--ledger-color-surface)" }}><Icon name={status.name} size="large" style={{ color: `var(${status.token})` }} /><div><strong style={{ display: "block" }}>{status.label}</strong><code style={{ display: "block", marginBlock: "var(--ledger-space-2)", color: "var(--ledger-color-text-secondary)", overflowWrap: "anywhere" }}>{status.token}</code><span>{status.usage}</span></div></article>)}</div>;
}

const meta = {
  title: "Components/Icon",
  component: Icon,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: { name: "search", size: "medium" },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {};

export const Sizes: Story = {
  render: () => <div style={{ display: "flex", alignItems: "center", gap: "var(--ledger-space-5)" }}>{sizes.map((size) => <span key={size} style={{ display: "inline-flex", alignItems: "center", gap: "var(--ledger-space-2)" }}><Icon name="search" size={size} /><span>{size}</span></span>)}</div>,
};

export const ColourInheritance: Story = {
  render: () => <div style={{ color: "var(--ledger-color-action)" }}><Icon name="information" size="large" /> Inherits the current text colour</div>,
};

export const Accessibility: Story = {
  render: () => <div style={{ display: "grid", gap: "var(--ledger-space-4)" }}><span><Icon name="calendar" /> Decorative icon beside visible text</span><Icon name="warning" aria-label="Payment requires review" /></div>,
};

export const SemanticStatusLight: Story = {
  globals: { theme: "light" },
  parameters: { docs: { description: { story: "Status colour is reserved for explicit feedback meaning. Ordinary icons continue to inherit currentColor." } } },
  render: () => <SemanticStatusSpecimens />,
};

export const SemanticStatusDark: Story = {
  globals: { theme: "dark" },
  parameters: { docs: { description: { story: "The same semantic tokens map to lighter primitives in Ledger's dark theme." } } },
  render: () => <SemanticStatusSpecimens />,
};

export const Catalogue: Story = {
  render: () => <div style={{ display: "grid", gap: "var(--ledger-space-8)" }}>{iconCategories.map((category) => <section key={category}><h2>{category}</h2><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "var(--ledger-space-3)" }}>{iconCatalog.filter((icon) => icon.category === category).map((icon) => <article key={icon.name} style={{ display: "grid", gap: "var(--ledger-space-3)", minHeight: 112, padding: "var(--ledger-space-4)", border: "var(--ledger-border-width-thin) solid var(--ledger-color-border)", borderRadius: "var(--ledger-radius-medium)" }}><Icon name={icon.name} size="large" /><div><strong style={{ display: "block" }}>{icon.name}</strong><span style={{ color: "var(--ledger-color-text-secondary)", fontSize: "var(--ledger-font-size-small)" }}>{icon.lucideName}</span></div></article>)}</div></section>)}</div>,
};
