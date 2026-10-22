import { describe, expect, it } from "vitest";
import { BANK_BUSINESS_ID, bankFinanceEnvironment } from "./environment";
import {
  BANK_ORGANISATIONS,
  getBankOrganisationAccess,
  getBankOrganisationsForUser,
  MORGAN_BUSINESS_ID,
  MORGAN_LEGAL_ENTITY_ID,
} from "./organisations";
import { BANK_DEMO_USER_ID } from "./users";

describe("Ledger Bank organisations", () => {
  it("makes Caldermere the first and default organisation profile", () => {
    expect(BANK_ORGANISATIONS[0].business).toMatchObject({
      id: BANK_BUSINESS_ID,
      name: "Caldermere Ltd",
    });
  });

  it("gives Amelia distinct memberships in two organisations", () => {
    const organisations = getBankOrganisationsForUser(BANK_DEMO_USER_ID);

    expect(organisations.map(({ business }) => business.id)).toEqual([
      BANK_BUSINESS_ID,
      MORGAN_BUSINESS_ID,
    ]);
    expect(organisations.map(({ membership }) => membership.role.name)).toEqual([
      "Administrator",
      "Viewer",
    ]);
    expect(new Set(organisations.map(({ business }) => business.id)).size).toBe(2);
  });

  it("models Morgan as a distinct identity without changing finance ownership", () => {
    const morgan = getBankOrganisationAccess(
      MORGAN_BUSINESS_ID,
      BANK_DEMO_USER_ID,
    );

    expect(morgan?.business).toEqual({
      id: MORGAN_BUSINESS_ID,
      name: "Morgan Property Holdings",
      legalEntityIds: [MORGAN_LEGAL_ENTITY_ID],
    });
    expect(morgan?.legalEntities[0]).toMatchObject({
      id: MORGAN_LEGAL_ENTITY_ID,
      businessId: MORGAN_BUSINESS_ID,
    });
    expect(morgan?.financialDataSourceBusinessId).toBe(BANK_BUSINESS_ID);
    expect(bankFinanceEnvironment.businesses).toHaveLength(1);
    expect(bankFinanceEnvironment.accounts.every(
      ({ businessId }) => businessId === BANK_BUSINESS_ID,
    )).toBe(true);
  });
});
