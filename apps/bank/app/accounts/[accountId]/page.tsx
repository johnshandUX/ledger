import { notFound } from "next/navigation";
import "../../accounts.css";
import { getBankAccountById } from "../../../src/finance/accounts";
import { getBankTransactionsForAccount } from "../../../src/finance/transactions";
import { ProductShell } from "../../ProductShell";
import { AccountDetailsExperience } from "./AccountDetailsExperience";

export default async function AccountPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  const account = getBankAccountById(accountId);
  if (!account) notFound();
  const transactions = getBankTransactionsForAccount(account.id);

  return (
    <ProductShell activeRoute="accounts">
      <div className="page account-page">
        <AccountDetailsExperience accountId={account.id} transactions={transactions} />
      </div>
    </ProductShell>
  );
}
