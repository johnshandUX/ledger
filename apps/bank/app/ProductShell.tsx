import Link from "next/link";
import type { ReactNode } from "react";
import { getBankDemoUser, getBankRolesForUser } from "../src/finance/users";
import { ThemeControl } from "./ThemeControl";

type ProductShellProps = {
  activeRoute: "accounts" | "payments" | "reporting";
  children: ReactNode;
};

const primaryRoutes = [
  { id: "accounts", label: "Accounts", href: "/" },
  { id: "payments", label: "Payments", href: "/payments" },
  { id: "reporting", label: "Reporting" },
] as const;

export function ProductShell({ activeRoute, children }: ProductShellProps) {
  const activeUser = getBankDemoUser();
  const activeRole = getBankRolesForUser(activeUser.id)[0];

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

        <ThemeControl />

        <div className="profile">
          <span>{activeUser.firstName} {activeUser.lastName}</span>
          {activeRole && <small>{activeRole.name}</small>}
        </div>
      </header>

      {children}
    </div>
  );
}
