import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBankAccounts } from "../../../src/finance/accounts";
import { maskAccountNumber } from "../../../src/presentation/payments";
import { ProductShell } from "../../ProductShell";
import { PaymentsV2Prototype } from "../../dev/payments-v2/PaymentsV2Prototype";
import type { PrototypeAccount } from "../../dev/payments-v2/prototype-model";
import "../../accounts.css";
import "../../dev/payments-v2/prototype.css";

export const metadata: Metadata = { title: "New payment · Ledger Bank" };

export default function NewPaymentPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  const bankAccounts = getBankAccounts();
  const accounts: PrototypeAccount[] = bankAccounts
    .filter((account) => account.currency === "GBP" && account.status === "active" && account.accountType === "current" && account.accountNumber)
    .map((account) => ({ id: account.id, name: account.name, maskedIdentifier: maskAccountNumber(account.accountNumber!), currency: "GBP", availableBalanceMinor: account.availableBalanceMinor }));
  return <ProductShell activeRoute="payments"><PaymentsV2Prototype accounts={accounts} /></ProductShell>;
}
