"use client";

import { Button } from "@johnshandux/ledger-design-system";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@johnshandux/ledger-design-system/dropdown-menu";
import { Icon } from "@johnshandux/ledger-design-system/icons";
import Link from "next/link";

export const administrationDestinations = {
  overview: { label: "Overview", href: "/admin" },
  peopleAccess: { label: "People & access", href: "/admin/people-access" },
  audit: { label: "Audit", href: "/admin/audit-activity" },
  billing: { label: "Billing", href: "/admin/billing" },
  settings: { label: "Settings", href: "/admin/business-details" },
  accountAdministration: { label: "Account administration", href: "/admin/account-administration" },
  securityControls: { label: "Security & controls", href: "/admin/security-controls" },
  integrations: { label: "Integrations", href: "/integrations" },
} as const;

const primaryDestinations = [
  administrationDestinations.overview,
  administrationDestinations.peopleAccess,
  administrationDestinations.audit,
  administrationDestinations.billing,
  administrationDestinations.settings,
] as const;

const moreDestinations = [
  administrationDestinations.accountAdministration,
  administrationDestinations.securityControls,
  administrationDestinations.integrations,
] as const;

export function AdminAreaNavigation() {
  return (
    <nav className="admin-navigation" aria-label="Administration">
      <div className="admin-navigation-links">
        {primaryDestinations.map((destination) => (
          <Link
            key={destination.href}
            href={destination.href}
            aria-current={destination === administrationDestinations.overview ? "page" : undefined}
          >
            {destination.label}
          </Link>
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="admin-navigation-more" variant="secondary" size="small">
              More
              <Icon name="chevron-down" size="small" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {moreDestinations.map((destination) => (
              <DropdownMenuItem key={destination.href} asChild>
                <Link href={destination.href}>{destination.label}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
