import type { Business } from "../../domain/index.js";
import {
  CALDERMERE_BUSINESS_ID,
  CALDERMERE_LEGAL_ENTITY_ID,
} from "./shared.js";

export const caldermereBusinesses = [
  {
    id: CALDERMERE_BUSINESS_ID,
    name: "Caldermere Ltd",
    legalEntityIds: [CALDERMERE_LEGAL_ENTITY_ID],
  },
] satisfies Business[];
