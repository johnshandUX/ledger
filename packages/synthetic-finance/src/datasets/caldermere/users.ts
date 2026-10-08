import type { User } from "../../domain/index.js";
import { CALDERMERE_BUSINESS_ID } from "./shared.js";

export const caldermereUsers = [
  { id: "user-amelia-hart", businessId: CALDERMERE_BUSINESS_ID, firstName: "Amelia", lastName: "Hart", email: "amelia.hart@caldermere.example", roleIds: ["role-finance-leadership"], status: "active" },
  { id: "user-daniel-okafor", businessId: CALDERMERE_BUSINESS_ID, firstName: "Daniel", lastName: "Okafor", email: "daniel.okafor@caldermere.example", roleIds: ["role-finance-leadership"], status: "active" },
  { id: "user-priya-shah", businessId: CALDERMERE_BUSINESS_ID, firstName: "Priya", lastName: "Shah", email: "priya.shah@caldermere.example", roleIds: ["role-treasury"], status: "active" },
  { id: "user-thomas-reed", businessId: CALDERMERE_BUSINESS_ID, firstName: "Thomas", lastName: "Reed", email: "thomas.reed@caldermere.example", roleIds: ["role-treasury"], status: "active" },
  { id: "user-sophie-bennett", businessId: CALDERMERE_BUSINESS_ID, firstName: "Sophie", lastName: "Bennett", email: "sophie.bennett@caldermere.example", roleIds: ["role-payables"], status: "active" },
  { id: "user-jack-murphy", businessId: CALDERMERE_BUSINESS_ID, firstName: "Jack", lastName: "Murphy", email: "jack.murphy@caldermere.example", roleIds: ["role-payables"], status: "active" },
  { id: "user-hannah-clarke", businessId: CALDERMERE_BUSINESS_ID, firstName: "Hannah", lastName: "Clarke", email: "hannah.clarke@caldermere.example", roleIds: ["role-payables"], status: "active" },
  { id: "user-lewis-wright", businessId: CALDERMERE_BUSINESS_ID, firstName: "Lewis", lastName: "Wright", email: "lewis.wright@caldermere.example", roleIds: ["role-payables"], status: "suspended" },
  { id: "user-aisha-khan", businessId: CALDERMERE_BUSINESS_ID, firstName: "Aisha", lastName: "Khan", email: "aisha.khan@caldermere.example", roleIds: ["role-receivables"], status: "active" },
  { id: "user-oliver-price", businessId: CALDERMERE_BUSINESS_ID, firstName: "Oliver", lastName: "Price", email: "oliver.price@caldermere.example", roleIds: ["role-receivables"], status: "active" },
  { id: "user-megan-davies", businessId: CALDERMERE_BUSINESS_ID, firstName: "Megan", lastName: "Davies", email: "megan.davies@caldermere.example", roleIds: ["role-receivables"], status: "active" },
  { id: "user-benjamin-frost", businessId: CALDERMERE_BUSINESS_ID, firstName: "Benjamin", lastName: "Frost", email: "benjamin.frost@caldermere.example", roleIds: ["role-payables"], status: "active" },
  { id: "user-rachel-evans", businessId: CALDERMERE_BUSINESS_ID, firstName: "Rachel", lastName: "Evans", email: "rachel.evans@caldermere.example", roleIds: ["role-finance-leadership"], status: "active" },
  { id: "user-samuel-green", businessId: CALDERMERE_BUSINESS_ID, firstName: "Samuel", lastName: "Green", email: "samuel.green@caldermere.example", roleIds: ["role-receivables"], status: "active" },
  { id: "user-lucy-turner", businessId: CALDERMERE_BUSINESS_ID, firstName: "Lucy", lastName: "Turner", email: "lucy.turner@caldermere.example", roleIds: ["role-business-administration"], status: "active" },
  { id: "user-noah-wilson", businessId: CALDERMERE_BUSINESS_ID, firstName: "Noah", lastName: "Wilson", email: "noah.wilson@caldermere.example", roleIds: ["role-business-administration"], status: "active" },
  { id: "user-emily-scott", businessId: CALDERMERE_BUSINESS_ID, firstName: "Emily", lastName: "Scott", email: "emily.scott@caldermere.example", roleIds: ["role-read-only"], status: "active" },
  { id: "user-george-hughes", businessId: CALDERMERE_BUSINESS_ID, firstName: "George", lastName: "Hughes", email: "george.hughes@caldermere.example", roleIds: ["role-read-only"], status: "active" },
] satisfies User[];
