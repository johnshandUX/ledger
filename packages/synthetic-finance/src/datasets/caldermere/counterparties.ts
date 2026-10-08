import type { Counterparty } from "../../domain/index.js";
import { CALDERMERE_BUSINESS_ID } from "./shared.js";

const businessId = CALDERMERE_BUSINESS_ID;

export const caldermereCounterparties = [
  { id: "counterparty-apex-steel", businessId, name: "Apex Steelworks Ltd", type: "organisation", roles: ["supplier"] },
  { id: "counterparty-boreal-alloys", businessId, name: "Boreal Alloys Ltd", type: "organisation", roles: ["supplier"] },
  { id: "counterparty-cedar-packaging", businessId, name: "Cedar Packaging Solutions Ltd", type: "organisation", roles: ["supplier"] },
  { id: "counterparty-driftway-logistics", businessId, name: "Driftway Logistics Ltd", type: "organisation", roles: ["supplier"] },
  { id: "counterparty-ember-energy", businessId, name: "Ember Industrial Energy Ltd", type: "organisation", roles: ["supplier"] },
  { id: "counterparty-forge-equipment", businessId, name: "Forge Equipment Systems Ltd", type: "organisation", roles: ["supplier"] },
  { id: "counterparty-greenline-facilities", businessId, name: "Greenline Facilities Services Ltd", type: "organisation", roles: ["supplier"] },
  { id: "counterparty-harbour-consulting", businessId, name: "Harbour Risk & Advisory LLP", type: "organisation", roles: ["supplier"] },
  { id: "counterparty-ironwood-components", businessId, name: "Ironwood Components Ltd", type: "organisation", roles: ["supplier", "customer"] },
  { id: "counterparty-junction-tech", businessId, name: "Junction Manufacturing Technology Ltd", type: "organisation", roles: ["supplier"] },
  { id: "counterparty-kestrel-workwear", businessId, name: "Kestrel Workwear Ltd", type: "organisation", roles: ["supplier"] },
  { id: "counterparty-lumen-telecom", businessId, name: "Lumen Business Telecoms Ltd", type: "organisation", roles: ["supplier"] },
  { id: "counterparty-meridian-tools", businessId, name: "Meridian Precision Tools Ltd", type: "organisation", roles: ["supplier", "customer"] },
  { id: "counterparty-north-coast-chemicals", businessId, name: "North Coast Industrial Chemicals Ltd", type: "organisation", roles: ["supplier"] },
  { id: "counterparty-oakwell-motors", businessId, name: "Oakwell Motors Group Ltd", type: "organisation", roles: ["customer"] },
  { id: "counterparty-pennine-retail", businessId, name: "Pennine Retail Holdings Ltd", type: "organisation", roles: ["customer"] },
  { id: "counterparty-quayside-engineering", businessId, name: "Quayside Engineering plc", type: "organisation", roles: ["customer"] },
  { id: "counterparty-redwood-distribution", businessId, name: "Redwood Distribution Ltd", type: "organisation", roles: ["customer"] },
  { id: "counterparty-summit-infrastructure", businessId, name: "Summit Infrastructure Partners Ltd", type: "organisation", roles: ["customer"] },
  { id: "counterparty-trident-wholesale", businessId, name: "Trident Wholesale Group Ltd", type: "organisation", roles: ["customer"] },
  { id: "counterparty-union-stores", businessId, name: "Union Stores (UK) Ltd", type: "organisation", roles: ["customer"] },
  { id: "counterparty-valence-france", businessId, name: "Valence Industrie SAS", type: "organisation", roles: ["customer"] },
  { id: "counterparty-westhaven-usa", businessId, name: "Westhaven Fabrication Inc", type: "organisation", roles: ["customer"] },
  { id: "counterparty-zuidhaven-nl", businessId, name: "Zuidhaven Techniek BV", type: "organisation", roles: ["customer"] },
] satisfies Counterparty[];
