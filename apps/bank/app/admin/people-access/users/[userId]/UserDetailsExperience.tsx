"use client";

import Link from "next/link";
import { additionalAccessCatalogue } from "@johnshandux/ledger-synthetic-finance";
import { Badge, Card, CardBody, CardHeader } from "@johnshandux/ledger-design-system";
import { BANK_BUSINESS_NAME, bankFinanceEnvironment } from "../../../../../src/finance/environment";
import { createBankUserPresentation } from "../../../../../src/presentation/users";
import { useEffectiveUserById } from "../../../../useBankEffectiveState";
import { PeopleAccessNavigation } from "../../PeopleAccessNavigation";

const peopleAccessRoute = "/admin/people-access";

function Breadcrumb({ current }: { current: string }) {
  return (
    <nav className="people-access-breadcrumb" aria-label="Breadcrumb">
      <ol>
        <li><Link className="ledger-link" href={peopleAccessRoute}>People &amp; access</Link></li>
        <li aria-current="page">{current}</li>
      </ol>
    </nav>
  );
}

export function UserDetailsExperience({ userId }: { userId: string }) {
  const user = useEffectiveUserById(userId);

  if (!user) {
    return (
      <div className="people-access-page people-access-user-detail">
        <title>User unavailable · Ledger Bank</title>
        <PeopleAccessNavigation active="users" />
        <Breadcrumb current="User unavailable" />
        <section className="people-access-unavailable" aria-labelledby="user-unavailable-heading">
          <h1 id="user-unavailable-heading">User unavailable</h1>
          <p>This user could not be found.</p>
          <Link className="ledger-link" href={peopleAccessRoute}>Back to People &amp; access</Link>
        </section>
      </div>
    );
  }

  const presentation = createBankUserPresentation(
    user,
    bankFinanceEnvironment.roles,
    additionalAccessCatalogue,
  );

  return (
    <div className="people-access-page people-access-user-detail">
      <title>{`${presentation.fullName} · Ledger Bank`}</title>
      <PeopleAccessNavigation active="users" />
      <Breadcrumb current={presentation.fullName} />

      <header className="people-access-user-detail-header">
        <div>
          <h1>{presentation.fullName}</h1>
          <p>{presentation.email}</p>
        </div>
        <Badge variant={presentation.status === "active" ? "success" : "warning"}>
          {presentation.statusLabel}
        </Badge>
      </header>

      <div className="people-access-user-detail-sections">
        <section aria-labelledby="identity-heading">
          <Card>
            <CardHeader><h2 id="identity-heading">Identity</h2></CardHeader>
            <CardBody>
              <dl className="people-access-identity-fields">
                <div><dt>Full name</dt><dd>{presentation.fullName}</dd></div>
                <div><dt>Email address</dt><dd>{presentation.email}</dd></div>
                <div><dt>Job title</dt><dd>{presentation.jobTitleLabel}</dd></div>
                <div><dt>Business</dt><dd>{BANK_BUSINESS_NAME}</dd></div>
                <div><dt>Status</dt><dd>{presentation.statusLabel}</dd></div>
              </dl>
            </CardBody>
          </Card>
        </section>

        <section aria-labelledby="banking-role-heading">
          <Card>
            <CardHeader><h2 id="banking-role-heading">Banking role</h2></CardHeader>
            <CardBody>
              {presentation.bankingRole ? (
                <div className="people-access-assignment">
                  <strong>{presentation.bankingRole.name}</strong>
                  <p>{presentation.bankingRole.description}</p>
                </div>
              ) : <p className="people-access-empty-value">Unassigned</p>}
            </CardBody>
          </Card>
        </section>

        <section aria-labelledby="additional-access-heading">
          <Card>
            <CardHeader><h2 id="additional-access-heading">Additional access</h2></CardHeader>
            <CardBody>
              {presentation.additionalAccess.length > 0 ? (
                <ul className="people-access-assignments">
                  {presentation.additionalAccess.map((access) => (
                    <li key={access.id}>
                      <strong>{access.name}</strong>
                      <p>{access.description}</p>
                    </li>
                  ))}
                </ul>
              ) : <p className="people-access-empty-value">No additional access</p>}
            </CardBody>
          </Card>
        </section>
      </div>
    </div>
  );
}
