import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BankStateProvider } from "../../BankStateProvider";
import NewPaymentPage from "./page";

async function renderPage(sourceAccountId?: string) {
  const page = await NewPaymentPage({
    searchParams: Promise.resolve(sourceAccountId === undefined ? {} : { sourceAccountId }),
  });
  return renderToStaticMarkup(<BankStateProvider>{page}</BankStateProvider>);
}

describe("new payment page", () => {
  it("preserves the existing default source account without a parameter", async () => {
    const html = await renderPage();

    expect(html).toContain("Make a payment");
    expect(html).toContain("Main Operating Account");
    expect(html).toContain("Multiple");
  });

  it("preselects a valid eligible source account", async () => {
    const html = await renderPage("account-supplier-payments");

    expect(html).toContain("Supplier Payments");
    expect(html).toContain("Change account. Current account Supplier Payments");
  });

  it("does not silently default an invalid source account", async () => {
    const html = await renderPage("missing-account");

    expect(html).toContain("The selected source account is unavailable.");
    expect(html).toContain("Choose an account");
    expect(html).not.toContain("Change account. Current account Main Operating Account");
  });

  it("does not silently default an ineligible source account", async () => {
    const html = await renderPage("account-restricted-project");

    expect(html).toContain("Payments cannot be made from a restricted account.");
    expect(html).toContain("Choose an account");
    expect(html).not.toContain("Change account. Current account Main Operating Account");
  });
});
