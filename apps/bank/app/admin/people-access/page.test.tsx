import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BankStateProvider } from "../../BankStateProvider";
import PeopleAccessPage from "./page";

describe("People and access page", () => {
  const renderPage = () => renderToStaticMarkup(<BankStateProvider><PeopleAccessPage /></BankStateProvider>);

  it("uses the ProductShell main landmark and keeps Admin active", () => {
    const html = renderPage();
    expect(html.match(/<main\b/g)).toHaveLength(1);
    expect(html).toMatch(/<a[^>]*aria-current="page"[^>]*href="\/admin"|<a[^>]*href="\/admin"[^>]*aria-current="page"/);
    expect(html).toContain("People &amp; access");
    expect(html).toContain("View the people who have access to Caldermere Ltd’s banking services");
  });

  it("renders semantic local route navigation", () => {
    const html = renderPage();
    expect(html).toContain('<nav class="people-access-navigation" aria-label="People and access">');
    expect(html).toMatch(/<a[^>]*href="\/admin\/people-access"[^>]*aria-current="page"|<a[^>]*aria-current="page"[^>]*href="\/admin\/people-access"/);
    expect(html).toContain('href="/admin/people-access/roles"');
  });
});
