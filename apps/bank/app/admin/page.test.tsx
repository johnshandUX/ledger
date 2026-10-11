import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { administrationAreas } from "./AdminAreaNavigation";
import AdminPage from "./page";

describe("Administration home", () => {
  it("renders the Caldermere introduction and seven entry points", () => {
    const html = renderToStaticMarkup(<AdminPage />);
    expect(html).toContain('<div class="admin-page">');
    expect(html).toContain('<h1 id="admin-page-title">Administration</h1>');
    expect(html).toContain("Caldermere Ltd");
    expect(html).toContain('<nav aria-label="Administration areas">');
    expect(administrationAreas).toHaveLength(7);
    for (const area of administrationAreas) {
      expect(html).toContain(`href="${area.href}"`);
      expect(html).toContain(area.title.replace("&", "&amp;"));
      expect(html).toContain(area.description);
      for (const destination of area.destinations) expect(html).toContain(destination);
    }
  });

  it("uses the ProductShell workspace as the only main landmark", () => {
    const html = renderToStaticMarkup(<AdminPage />);
    expect(html.match(/<main\b/g)).toHaveLength(1);
    expect(html).toContain('<main class="ledger-app-workspace bank-workspace">');
    expect(html).not.toContain('<main class="admin-page"');
    expect(html).toContain('<h1 id="admin-page-title">Administration</h1>');
    expect(administrationAreas).toHaveLength(7);
  });

  it("keeps Administration active in the application navigation", () => {
    const html = renderToStaticMarkup(<AdminPage />);
    expect(html).toMatch(/<a[^>]*aria-current="page"[^>]*href="\/admin"|<a[^>]*href="\/admin"[^>]*aria-current="page"/);
  });
});
