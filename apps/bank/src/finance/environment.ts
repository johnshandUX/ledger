import {
  createCaldermereScenario,
  CALDERMERE_AS_OF,
} from "@johnshandux/ledger-synthetic-finance";

export const BANK_FINANCE_AS_OF = CALDERMERE_AS_OF;

export const bankFinanceEnvironment = createCaldermereScenario({
  scenario: "normal-trading",
});

export const BANK_BUSINESS_ID = bankFinanceEnvironment.businesses[0]!.id;
