import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div><span className="wordmark">Ledger<span>OS</span></span><p>Website, documentation and playground for the Ledger Design System and Ledger Bank.</p></div>
      <nav aria-label="Footer navigation"><Link href="/design-system">Design System</Link><Link href="/playground">Playground</Link><Link href="/ledger-bank">Ledger Bank</Link><Link href="/journal">Journal</Link></nav>
      <p>Prototype project. Not production banking software.</p>
    </footer>
  );
}
