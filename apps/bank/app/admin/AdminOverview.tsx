"use client";

import { Badge, Card, CardBody, CardHeader } from "@johnshandux/ledger-design-system";
import { Icon } from "@johnshandux/ledger-design-system/icons";
import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { createAdminUserSummary } from "../../src/presentation/adminOverview";
import { useEffectiveUsers } from "../useBankEffectiveState";
import { administrationDestinations } from "./AdminAreaNavigation";

function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className="ledger-link admin-arrow-link" href={href}>
      {children}
      <Icon name="chevron-right" size="small" aria-hidden="true" />
    </Link>
  );
}

function UnavailableStatus({ children }: { children: ReactNode }) {
  return (
    <div className="admin-unavailable">
      <Badge variant="neutral">Not available</Badge>
      <p>{children}</p>
    </div>
  );
}

export function AdminOverview() {
  const effectiveUsers = useEffectiveUsers();
  const userSummary = useMemo(
    () => createAdminUserSummary(effectiveUsers),
    [effectiveUsers],
  );

  return (
    <div className="admin-overview">
      <section className="admin-summary" aria-label="Administration summary">
        <Card className="admin-summary-card">
          <CardBody>
            <h2>Total users</h2>
            <p className="admin-summary-value">{userSummary.totalUsers} users</p>
            <p className="admin-summary-detail">{userSummary.activeUsers} active</p>
            <ArrowLink href={administrationDestinations.peopleAccess.href}>View users</ArrowLink>
          </CardBody>
        </Card>

        <Card className="admin-summary-card">
          <CardBody>
            <h2>Access requests</h2>
            <UnavailableStatus>Access requests are not yet available in Ledger Bank.</UnavailableStatus>
          </CardBody>
        </Card>

        <Card className="admin-summary-card">
          <CardBody>
            <h2>Mobile app users</h2>
            <UnavailableStatus>Mobile registration data is not currently available.</UnavailableStatus>
          </CardBody>
        </Card>
      </section>

      <section className="admin-attention" aria-labelledby="admin-attention-heading">
        <div className="admin-section-heading">
          <div>
            <h2 id="admin-attention-heading">Needs your attention</h2>
            <p>Administrative requests and approvals will appear here when available.</p>
          </div>
          <Badge variant="neutral">No supported items</Badge>
        </div>
      </section>

      <div className="admin-detail-grid">
        <section aria-labelledby="admin-activity-heading">
          <Card className="admin-detail-card">
            <CardHeader><h2 id="admin-activity-heading">Recent activity</h2></CardHeader>
            <CardBody>
              <UnavailableStatus>Administrative activity is not yet recorded in Ledger Bank.</UnavailableStatus>
              <ArrowLink href={administrationDestinations.audit.href}>View audit</ArrowLink>
            </CardBody>
          </Card>
        </section>

        <section aria-labelledby="admin-billing-heading">
          <Card className="admin-detail-card">
            <CardHeader><h2 id="admin-billing-heading">Billing</h2></CardHeader>
            <CardBody>
              <UnavailableStatus>Service billing dates are not currently available.</UnavailableStatus>
              <ArrowLink href={administrationDestinations.billing.href}>Manage billing</ArrowLink>
            </CardBody>
          </Card>
        </section>
      </div>

      <section className="admin-quick-access" aria-labelledby="admin-quick-access-heading">
        <h2 id="admin-quick-access-heading">Quick access</h2>
        <nav aria-label="Administration quick access">
          <ul>
            <li><ArrowLink href={administrationDestinations.settings.href}>Business details</ArrowLink></li>
            <li><ArrowLink href={administrationDestinations.accountAdministration.href}>Account administration</ArrowLink></li>
            <li><ArrowLink href={administrationDestinations.securityControls.href}>Security &amp; controls</ArrowLink></li>
            <li><ArrowLink href={administrationDestinations.integrations.href}>Integrations</ArrowLink></li>
          </ul>
        </nav>
      </section>
    </div>
  );
}
