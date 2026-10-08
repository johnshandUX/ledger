import type { LegalEntity } from "../../domain/index.js";
import {
  CALDERMERE_BUSINESS_ID,
  CALDERMERE_LEGAL_ENTITY_ID,
} from "./shared.js";

export const caldermereLegalEntities = [
  {
    id: CALDERMERE_LEGAL_ENTITY_ID,
    businessId: CALDERMERE_BUSINESS_ID,
    name: "Caldermere Ltd",
  },
] satisfies LegalEntity[];
