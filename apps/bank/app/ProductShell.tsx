import {
  AppShell,
  AppWorkspace,
  WorkspaceHeader,
} from "@johnshandux/ledger-design-system/application-navigation";
import type { ReactNode } from "react";
import { getBankDemoUser } from "../src/finance/users";
import { BankNavigation } from "./BankNavigation";
import {
  bankWorkspaceTitles,
  type BankNavigationRoute,
} from "./bank-navigation";
import "./ProductShell.css";

export type { BankNavigationRoute } from "./bank-navigation";
export { bankNavigation } from "./bank-navigation";

type ProductShellProps = {
  activeRoute: BankNavigationRoute;
  children: ReactNode;
};

export function ProductShell({ activeRoute, children }: ProductShellProps) {
  const activeUser = getBankDemoUser();
  const displayName = `${activeUser.firstName} ${activeUser.lastName}`;

  const navigation = (
    <BankNavigation activeRoute={activeRoute} displayName={displayName} />
  );

  return (
    <AppShell className="product-shell" navigation={navigation}>
      <WorkspaceHeader className="bank-workspace-header">
        <span className="bank-workspace-title">
          {bankWorkspaceTitles[activeRoute]}
        </span>
      </WorkspaceHeader>
      <AppWorkspace className="bank-workspace">{children}</AppWorkspace>
    </AppShell>
  );
}
