import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getBankAccounts } from "../../../src/finance/accounts";
import { BankStateProvider } from "../../BankStateProvider";
import AccountPage from "./page";

async function renderAccount(accountId: string) {
  return renderToStaticMarkup(
    <BankStateProvider>
      {await AccountPage({ params: Promise.resolve({ accountId }) })}
    </BankStateProvider>,
  );
}

describe("account detail integration", () => {
  it("renders consolidated identity and distinct financial position for an eligible account", async () => {
    const account = getBankAccounts().find(({ id }) => id === "account-main-operating")!;
    const html = await renderAccount(account.id);

    expect(html).toContain(`<h1>${account.name}</h1>`);
    expect(html).toContain("Current account");
    expect(html).toContain("GBP");
    expect(html).toContain(account.sortCode);
    expect(html).toContain(account.accountNumber);
    expect(html).toContain("Available balance");
    expect(html).toContain("Current balance");
    expect(html).toContain(`href="/payments/new?sourceAccountId=${account.id}"`);
    expect(html.match(/Make a payment/g)).toHaveLength(1);
  });

  it.each([
    ["restricted", "Payments cannot be made from a restricted account."],
    ["closed", "Payments cannot be made from a closed account."],
  ] as const)("keeps a %s account inspectable with an explained disabled action", async (status, reason) => {
    const account = getBankAccounts().find((candidate) => candidate.status === status)!;
    const html = await renderAccount(account.id);

    expect(html).toContain(account.name);
    expect(html).toContain(`<dd class="account-status">${status}</dd>`);
    expect(html).toContain("disabled");
    expect(html).toContain(reason);
    expect(html).not.toContain(`/payments/new?sourceAccountId=${account.id}`);
  });

  it.each([
    ["account-instant-access-reserve", "Payments can only be made from current accounts."],
    ["account-usd-operating", "Payments V2 currently supports GBP accounts only."],
  ])("does not expose an enabled payment action for %s", async (accountId, reason) => {
    const html = await renderAccount(accountId);

    expect(html).toContain("disabled");
    expect(html).toContain(reason);
    expect(html).not.toContain(`/payments/new?sourceAccountId=${accountId}`);
  });

  it("omits unavailable domestic identifiers without rendering placeholder metadata", async () => {
    const html = await renderAccount("account-usd-operating");

    expect(html).not.toContain("Sort code</dt>");
    expect(html).not.toContain("Account number</dt>");
  });

  it("preserves the breadcrumb and embedded transaction history", async () => {
    const html = await renderAccount("account-main-operating");

    expect(html).toMatch(/<a[^>]*href="\/"[^>]*>Accounts<\/a>/);
    expect(html).toContain("Transactions");
    expect(html).toContain("Transactions for this account");
  });

  it("retains not-found behaviour for an unknown account", async () => {
    await expect(AccountPage({ params: Promise.resolve({ accountId: "unknown-account" }) }))
      .rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });
});
