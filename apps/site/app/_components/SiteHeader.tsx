import Link from "next/link";
import { ThemeControl } from "./ThemeControl";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="wordmark" href="/" aria-label="LedgerOS home">Ledger<span>OS</span></Link>
        <nav aria-label="Primary navigation">
          <ul className="site-nav">
            <li><Link href="/design-system">Design System</Link></li>
            <li><Link href="/playground">Playground</Link></li>
            <li><Link href="/ledger-bank">Ledger Bank</Link></li>
            <li><Link href="/journal">Journal</Link></li>
          </ul>
        </nav>
        <ThemeControl />
        <Link className="button-link button-link--small" href="/playground">Explore Playground</Link>
      </div>
    </header>
  );
}
