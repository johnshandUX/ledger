import type { Metadata } from "next";
import { getBeneficiaries } from "@johnshandux/ledger-synthetic-finance";
import { getBankAccounts } from "../../../src/finance/accounts";
import { BANK_BUSINESS_ID, bankFinanceEnvironment } from "../../../src/finance/environment";
import { maskAccountNumber } from "../../../src/presentation/payments";
import { ProductShell } from "../../ProductShell";
import { PaymentsV2Prototype } from "../../dev/payments-v2/PaymentsV2Prototype";
import { prototypeRecipientGroups } from "../../dev/payments-v2/prototype-recipient-groups";
import { getPrototypeBusinessDate } from "../../dev/payments-v2/prototype-model";
import type { PrototypeAccount, PrototypeRecipient } from "../../dev/payments-v2/prototype-model";
import "../../accounts.css";
import "../../dev/payments-v2/prototype.css";

export const metadata: Metadata = { title: "New payment · Ledger Bank" };

export default function NewPaymentPage() {
  const bankAccounts = getBankAccounts();
  const accounts: PrototypeAccount[] = bankAccounts
    .filter((account) => account.currency === "GBP" && account.status === "active" && account.accountType === "current" && account.accountNumber)
    .map((account) => ({ id: account.id, name: account.name, maskedIdentifier: maskAccountNumber(account.accountNumber!), currency: "GBP", availableBalanceMinor: account.availableBalanceMinor }));
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

  return <ProductShell activeRoute="payments"><PaymentsV2Prototype
    accounts={accounts}
    recipients={recipients}
    recipientGroups={prototypeRecipientGroups}
    referenceDate={getPrototypeBusinessDate()}
  /></ProductShell>;
}
