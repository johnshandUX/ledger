import { Card, CardBody } from "@johnshandux/ledger-design-system";
import type { BankNavigationRoute } from "./ProductShell";
import { ProductShell } from "./ProductShell";
import "./workspace-placeholder.css";

type WorkspacePlaceholderPageProps = Readonly<{
  route: BankNavigationRoute;
  title: string;
  description: string;
}>;

export function WorkspacePlaceholderPage({ route, title, description }: WorkspacePlaceholderPageProps) {
  return (
    <ProductShell activeRoute={route}>
      <div className="workspace-placeholder-page">
        <Card className="workspace-placeholder-card">
          <CardBody>
            <h1>{title}</h1>
            <p className="workspace-placeholder-description">{description}</p>
            <p className="workspace-placeholder-status">Functionality for this workspace has not yet been developed.</p>
          </CardBody>
        </Card>
      </div>
    </ProductShell>
  );
}
