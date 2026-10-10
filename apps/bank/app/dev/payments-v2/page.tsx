import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBeneficiaries } from "@johnshandux/ledger-synthetic-finance";
import { getBankAccounts } from "../../../src/finance/accounts";
import { BANK_BUSINESS_ID, bankFinanceEnvironment } from "../../../src/finance/environment";
import { maskAccountNumber } from "../../../src/presentation/payments";
import { ProductShell } from "../../ProductShell";
import { PaymentsV2Prototype } from "./PaymentsV2Prototype";
import { prototypeRecipientGroups } from "./prototype-recipient-groups";
import { getPrototypeBusinessDate, isPaymentsV2PrototypeAvailable } from "./prototype-model";
import type { PrototypeAccount, PrototypeRecipient } from "./prototype-model";
import "../../accounts.css";
import "./prototype.css";

export const metadata: Metadata = {
  title: "Make a payment · Ledger Bank",
  description: "Create a domestic GBP payment.",
};

export default function PaymentsV2PrototypePage() {
  if (!isPaymentsV2PrototypeAvailable(process.env.NODE_ENV)) {
    notFound();
  }

  const bankAccounts = getBankAccounts();
  const accounts: PrototypeAccount[] = bankAccounts
    .filter(
      (account) =>
        account.currency === "GBP" &&
        account.status === "active" &&
        account.accountType === "current" &&
        account.accountNumber,
    )
    .slice(0, 8)
    .map((account) => ({
      id: account.id,
      name: account.name,
      maskedIdentifier: maskAccountNumber(account.accountNumber!),
      currency: "GBP",
      availableBalanceMinor: account.availableBalanceMinor,
    }));

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
  const referenceDate = getPrototypeBusinessDate();

  return (
    <ProductShell activeRoute="payments">
      <PaymentsV2Prototype
        accounts={accounts}
        recipients={recipients}
        recipientGroups={prototypeRecipientGroups}
        referenceDate={referenceDate}
      />
    </ProductShell>
  );
}
