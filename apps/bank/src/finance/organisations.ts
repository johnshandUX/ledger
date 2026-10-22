import type {
  Business,
  BusinessId,
  LegalEntity,
  Role,
  UserId,
} from "@johnshandux/ledger-synthetic-finance";
import { BANK_BUSINESS_ID, bankFinanceEnvironment } from "./environment";
import { BANK_DEMO_USER_ID } from "./users";

export const MORGAN_BUSINESS_ID = "business-morgan-property-holdings";
export const MORGAN_LEGAL_ENTITY_ID =
  "legal-entity-morgan-property-holdings-ltd";
export const MORGAN_VIEWER_ROLE_ID = "role-morgan-viewer";

export type BankOrganisationMembership = Readonly<{
  userId: UserId;
  role: Role;
}>;

/**
 * A Bank organisation profile is deliberately separate from the finance
 * dataset. V1 shares Caldermere's immutable demonstration records between
 * profiles; `financialDataSourceBusinessId` makes that prototype constraint
 * explicit without changing account or legal-entity ownership.
 */
export type BankOrganisationAccess = Readonly<{
  business: Business;
  legalEntities: readonly LegalEntity[];
  membership: BankOrganisationMembership;
  financialDataSourceBusinessId: BusinessId;
}>;

const caldermereBusiness = bankFinanceEnvironment.businesses.find(
  ({ id }) => id === BANK_BUSINESS_ID,
);
const caldermereAdministratorRole = bankFinanceEnvironment.roles.find(
  ({ id }) => id === "role-administrator",
);

if (!caldermereBusiness || !caldermereAdministratorRole) {
  throw new Error("The Caldermere organisation profile is incomplete.");
}

const morganBusiness: Business = {
  id: MORGAN_BUSINESS_ID,
  name: "Morgan Property Holdings",
  legalEntityIds: [MORGAN_LEGAL_ENTITY_ID],
};

const morganLegalEntity: LegalEntity = {
  id: MORGAN_LEGAL_ENTITY_ID,
  businessId: MORGAN_BUSINESS_ID,
  name: "Morgan Property Holdings",
};

const morganViewerRole: Role = {
  id: MORGAN_VIEWER_ROLE_ID,
  businessId: MORGAN_BUSINESS_ID,
  name: "Viewer",
  description: "Views financial information.",
  permissionIds: [
    "permission-accounts-view",
    "permission-transactions-view",
    "permission-beneficiaries-view",
  ],
};

export const BANK_ORGANISATIONS = [
  {
    business: caldermereBusiness,
    legalEntities: bankFinanceEnvironment.legalEntities.filter(
      ({ businessId }) => businessId === BANK_BUSINESS_ID,
    ),
    membership: {
      userId: BANK_DEMO_USER_ID,
      role: caldermereAdministratorRole,
    },
    financialDataSourceBusinessId: BANK_BUSINESS_ID,
  },
  {
    business: morganBusiness,
    legalEntities: [morganLegalEntity],
    membership: {
      userId: BANK_DEMO_USER_ID,
      role: morganViewerRole,
    },
    financialDataSourceBusinessId: BANK_BUSINESS_ID,
  },
] as const satisfies readonly BankOrganisationAccess[];

export function getBankOrganisationsForUser(
  userId: UserId,
): readonly BankOrganisationAccess[] {
  return BANK_ORGANISATIONS.filter(
    ({ membership }) => membership.userId === userId,
  );
}

export function getBankOrganisationAccess(
  organisationId: BusinessId,
  userId: UserId,
): BankOrganisationAccess | undefined {
  return getBankOrganisationsForUser(userId).find(
    ({ business }) => business.id === organisationId,
  );
}
