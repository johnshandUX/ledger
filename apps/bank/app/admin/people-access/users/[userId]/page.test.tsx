import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BankStateProvider } from "../../../../BankStateProvider";
import UserDetailPage from "./page";

async function renderUser(userId: string) {
  return renderToStaticMarkup(
    <BankStateProvider>
      {await UserDetailPage({ params: Promise.resolve({ userId }) })}
    </BankStateProvider>,
  );
}

describe("user detail route", () => {
  it("renders a baseline user with the Admin shell and semantic detail structure", async () => {
    const html = await renderUser("user-amelia-hart");

    expect(html.match(/<main\b/g)).toHaveLength(1);
    expect(html).toMatch(/<a[^>]*aria-current="page"[^>]*href="\/admin"|<a[^>]*href="\/admin"[^>]*aria-current="page"/);
    expect(html).toMatch(/<a[^>]*href="\/admin\/people-access"[^>]*aria-current="page"|<a[^>]*aria-current="page"[^>]*href="\/admin\/people-access"/);
    expect(html).toContain("<h1>Amelia Hart</h1>");
    expect(html).toContain("<title>Amelia Hart · Ledger Bank</title>");
    expect(html).toContain("Identity");
    expect(html).toContain("Banking role");
    expect(html).toContain("Additional access");
    expect(html).toContain("Finance Director");
    expect(html).toContain("Full banking and administrative access.");
    expect(html).toContain("Access to developer tools, banking APIs and integrations.");
    expect(html).not.toContain("Edit user");
    expect(html).not.toContain("Suspend user");
  });

  it("renders the product-owned unavailable state for an unknown id", async () => {
    const html = await renderUser("unknown-user");

    expect(html.match(/<main\b/g)).toHaveLength(1);
    expect(html).toContain("User unavailable");
    expect(html).toContain("<title>User unavailable · Ledger Bank</title>");
    expect(html).toContain("This user could not be found.");
    expect(html).toContain('href="/admin/people-access"');
    expect(html).not.toContain("unknown-user");
  });
});
