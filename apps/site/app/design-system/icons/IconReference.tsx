"use client";

import { Icon, iconCatalog, iconCategories } from "@johnshandux/ledger-design-system/icons";

const semanticStatuses = [
  { label: "Information", name: "information", token: "--ledger-color-icon-status-info", light: "blue-600", dark: "blue-600", className: "status-icon--info", usage: "Informational feedback" },
  { label: "Success", name: "success", token: "--ledger-color-icon-status-success", light: "green-600", dark: "green-600", className: "status-icon--success", usage: "Confirmed outcomes" },
  { label: "Warning", name: "warning", token: "--ledger-color-icon-status-warning", light: "amber-600", dark: "amber-600", className: "status-icon--warning", usage: "States requiring attention" },
  { label: "Error", name: "error", token: "--ledger-color-icon-status-error", light: "red-600", dark: "red-600", className: "status-icon--error", usage: "Errors and failed validation" },
] as const;

const semanticStatusClasses = Object.fromEntries(
  semanticStatuses.map(({ name, className }) => [name, className]),
) as Partial<Record<(typeof iconCatalog)[number]["name"], string>>;

export function IconReference() {
  return <>
    <section className="docs-section"><div className="doc-section-heading"><div><p className="eyebrow">Supported catalogue</p><h2>Semantic names, stable product meaning</h2></div><p>Use the Ledger name shown here. The underlying artwork can change without requiring a product-code migration.</p></div><div className="icon-catalogue">{iconCategories.map((category) => <section key={category} className="icon-category"><h3>{category}</h3><div className="icon-grid">{iconCatalog.filter((icon) => icon.category === category).map((icon) => <article key={icon.name} className="icon-card"><Icon className={semanticStatusClasses[icon.name]} name={icon.name} size="large" /><code>{icon.name}</code></article>)}</div></section>)}</div></section>
    <section className="docs-section"><div className="doc-section-heading"><div><p className="eyebrow">Usage</p><h2>One governed entry point</h2></div><p>Icons inherit the surrounding text colour and use the supported small, medium or large sizes.</p></div><pre><code>{`import { Icon } from
  "@johnshandux/ledger-design-system/icons";

// Decorative beside visible text
<Icon name="download" />

// Meaningful when it stands alone
<Icon name="warning" aria-label="Payment requires review" />`}</code></pre><div className="icon-usage-examples"><div><span><Icon name="search" size="small" /> Small</span><span><Icon name="search" /> Medium</span><span><Icon name="search" size="large" /> Large</span></div><div className="icon-colour-example"><Icon name="information" size="large" /> Colour inherited from context</div></div></section>
    <section className="docs-section"><div className="doc-section-heading"><div><p className="eyebrow">Semantic status</p><h2>Four meanings, deliberately limited</h2></div><p>Filled information, success, warning and error shapes are reserved for UI that explicitly communicates feedback or state. Their internal glyph remains light in both themes; Error uses an octagonal stop-sign silhouette.</p></div><div className="status-icon-grid">{semanticStatuses.map((status) => <article className="status-icon-card" key={status.name}><Icon className={status.className} name={status.name} size="large" /><div><strong>{status.label}</strong><span>{status.usage}</span><code>{status.token}</code></div></article>)}</div><div className="status-icon-mappings"><div className="status-icon-mappings__row status-icon-mappings__head"><span>Meaning</span><span>Light</span><span>Dark</span></div>{semanticStatuses.map((status) => <div className="status-icon-mappings__row" key={status.name}><strong>{status.label}</strong><code>{status.light}</code><code>{status.dark}</code></div>)}</div><div className="foundation-note"><strong>Context owns status</strong><p>A normal information or warning icon inherits the standard surrounding colour. Parent feedback components apply a status token only when the interface is communicating that semantic state. Use the site appearance control to inspect the theme mapping.</p></div></section>
    <section className="docs-section"><div className="doc-section-heading"><div><p className="eyebrow">Governance</p><h2>Ledger owns the contract and status artwork.</h2></div><p>Lucide supplies the general catalogue; Ledger-owned SVGs provide the four filled semantic status shapes. Applications consume one stable Ledger API.</p></div><div className="ownership-grid"><article><h3>Ledger owns</h3><ul><li>Semantic naming and supported catalogue</li><li>Sizing and usage guidance</li><li>Accessibility behaviour and product meaning</li><li>Filled semantic status artwork</li></ul></article><article><h3>Using icons</h3><ul><li>Decorative icons are hidden from assistive technology.</li><li>Meaningful standalone icons require an accessible label.</li><li>Important information must not rely on an icon or colour alone.</li><li>Controls remain responsible for their own accessible name.</li></ul></article></div><p className="icon-attribution">General catalogue artwork is provided by <a className="ledger-link" href="https://lucide.dev" target="_blank" rel="noreferrer">Lucide<span className="sr-only"> (opens in a new tab)</span></a>, used under its open-source licence. The Ledger catalogue remains the supported implementation source.</p></section>
  </>;
}
