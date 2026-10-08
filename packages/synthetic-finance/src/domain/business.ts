import type { BusinessId, LegalEntityId } from "./ids.js";

export interface Business {
  id: BusinessId;
  name: string;
  legalEntityIds: LegalEntityId[];
}
