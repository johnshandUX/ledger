import type { BusinessId, CounterpartyId } from "./ids.js";

export type CounterpartyType = "organisation" | "individual";
export type CounterpartyRole = "customer" | "supplier";

export interface Counterparty {
  id: CounterpartyId;
  businessId: BusinessId;
  name: string;
  type: CounterpartyType;
  roles: CounterpartyRole[];
}
