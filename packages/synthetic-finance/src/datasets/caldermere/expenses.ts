import type {
  CardSpendingLimit,
  CardTransaction,
  ExpenseCard,
  ExpenseCardholder,
  ExpenseRecord,
  ExpenseTeam,
  Merchant,
  TeamSpendingBudget,
} from "../../domain/index.js";
import { CALDERMERE_BUSINESS_ID } from "./shared.js";

export const caldermereExpenseTeams = [
  { id: "expense-team-operations", businessId: CALDERMERE_BUSINESS_ID, name: "Operations", description: "Facilities, travel and day-to-day operations.", status: "active" },
  { id: "expense-team-marketing", businessId: CALDERMERE_BUSINESS_ID, name: "Marketing", description: "Campaigns, content and brand activity.", status: "active" },
  { id: "expense-team-engineering", businessId: CALDERMERE_BUSINESS_ID, name: "Engineering", description: "Product engineering and technical services.", status: "active" },
  { id: "expense-team-sales", businessId: CALDERMERE_BUSINESS_ID, name: "Sales", description: "Customer acquisition and sales travel.", status: "active" },
  { id: "expense-team-people", businessId: CALDERMERE_BUSINESS_ID, name: "People & Culture", description: "Recruitment, learning and employee experience.", status: "active" },
] satisfies ExpenseTeam[];

export const caldermereTeamSpendingBudgets = [
  ["operations", 1_800_000],
  ["marketing", 1_200_000],
  ["engineering", 1_500_000],
  ["sales", 1_000_000],
  ["people", 500_000],
].map(([team, amountMinor]) => ({
  id: `expense-budget-${team}-monthly`,
  teamId: `expense-team-${team}`,
  currency: "GBP" as const,
  amountMinor: amountMinor as number,
  period: "monthly" as const,
  effectiveFrom: "2026-01-01",
})) satisfies TeamSpendingBudget[];

const holderNames = [
  ["amelia-hart", "Amelia Hart", "operations", "user-amelia-hart"],
  ["daniel-okafor", "Daniel Okafor", "operations", "user-daniel-okafor"],
  ["sophie-bennett", "Sophie Bennett", "operations", "user-sophie-bennett"],
  ["jack-murphy", "Jack Murphy", "operations", "user-jack-murphy"],
  ["aisha-khan", "Aisha Khan", "operations", "user-aisha-khan"],
  ["maya-patel", "Maya Patel", "marketing", undefined],
  ["leo-carter", "Leo Carter", "marketing", undefined],
  ["imani-brooks", "Imani Brooks", "marketing", undefined],
  ["theo-walsh", "Theo Walsh", "marketing", undefined],
  ["nina-foster", "Nina Foster", "marketing", undefined],
  ["noah-wilson", "Noah Wilson", "engineering", "user-noah-wilson"],
  ["emily-scott", "Emily Scott", "engineering", "user-emily-scott"],
  ["erin-cooper", "Erin Cooper", "engineering", undefined],
  ["marcus-lee", "Marcus Lee", "engineering", undefined],
  ["zoe-hall", "Zoe Hall", "engineering", undefined],
  ["oliver-price", "Oliver Price", "sales", "user-oliver-price"],
  ["megan-davies", "Megan Davies", "sales", "user-megan-davies"],
  ["samuel-green", "Samuel Green", "sales", "user-samuel-green"],
  ["ruby-james", "Ruby James", "sales", undefined],
  ["adam-cole", "Adam Cole", "sales", undefined],
  ["rachel-evans", "Rachel Evans", "people", "user-rachel-evans"],
  ["lucy-turner", "Lucy Turner", "people", "user-lucy-turner"],
  ["freya-mills", "Freya Mills", "people", undefined],
] as const;

const contractorNames = [
  ["elena-rossi", "Elena Rossi", "marketing"],
  ["callum-reid", "Callum Reid", "engineering"],
  ["sana-ali", "Sana Ali", "operations"],
  ["jonas-berg", "Jonas Berg", "sales"],
  ["grace-kim", "Grace Kim", "people"],
] as const;

const cardholderStatusBySlug = {
  "daniel-okafor": "frozen",
  "jack-murphy": "pending_activation",
  "leo-carter": "removed",
  "grace-kim": "removed",
} as const;

function cardholderStatus(slug: string): ExpenseCardholder["status"] {
  return cardholderStatusBySlug[slug as keyof typeof cardholderStatusBySlug] ?? "active";
}

export const caldermereExpenseCardholders: ExpenseCardholder[] = [
  ...holderNames.map(([slug, displayName, team, userId]) => ({
    id: `expense-cardholder-${slug}`,
    businessId: CALDERMERE_BUSINESS_ID,
    primaryTeamId: `expense-team-${team}`,
    ...(userId === undefined ? {} : { userId }),
    displayName,
    email: `${slug}@caldermere.example`,
    type: "employee" as const,
    status: cardholderStatus(slug),
  })),
  ...contractorNames.map(([slug, displayName, team]) => ({
    id: `expense-cardholder-${slug}`,
    businessId: CALDERMERE_BUSINESS_ID,
    primaryTeamId: `expense-team-${team}`,
    displayName,
    email: `${slug}@contractors.caldermere.example`,
    type: "external-contractor" as const,
    status: cardholderStatus(slug),
  })),
];

const physicalHolderSlugs = [
  "amelia-hart", "daniel-okafor", "sophie-bennett", "maya-patel",
  "noah-wilson", "oliver-price", "rachel-evans", "jack-murphy",
] as const;

const teamByHolder = new Map(
  caldermereExpenseCardholders.map(({ id, primaryTeamId }) => [id, primaryTeamId]),
);

const physicalCards: ExpenseCard[] = physicalHolderSlugs.map((slug, index) => ({
  id: `expense-card-physical-${slug}`,
  businessId: CALDERMERE_BUSINESS_ID,
  cardholderId: `expense-cardholder-${slug}`,
  spendingTeamId: teamByHolder.get(`expense-cardholder-${slug}`)!,
  name: `${holderNames.find(([candidate]) => candidate === slug)?.[1] ?? slug} physical`,
  type: "physical",
  status: index === 1 ? "frozen" : index === 7 ? "pending_activation" : "active",
  lastFour: String(4101 + index).padStart(4, "0"),
  expiresAt: "2029-09-30",
  issuedAt: "2025-11-10",
  ...(index === 7 ? {} : { activatedAt: "2025-11-14" }),
}));

const virtualHolderSlugs = caldermereExpenseCardholders
  .filter(
    ({ id }) =>
      id !== "expense-cardholder-jack-murphy" &&
      id !== "expense-cardholder-grace-kim" &&
      id !== "expense-cardholder-adam-cole",
  )
  .map(({ id }) => id.replace("expense-cardholder-", ""));

const virtualCards: ExpenseCard[] = virtualHolderSlugs.map((slug, index) => {
  const holderId = `expense-cardholder-${slug}`;
  const isPhotographer = slug === "elena-rossi";
  const isCrossTeam = slug === "sana-ali";
  return {
    id: `expense-card-virtual-${slug}`,
    businessId: CALDERMERE_BUSINESS_ID,
    cardholderId: holderId,
    spendingTeamId: isCrossTeam ? "expense-team-marketing" : teamByHolder.get(holderId)!,
    name: isPhotographer ? "Marketing photography assignment" : `${slug.replaceAll("-", " ")} virtual`,
    type: "virtual",
    status: index === 2 ? "expired" : index === 5 ? "cancelled" : "active",
    lastFour: String(6201 + index).padStart(4, "0"),
    expiresAt: index === 2 ? "2026-09-30" : "2028-12-31",
    issuedAt: isPhotographer ? "2026-09-15" : "2026-01-15",
    activatedAt: isPhotographer ? "2026-09-15" : "2026-01-16",
    ...(isPhotographer ? { validFrom: "2026-09-15", validTo: "2026-10-31" } : {}),
  };
});

export const caldermereExpenseCards = [...physicalCards, ...virtualCards];

export const caldermereCardSpendingLimits: CardSpendingLimit[] = caldermereExpenseCards.map(
  (card, index) => {
    const photographer = card.id === "expense-card-virtual-elena-rossi";
    const perTransaction = index % 9 === 0;
    return {
      id: `expense-limit-${card.id.replace("expense-card-", "")}`,
      cardId: card.id,
      currency: "GBP",
      type: photographer ? "total" : perTransaction ? "per_transaction" : "monthly",
      amountMinor: photographer ? 225_000 : perTransaction ? 100_000 : 2_000_000,
    };
  },
);

export const caldermereMerchants = [
  ["rail", "Northstar Rail", "Transport", "4112"],
  ["hotel", "Harbour House Hotels", "Accommodation", "7011"],
  ["equipment", "Field & Frame Equipment", "Equipment", "5946"],
  ["software", "Cloudsmith Software", "Software subscriptions", "5734"],
  ["office", "Paper & Pine Office", "Office supplies", "5943"],
  ["marketing", "Brightline Media", "Marketing services", "7311"],
  ["meals", "The Common Table", "Meals", "5812"],
  ["taxi", "Cityline Cars", "Transport", "4121"],
  ["air", "Albion Air", "Travel", "4511"],
  ["workspace", "Foundry Workspaces", "Office supplies", "6513"],
].map(([slug, name, category, categoryCode]) => ({
  id: `expense-merchant-${slug}`,
  name,
  category,
  categoryCode,
})) satisfies Merchant[];

const transactionCards = caldermereExpenseCards.filter(
  ({ id, status }) =>
    status !== "pending_activation" &&
    status !== "expired" &&
    id !== "expense-card-virtual-elena-rossi",
);

function generatedCardTransaction(index: number): CardTransaction {
  const teamIndex = index % caldermereExpenseTeams.length;
  const teamId = caldermereExpenseTeams[teamIndex]!.id;
  const eligibleCards = transactionCards.filter(({ spendingTeamId }) => spendingTeamId === teamId);
  const card = eligibleCards[index % eligibleCards.length]!;
  const merchant = caldermereMerchants[index % caldermereMerchants.length]!;
  const day = 1 + (index % 7);
  const status = index % 29 === 0
    ? "reversed"
    : index % 17 === 0
      ? "declined"
      : index % 13 === 0
        ? "pending"
        : "settled";
  const type = index % 31 === 0 ? "refund" : "purchase";
  const baseAmountByTeam = [18_000, 25_000, 16_000, 13_000, 6_000] as const;
  const amountMinor = baseAmountByTeam[teamIndex] + (index % 3) * 2_000;
  return {
    id: `expense-transaction-${String(index + 9).padStart(3, "0")}`,
    cardId: card.id,
    cardholderId: card.cardholderId,
    spendingTeamId: card.spendingTeamId,
    merchantId: merchant.id,
    amountMinor,
    currency: "GBP",
    transactedAt: `2026-10-${String(day).padStart(2, "0")}T${String(8 + (index % 10)).padStart(2, "0")}:15:00Z`,
    ...(status === "settled" || status === "reversed"
      ? { settledAt: `2026-10-${String(day).padStart(2, "0")}T20:00:00Z` }
      : {}),
    status,
    type,
    category: merchant.category,
    reference: `Caldermere expense ${index + 9}`,
  };
}

const scenarioTransactions: CardTransaction[] = [
  { id: "expense-transaction-operations-routine", cardId: "expense-card-physical-amelia-hart", cardholderId: "expense-cardholder-amelia-hart", spendingTeamId: "expense-team-operations", merchantId: "expense-merchant-office", amountMinor: 18_750, currency: "GBP", transactedAt: "2026-10-02T10:15:00Z", settledAt: "2026-10-03T08:00:00Z", status: "settled", type: "purchase", category: "Office supplies", reference: "Operations supplies" },
  { id: "expense-transaction-photographer-equipment", cardId: "expense-card-virtual-elena-rossi", cardholderId: "expense-cardholder-elena-rossi", spendingTeamId: "expense-team-marketing", merchantId: "expense-merchant-equipment", amountMinor: 205_000, currency: "GBP", transactedAt: "2026-09-22T14:30:00Z", settledAt: "2026-09-23T09:00:00Z", status: "settled", type: "purchase", category: "Equipment", reference: "Campaign shoot equipment" },
  { id: "expense-transaction-cross-team", cardId: "expense-card-virtual-sana-ali", cardholderId: "expense-cardholder-sana-ali", spendingTeamId: "expense-team-marketing", merchantId: "expense-merchant-marketing", amountMinor: 62_000, currency: "GBP", transactedAt: "2026-10-04T11:00:00Z", settledAt: "2026-10-05T08:00:00Z", status: "settled", type: "purchase", category: "Marketing services", reference: "Launch campaign support" },
  { id: "expense-transaction-refund", cardId: "expense-card-physical-amelia-hart", cardholderId: "expense-cardholder-amelia-hart", spendingTeamId: "expense-team-operations", merchantId: "expense-merchant-rail", amountMinor: 4_500, currency: "GBP", transactedAt: "2026-10-05T09:00:00Z", settledAt: "2026-10-05T17:00:00Z", status: "settled", type: "refund", category: "Transport", reference: "Cancelled rail ticket refund" },
  { id: "expense-transaction-missing-receipt", cardId: "expense-card-physical-sophie-bennett", cardholderId: "expense-cardholder-sophie-bennett", spendingTeamId: "expense-team-operations", merchantId: "expense-merchant-meals", amountMinor: 12_400, currency: "GBP", transactedAt: "2026-10-06T13:00:00Z", settledAt: "2026-10-07T07:00:00Z", status: "settled", type: "purchase", category: "Meals" },
  { id: "expense-transaction-pending", cardId: "expense-card-virtual-maya-patel", cardholderId: "expense-cardholder-maya-patel", spendingTeamId: "expense-team-marketing", merchantId: "expense-merchant-hotel", amountMinor: 38_000, currency: "GBP", transactedAt: "2026-10-07T08:10:00Z", status: "pending", type: "purchase", category: "Accommodation" },
  { id: "expense-transaction-declined", cardId: "expense-card-virtual-maya-patel", cardholderId: "expense-cardholder-maya-patel", spendingTeamId: "expense-team-marketing", merchantId: "expense-merchant-air", amountMinor: 85_000, currency: "GBP", transactedAt: "2026-10-07T08:20:00Z", status: "declined", type: "purchase", category: "Travel" },
  { id: "expense-transaction-cancelled-card-history", cardId: caldermereExpenseCards.find(({ status }) => status === "cancelled")!.id, cardholderId: caldermereExpenseCards.find(({ status }) => status === "cancelled")!.cardholderId, spendingTeamId: caldermereExpenseCards.find(({ status }) => status === "cancelled")!.spendingTeamId, merchantId: "expense-merchant-software", amountMinor: 29_000, currency: "GBP", transactedAt: "2026-08-12T10:00:00Z", settledAt: "2026-08-13T08:00:00Z", status: "settled", type: "purchase", category: "Software subscriptions", reference: "Historical subscription" },
  { id: "expense-transaction-expired-card-history", cardId: "expense-card-virtual-sophie-bennett", cardholderId: "expense-cardholder-sophie-bennett", spendingTeamId: "expense-team-operations", merchantId: "expense-merchant-software", amountMinor: 19_000, currency: "GBP", transactedAt: "2026-09-12T10:00:00Z", settledAt: "2026-09-13T08:00:00Z", status: "settled", type: "purchase", category: "Software subscriptions", reference: "Historical software subscription" },
];

export const caldermereCardTransactions = [
  ...scenarioTransactions,
  ...Array.from({ length: 291 }, (_, index) => generatedCardTransaction(index)),
];

export const caldermereExpenseRecords: ExpenseRecord[] = caldermereCardTransactions
  .filter(({ status }) => status === "settled" || status === "pending")
  .map((transaction, index) => {
    const missing = transaction.id === "expense-transaction-missing-receipt" || index % 19 === 0;
    const pendingReview = transaction.status === "pending" || index % 11 === 0;
    const reconciliationStatus = transaction.status === "pending"
      ? "unreconciled"
      : index % 7 === 0
        ? "unreconciled"
        : index % 5 === 0
          ? "matched"
          : "reconciled";
    return {
      id: `expense-record-${transaction.id.replace("expense-transaction-", "")}`,
      cardTransactionId: transaction.id,
      receiptStatus: transaction.type === "refund" ? "not_required" : missing ? "missing" : "attached",
      reviewStatus: pendingReview ? "pending_review" : "reviewed",
      reconciliationStatus,
      category: transaction.category,
      ...(reconciliationStatus === "matched" ? { matchMethod: "automatic" as const } : {}),
      ...(!missing && transaction.type === "purchase" ? { receiptAttachedAt: transaction.transactedAt } : {}),
      ...(!pendingReview ? { reviewedAt: transaction.settledAt ?? transaction.transactedAt } : {}),
      ...(reconciliationStatus === "reconciled" ? { reconciledAt: transaction.settledAt ?? transaction.transactedAt } : {}),
    };
  });
