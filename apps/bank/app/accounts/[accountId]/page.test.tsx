import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getBankAccounts } from "../../../src/finance/accounts";
import AccountPage from "./page";

describe("account detail integration", () => {
  it.each(["restricted", "closed"] as const)(
    "renders a valid %s Caldermere account",
    async (status) => {
      const account = getBankAccounts().find((candidate) => candidate.status === status)!;
      const html = renderToStaticMarkup(
        await AccountPage({ params: Promise.resolve({ accountId: account.id }) }),
      );

      expect(html).toContain(account.name);
      expect(html).toContain(`· ${status}`);
      expect(html).toContain("Account details");
    },
  );
});
