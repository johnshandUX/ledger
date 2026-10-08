import type { BusinessId, LegalEntityId } from "./ids.js";

export interface LegalEntity {
  id: LegalEntityId;
  businessId: BusinessId;
  name: string;
}
