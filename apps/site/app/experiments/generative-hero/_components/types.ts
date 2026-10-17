export type ExperienceId = "cash" | "payments";

export type MoneyValue = {
  amountMinor: number;
  currency: string;
};

export type AccountSummary = MoneyValue & {
  id: string;
  name: string;
  accountNumber: string;
};

export type ActivityItem = MoneyValue & {
  id: string;
  description: string;
  direction: "credit" | "debit";
  time: string;
};

export type PaymentItem = MoneyValue & {
  id: string;
  beneficiary: string;
  reference: string;
  approvals: number;
};

export type GenerativeFinanceData = {
  asOf: string;
  availableByCurrency: MoneyValue[];
  accounts: AccountSummary[];
  activity: ActivityItem[];
  cashFlow: Array<{ label: string; incomingMinor: number; outgoingMinor: number }>;
  payments: PaymentItem[];
  outstandingApprovalActions: number;
};
