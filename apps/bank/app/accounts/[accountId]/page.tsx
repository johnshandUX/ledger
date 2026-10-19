import { notFound } from "next/navigation";
import "../../accounts.css";
import { getBankAccountById } from "../../../src/finance/accounts";
import { getBankTransactionsForAccount } from "../../../src/finance/transactions";
import { ProductShell } from "../../ProductShell";
import { AccountDetailsExperience } from "./AccountDetailsExperience";

export default async function AccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ accountId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { accountId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const account = getBankAccountById(accountId);
  if (!account) notFound();
  const transactions = getBankTransactionsForAccount(account.id);

  return (
    <ProductShell activeRoute="accounts">
      <div className="page account-page">
        <AccountDetailsExperience accountId={account.id} transactions={transactions} initialSearchParams={resolvedSearchParams} />
      </div>
    </ProductShell>
  );
}
