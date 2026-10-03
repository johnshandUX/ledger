"use client";

import { Icon, iconCatalog, iconCategories } from "@johnshandux/ledger-design-system/icons";

export function IconReference() {
  return <>
    <section className="docs-section"><div className="doc-section-heading"><div><p className="eyebrow">Supported catalogue</p><h2>Semantic names, stable product meaning</h2></div><p>Use the Ledger name shown here. The underlying artwork can change without requiring a product-code migration.</p></div><div className="icon-catalogue">{iconCategories.map((category) => <section key={category} className="icon-category"><h3>{category}</h3><div className="icon-grid">{iconCatalog.filter((icon) => icon.category === category).map((icon) => <article key={icon.name} className="icon-card"><Icon name={icon.name} size="large" /><code>{icon.name}</code></article>)}</div></section>)}</div></section>
    <section className="docs-section"><div className="doc-section-heading"><div><p className="eyebrow">Usage</p><h2>One governed entry point</h2></div><p>Icons inherit the surrounding text colour and use the supported small, medium or large sizes.</p></div><pre><code>{`import { Icon } from
  "@johnshandux/ledger-design-system/icons";

// Decorative beside visible text
<Icon name="download" />

// Meaningful when it stands alone
<Icon name="warning" aria-label="Payment requires review" />`}</code></pre><div className="icon-usage-examples"><div><span><Icon name="search" size="small" /> Small</span><span><Icon name="search" /> Medium</span><span><Icon name="search" size="large" /> Large</span></div><div className="icon-colour-example"><Icon name="information" size="large" /> Colour inherited from context</div></div></section>
    <section className="docs-section"><div className="doc-section-heading"><div><p className="eyebrow">Governance</p><h2>Lucide supplies artwork. Ledger owns the contract.</h2></div><p>Applications consume the Ledger API rather than importing Lucide directly.</p></div><div className="ownership-grid"><article><h3>Ledger owns</h3><ul><li>Semantic naming and supported catalogue</li><li>Sizing and usage guidance</li><li>Accessibility behaviour and product meaning</li><li>Future custom icon replacements</li></ul></article><article><h3>Using icons</h3><ul><li>Decorative icons are hidden from assistive technology.</li><li>Meaningful standalone icons require an accessible label.</li><li>Important information must not rely on an icon or colour alone.</li><li>Controls remain responsible for their own accessible name.</li></ul></article></div><p className="icon-attribution">Artwork is currently provided by <a className="ledger-link" href="https://lucide.dev" target="_blank" rel="noreferrer">Lucide<span className="sr-only"> (opens in a new tab)</span></a>, used under its open-source licence. The Ledger catalogue remains the supported implementation source.</p></section>
  </>;
}
