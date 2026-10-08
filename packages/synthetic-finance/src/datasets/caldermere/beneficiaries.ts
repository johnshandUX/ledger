import type { Beneficiary } from "../../domain/index.js";
import { CALDERMERE_BUSINESS_ID } from "./shared.js";

const businessId = CALDERMERE_BUSINESS_ID;

export const caldermereBeneficiaries = [
  { id: "beneficiary-apex-steel", businessId, counterpartyId: "counterparty-apex-steel", name: "Apex Steelworks", accountName: "Apex Steelworks Ltd", accountNumber: "81000001", sortCode: "20-10-01", currency: "GBP", defaultReference: "CALDERMERE" },
  { id: "beneficiary-boreal-alloys", businessId, counterpartyId: "counterparty-boreal-alloys", name: "Boreal Alloys", accountName: "Boreal Alloys Ltd", accountNumber: "81000002", sortCode: "20-10-02", currency: "GBP" },
  { id: "beneficiary-cedar-packaging", businessId, counterpartyId: "counterparty-cedar-packaging", name: "Cedar Packaging", accountName: "Cedar Packaging Solutions Ltd", accountNumber: "81000003", sortCode: "20-10-03", currency: "GBP" },
  { id: "beneficiary-driftway-logistics", businessId, counterpartyId: "counterparty-driftway-logistics", name: "Driftway Logistics", accountName: "Driftway Logistics Ltd", accountNumber: "81000004", sortCode: "20-10-04", currency: "GBP" },
  { id: "beneficiary-ember-energy", businessId, counterpartyId: "counterparty-ember-energy", name: "Ember Industrial Energy", accountName: "Ember Industrial Energy Ltd", accountNumber: "81000005", sortCode: "20-10-05", currency: "GBP" },
  { id: "beneficiary-forge-equipment", businessId, counterpartyId: "counterparty-forge-equipment", name: "Forge Equipment Systems", accountName: "Forge Equipment Systems Ltd", accountNumber: "81000006", sortCode: "20-10-06", currency: "GBP" },
  { id: "beneficiary-greenline-facilities", businessId, counterpartyId: "counterparty-greenline-facilities", name: "Greenline Facilities", accountName: "Greenline Facilities Services Ltd", accountNumber: "81000007", sortCode: "20-10-07", currency: "GBP" },
  { id: "beneficiary-harbour-consulting", businessId, counterpartyId: "counterparty-harbour-consulting", name: "Harbour Risk & Advisory", accountName: "Harbour Risk & Advisory LLP", accountNumber: "81000008", sortCode: "20-10-08", currency: "GBP" },
  { id: "beneficiary-ironwood-components", businessId, counterpartyId: "counterparty-ironwood-components", name: "Ironwood Components", accountName: "Ironwood Components Ltd", accountNumber: "81000009", sortCode: "20-10-09", currency: "GBP" },
  { id: "beneficiary-junction-tech", businessId, counterpartyId: "counterparty-junction-tech", name: "Junction Manufacturing Technology", accountName: "Junction Manufacturing Technology Ltd", accountNumber: "81000010", sortCode: "20-10-10", currency: "GBP" },
  { id: "beneficiary-kestrel-workwear", businessId, counterpartyId: "counterparty-kestrel-workwear", name: "Kestrel Workwear", accountName: "Kestrel Workwear Ltd", accountNumber: "81000011", sortCode: "20-10-11", currency: "GBP" },
  { id: "beneficiary-lumen-telecom", businessId, counterpartyId: "counterparty-lumen-telecom", name: "Lumen Business Telecoms", accountName: "Lumen Business Telecoms Ltd", accountNumber: "81000012", sortCode: "20-10-12", currency: "GBP" },
  { id: "beneficiary-meridian-tools", businessId, counterpartyId: "counterparty-meridian-tools", name: "Meridian Precision Tools", accountName: "Meridian Precision Tools Ltd", accountNumber: "81000013", sortCode: "20-10-13", currency: "GBP" },
  { id: "beneficiary-north-coast-chemicals", businessId, counterpartyId: "counterparty-north-coast-chemicals", name: "North Coast Industrial Chemicals", accountName: "North Coast Industrial Chemicals Ltd", accountNumber: "81000014", sortCode: "20-10-14", currency: "GBP" },
  { id: "beneficiary-valence-france", businessId, counterpartyId: "counterparty-valence-france", name: "Valence Industrie", accountName: "Valence Industrie SAS", accountNumber: "81000015", currency: "EUR" },
  { id: "beneficiary-westhaven-usa", businessId, counterpartyId: "counterparty-westhaven-usa", name: "Westhaven Fabrication", accountName: "Westhaven Fabrication Inc", accountNumber: "81000016", currency: "USD" },
  { id: "beneficiary-hmrc", businessId, name: "HM Revenue & Customs", accountName: "HMRC Shipley", accountNumber: "81000017", sortCode: "20-10-17", currency: "GBP", defaultReference: "123PX00000123" },
  { id: "beneficiary-caldermere-payroll", businessId, name: "Caldermere Payroll Clearing", accountName: "Caldermere Payroll Clearing", accountNumber: "81000018", sortCode: "20-10-18", currency: "GBP", defaultReference: "MONTHLY PAYROLL" },
] satisfies Beneficiary[];
