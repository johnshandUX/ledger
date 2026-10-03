import Link from "next/link";
import { AccountPreview } from "./_components/AccountPreview";
import { ledgerBankDemoUrl } from "../lib/deployments";

const workflow = [
  { number: "01", title: "Describe it", copy: "Start with a commercial banking product idea and the customer outcome it needs to support." },
  { number: "02", title: "Shape it", copy: "Use curated examples to turn that intent into a structured interface starting point." },
  { number: "03", title: "Understand it", copy: "Trace the foundations, components and financial guidance behind the result." },
  { number: "04", title: "Build with it", copy: "Reuse the coded system in Ledger projects today, with wider distribution planned." },
] as const;

function DesignSystemPreview() {
  return (
    <div className="system-preview" aria-label="Ledger design system documentation preview">
      <div className="system-preview__nav">
        <strong>Design system</strong>
        <span>Foundations</span><span>Components</span><span>Financial patterns</span><span>AI guidance</span><span>Installation</span>
      </div>
      <div className="system-preview__component">
        <p className="eyebrow">Product composition</p><h3>Account overview</h3><p>A currency-aware summary assembled from current Ledger foundations and components.</p>
        <div className="balance-component"><span>Operating account · GBP</span><strong>£1,480,230.10</strong><small>Example data</small></div>
      </div>
      <div className="system-preview__code"><span>Preview&nbsp;&nbsp; Code&nbsp;&nbsp; Guidance</span><pre><code>{`<Table ariaLabel="Account balances">\n  <TableHead>…</TableHead>\n  <TableBody>\n    <TableRow>…</TableRow>\n  </TableBody>\n</Table>`}</code></pre></div>
    </div>
  );
}

export default function Home() {
  return (
    <main id="main-content">
      <section className="hero hero--product page-shell">
        <div className="hero__content"><p className="eyebrow">The agentic design system for commercial banking</p><h1>Build commercial banking products with an agentic design system.</h1><p className="hero__copy">LedgerOS combines coded components, financial patterns and practical guidance so designers and developers can move from an idea to a credible banking interface.</p><div className="actions"><Link className="button-link" href="/playground">Explore Playground <span aria-hidden="true">→</span></Link><Link className="button-link button-link--secondary" href="/design-system">Explore the system</Link></div></div>
        <div className="hero__preview"><div className="hero-prompt"><span className="example-label">Playground · Example mode</span><p>Create an account overview for a commercial banking customer with six accounts across GBP, EUR and USD.</p><ul><li>Interpreting the request</li><li>Selecting Ledger components</li><li>Applying financial guidance</li></ul><Link className="text-link" href="/playground">Open this example <span aria-hidden="true">→</span></Link></div><AccountPreview compact /></div>
      </section>

      <section className="workflow-section page-shell" aria-labelledby="workflow-heading"><div className="section-heading"><div><p className="eyebrow">From intent to interface</p><h2 id="workflow-heading">A clearer path through the system.</h2></div><p>The Playground uses curated prompts and predefined previews today. Live, grounded generation remains planned.</p></div><div className="workflow-grid">{workflow.map((step) => <article key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.copy}</p></article>)}</div></section>

      <section className="design-system-showcase page-shell"><div className="showcase-copy"><p className="eyebrow">A coded system for financial product creation</p><h2>The Ledger Design System</h2><p>Authoritative foundations and reusable components are implemented today. Financial patterns and machine-readable AI guidance will grow through real product examples.</p><div className="actions"><Link className="button-link" href="/design-system">Explore the design system <span aria-hidden="true">→</span></Link><Link className="text-link" href="/design-system/installation">Installation status</Link></div></div><DesignSystemPreview /></section>

      <section className="showcase page-shell"><div><p className="eyebrow">Reference implementation</p><h2>Meet Ledger Bank.</h2><p>A separate, full-screen commercial banking prototype demonstrates a sterling account overview, balance summaries, account details and responsive transaction history using real Ledger components.</p><div className="actions"><a className="button-link" href={ledgerBankDemoUrl} target="_blank" rel="noreferrer">Open Ledger Bank <span className="sr-only">(opens in a new tab)</span></a><Link className="text-link" href="/ledger-bank">About the reference app</Link></div></div><AccountPreview source="bank" /></section>

      <section className="journal-callout page-shell"><p className="eyebrow">Journal</p><h2>Notes from building LedgerOS in the open.</h2><p>The Journal will document decisions, experiments and lessons from connecting design systems with agentic product work. No articles have been published yet.</p><Link className="text-link" href="/journal">Visit the Journal <span aria-hidden="true">→</span></Link></section>

      <section className="closing-cta page-shell"><p className="eyebrow">Start with an example</p><h2>Turn an idea into a financial product direction.</h2><p>Explore a curated Playground example, then trace it back to the foundations and components that make it coherent.</p><div className="actions"><Link className="button-link button-link--light" href="/playground">Explore Playground <span aria-hidden="true">→</span></Link><Link className="button-link button-link--outline-light" href="/design-system">Browse the system</Link></div></section>
    </main>
  );
}
