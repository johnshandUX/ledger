"use client";

import { Icon, type IconName } from "@johnshandux/ledger-design-system/icons";
import Link from "next/link";

export type AdministrationArea = Readonly<{
  title: string;
  description: string;
  destinations: readonly string[];
  href: string;
  icon: IconName;
}>;

export const administrationAreas = [
  { title: "People & access", description: "Manage the people who can use Ledger Bank and how their access is organised.", destinations: ["Users", "Roles"], href: "/admin/people-access", icon: "user" },
  { title: "Business details", description: "Review your organisation profile, addresses and contact information.", destinations: ["Business profile", "Addresses", "Contact information"], href: "/admin/business-details", icon: "business" },
  { title: "Billing", description: "Review service charges, billing history and the contacts responsible for billing.", destinations: ["Service charges", "Billing history", "Billing contacts"], href: "/admin/billing", icon: "document" },
  { title: "Account administration", description: "Manage account settings, access arrangements, mandates and service requests.", destinations: ["Account settings", "Access and mandates", "Service requests"], href: "/admin/account-administration", icon: "card" },
  { title: "Security & controls", description: "Review payment limits, security policies and authentication settings.", destinations: ["Payment limits", "Security policies", "Authentication settings"], href: "/admin/security-controls", icon: "settings" },
  { title: "Audit & activity", description: "Review administrative changes and activity, and prepare audit exports.", destinations: ["Administrative changes", "Activity history", "Audit exports"], href: "/admin/audit-activity", icon: "visibility" },
  { title: "Integrations", description: "Manage connected applications, API access and tools for developers.", destinations: ["Connected applications", "API access", "Developer tools"], href: "/integrations", icon: "transfer" },
] as const satisfies readonly AdministrationArea[];

export function AdminAreaNavigation() {
  return (
    <nav aria-label="Administration areas">
      <ul className="admin-area-grid">
        {administrationAreas.map((area) => <li key={area.href}>
          <Link className="admin-area-card" href={area.href}>
            <span className="admin-area-icon" aria-hidden="true"><Icon name={area.icon} size="large" /></span>
            <span className="admin-area-content">
              <span className="admin-area-heading"><span className="admin-area-title">{area.title}</span><Icon name="chevron-right" size="small" aria-hidden="true" /></span>
              <span className="admin-area-description">{area.description}</span>
              <span className="admin-area-destinations">{area.destinations.join(" · ")}</span>
            </span>
          </Link>
        </li>)}
      </ul>
    </nav>
  );
}
