import { Beneficiary } from "../domain/Beneficiary";

export const beneficiaries: Beneficiary[] = [
  {
    id: "ben-1",
    businessId: "b-northstar",
    name: "Alpha Supplies Ltd",
    accountNumber: "44445555",
    sortCode: "11-22-33",
    reference: "INV-1001",
  },
  {
    id: "ben-2",
    businessId: "b-morgan",
    name: "Gamma Cleaning Co",
    accountNumber: "55556666",
    sortCode: "22-33-44",
    reference: "SERV-200",
  },
];

export default beneficiaries;
