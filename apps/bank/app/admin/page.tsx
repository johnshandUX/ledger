import { ProductShell } from "../ProductShell";
import { AdminAreaNavigation } from "./AdminAreaNavigation";
import { AdminOverview } from "./AdminOverview";
import "./admin.css";

export default function AdminPage() {
  return <ProductShell activeRoute="admin">
    <div className="admin-page">
      <header className="admin-page-header">
        <h1 id="admin-page-title">Admin</h1>
      </header>
      <AdminAreaNavigation />
      <AdminOverview />
    </div>
  </ProductShell>;
}
