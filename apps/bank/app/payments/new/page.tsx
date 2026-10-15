import type { Metadata } from "next";
import { getBeneficiaries } from "@johnshandux/ledger-synthetic-finance";
import { BANK_BUSINESS_ID, bankFinanceEnvironment } from "../../../src/finance/environment";
import { maskAccountNumber } from "../../../src/presentation/payments";
import { ProductShell } from "../../ProductShell";
import { prototypeRecipientGroups } from "../../dev/payments-v2/prototype-recipient-groups";
import { getPrototypeBusinessDate } from "../../dev/payments-v2/prototype-model";
import type { PrototypeRecipient } from "../../dev/payments-v2/prototype-model";
import { PaymentsV2Entry } from "./PaymentsV2Entry";
import "../../accounts.css";
import "../../dev/payments-v2/prototype.css";

export const metadata: Metadata = { title: "New payment · Ledger Bank" };

export default async function NewPaymentPage({
  searchParams,
}: {
  searchParams?: Promise<{ sourceAccountId?: string | string[] }>;
}) {
  const sourceAccountIdValue = (await searchParams)?.sourceAccountId;
  const sourceAccountRequested = sourceAccountIdValue !== undefined;
  const requestedSourceAccountId = typeof sourceAccountIdValue === "string"
    ? sourceAccountIdValue
    : undefined;
  const recipients: PrototypeRecipient[] = getBeneficiaries(
    bankFinanceEnvironment,
    { businessId: BANK_BUSINESS_ID, currency: "GBP" },
  ).map((recipient) => ({
    id: recipient.id,
    name: recipient.name,
    accountName: recipient.accountName,
    accountNumber: recipient.accountNumber,
    sortCode: recipient.sortCode,
    maskedIdentifier: maskAccountNumber(recipient.accountNumber),
    currency: "GBP",
  }));

  return <ProductShell activeRoute="payments"><PaymentsV2Entry
    requestedSourceAccountId={requestedSourceAccountId}
    sourceAccountRequested={sourceAccountRequested}
    recipients={recipients}
    recipientGroups={prototypeRecipientGroups}
    referenceDate={getPrototypeBusinessDate()}
  /></ProductShell>;
}
