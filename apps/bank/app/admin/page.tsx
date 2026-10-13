import { BANK_BUSINESS_NAME } from "../../src/finance/environment";
import { ProductShell } from "../ProductShell";
import { AdminAreaNavigation } from "./AdminAreaNavigation";
import { AdminOverview } from "./AdminOverview";
import "./admin.css";

export default function AdminPage() {
  return <ProductShell activeRoute="admin">
    <div className="admin-page">
      <header className="admin-page-header">
        <h1 id="admin-page-title">Administration</h1>
        <p>Manage your organisation and banking services for {BANK_BUSINESS_NAME}.</p>
      </header>
      <AdminAreaNavigation />
      <AdminOverview />
    </div>
  </ProductShell>;
}
