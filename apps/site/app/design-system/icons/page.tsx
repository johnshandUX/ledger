import { DocsLayout } from "../../_components/DocsLayout";
import { IconReference } from "./IconReference";

export default function IconsPage() {
  return <DocsLayout eyebrow="Implemented · 36 approved icons" title="Icons" intro="Ledger uses a curated icon set based on Lucide. Icons are selected and named according to their meaning within financial interfaces rather than exposing the underlying library directly.">
    <IconReference />
  </DocsLayout>;
}
