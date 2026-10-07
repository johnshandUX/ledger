import { availableComponentManifest, getAvailableComponentDefinition } from "@johnshandux/ledger-design-system/docs";
import { AlertExample, AspectRatioExample, AvatarExample, BadgeExample, CardExample, ProgressExample, SeparatorExample, SkeletonExample, SpinnerExample } from "@johnshandux/ledger-design-system/examples";
import { notFound } from "next/navigation";
import { DocsLayout } from "../../../_components/DocsLayout";

const examples = {
  separator: SeparatorExample,
  skeleton: SkeletonExample,
  spinner: SpinnerExample,
  "aspect-ratio": AspectRatioExample,
  badge: BadgeExample,
  alert: AlertExample,
  card: CardExample,
  progress: ProgressExample,
  avatar: AvatarExample,
} as const;

export function generateStaticParams() {
  return availableComponentManifest.map(({ slug }) => ({ slug }));
}

export default async function ComponentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const component = getAvailableComponentDefinition(slug);
  if (!component) notFound();
  const Example = examples[slug as keyof typeof examples];

  return <DocsLayout eyebrow="Component contract" title={component.name} intro={component.purpose}>
    {Example ? <section className="docs-section"><div className="doc-section-heading"><div><p className="eyebrow">Live example</p><h2>Public API specimen</h2></div><p>The same example module is consumed by Storybook.</p></div><div className="demo-surface"><Example /></div></section> : null}
    <section className="docs-section"><div className="doc-section-heading"><div><p className="eyebrow">Contract</p><h2>Implementation status</h2></div></div><dl className="component-detail-list"><div><dt>Lifecycle</dt><dd>{component.lifecycle}</dd></div><div><dt>Publication</dt><dd>{component.publication}</dd></div><div><dt>Classification</dt><dd>{component.classification}</dd></div><div><dt>Package entry</dt><dd><code>{component.entry}</code></dd></div><div><dt>Figma parity</dt><dd>{component.figma}</dd></div><div><dt>Public contract</dt><dd>{component.contract}</dd></div></dl></section>
  </DocsLayout>;
}
