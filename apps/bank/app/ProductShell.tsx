import Link from "next/link";
import type { ReactNode } from "react";
import { getActiveBusinessProfile, getActiveUser } from "../src/data/selectors";
import { userFullName } from "../src/domain/User";

type ProductShellProps = {
  activeRoute: "accounts" | "payments" | "reporting";
  children: ReactNode;
};

const primaryRoutes = [
  { id: "accounts", label: "Accounts", href: "/" },
  { id: "payments", label: "Payments" },
  { id: "reporting", label: "Reporting" },
] as const;

export function ProductShell({ activeRoute, children }: ProductShellProps) {
  const activeUser = getActiveUser();
  const activeProfile = getActiveBusinessProfile();

  return (
    <div className="product-shell">
      <header className="shell-header">
        <Link href="/" className="brand">
          Ledger Bank
        </Link>

        <nav className="primary-nav" aria-label="Primary">
          <ul>
            {primaryRoutes.map((route) => (
              <li key={route.id}>
                {"href" in route ? (
                  <Link
                    href={route.href}
                    className={`nav-item${activeRoute === route.id ? " selected" : ""}`}
                    aria-current={activeRoute === route.id ? "page" : undefined}
                  >
                    {route.label}
                  </Link>
                ) : (
                  <span className={`nav-item${activeRoute === route.id ? " selected" : ""}`}>
                    {route.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="profile">
          <span>{activeUser ? userFullName(activeUser) : "Signed-in user"}</span>
          {activeProfile?.jobTitle && <small>{activeProfile.jobTitle}</small>}
        </div>
      </header>

      {children}
    </div>
  );
}
