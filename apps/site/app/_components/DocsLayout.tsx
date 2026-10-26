import Link from "next/link";
import type { ReactNode } from "react";
import { designSystemNav } from "@/content/site-content";

export function DocsLayout({ eyebrow, title, intro, actions, children }: { eyebrow?: string; title: string; intro: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <main id="main-content" className="docs-shell page-shell">
      <aside className="docs-sidebar">
        <p className="eyebrow">Design system</p>
        <nav aria-label="Design system documentation"><ul>{designSystemNav.map((item) => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}</ul></nav>
      </aside>
      <article className={`docs-content${actions ? " docs-content--with-actions" : ""}`}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p className="page-intro">{intro}</p>
        {actions && <div className="actions docs-intro-actions">{actions}</div>}
        {children}
      </article>
    </main>
  );
}
