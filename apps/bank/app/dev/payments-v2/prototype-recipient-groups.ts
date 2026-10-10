import type { PrototypeRecipientGroup } from "./prototype-model";

/**
 * Illustrative Bank-local memberships for the Payments V2 prototype.
 * These are not canonical Caldermere or Synthetic Finance records.
 */
export const prototypeRecipientGroups: readonly PrototypeRecipientGroup[] = [
  {
    id: "group-suppliers",
    name: "Suppliers",
    recipientIds: [
      "beneficiary-apex-steel",
      "beneficiary-boreal-alloys",
      "beneficiary-cedar-packaging",
      "beneficiary-driftway-logistics",
      "beneficiary-forge-equipment",
      "beneficiary-ironwood-components",
    ],
  },
  {
    id: "group-operations",
    name: "Operations",
    recipientIds: [
      "beneficiary-ember-energy",
      "beneficiary-greenline-facilities",
      "beneficiary-kestrel-workwear",
      "beneficiary-lumen-telecom",
    ],
  },
  {
    id: "group-statutory-payroll",
    name: "Statutory & payroll",
    recipientIds: [
      "beneficiary-hmrc",
      "beneficiary-caldermere-payroll",
    ],
  },
];
