import type { Beneficiary, Counterparty, CurrencyCode } from "../domain/index.js";
import { generatedId, type GenerationContext } from "./types.js";

const customerNames = [
  "Alderbridge Mobility Ltd",
  "Beacon Industrial Products Ltd",
  "Crownfield Engineering Ltd",
  "Daleshore Retail Group Ltd",
  "Eastmere Infrastructure Ltd",
  "Firth & Vale Distribution Ltd",
  "Granite Coast Manufacturing Ltd",
  "Highland Meridian GmbH",
] as const;

const supplierNames = [
  "Atlas Bearings & Drives Ltd",
  "Brightforge Metals Ltd",
  "Clearspan Freight Services Ltd",
  "Delta Process Controls Ltd",
  "Evergreen Industrial Supplies Ltd",
  "Fieldstone Plant Maintenance Ltd",
  "Garnet Safety Systems Ltd",
  "Helix Components Europe Ltd",
] as const;

export interface GeneratedParties {
  counterparties: Counterparty[];
  beneficiaries: Beneficiary[];
}

export function generateCounterpartiesAndBeneficiaries(
  context: GenerationContext,
  businessId: string,
): GeneratedParties {
  const counterparties: Counterparty[] = [
    ...customerNames.map((name, index) => ({
      id: generatedId("counterparty-customer", index + 1),
      businessId,
      name,
      type: "organisation" as const,
      roles: ["customer" as const],
    })),
    ...supplierNames.map((name, index) => ({
      id: generatedId("counterparty-supplier", index + 1),
      businessId,
      name,
      type: "organisation" as const,
      roles: ["supplier" as const],
    })),
  ];

  const currencySequence: CurrencyCode[] = [
    "GBP", "GBP", "GBP", "GBP", "GBP", "GBP", "GBP", "GBP", "GBP", "GBP",
    "USD", "USD", "EUR", "EUR",
  ];
  const beneficiaries = currencySequence.map((currency, index): Beneficiary => {
    const supplierIndex = index % supplierNames.length;
    const detail = 20_000_000 + context.random.integer(0, 9_999_999);
    return {
      id: generatedId("beneficiary", index + 1),
      businessId,
      counterpartyId: generatedId("counterparty-supplier", supplierIndex + 1),
      name: `${supplierNames[supplierIndex]}${index >= supplierNames.length ? " Secondary" : ""}`,
      accountName: supplierNames[supplierIndex],
      accountNumber: String(detail).slice(-8),
      ...(currency === "GBP"
        ? { sortCode: `30-40-${String(index + 1).padStart(2, "0")}` }
        : {}),
      currency,
      defaultReference: "CALDERMERE",
    };
  });

  return { counterparties, beneficiaries };
}
