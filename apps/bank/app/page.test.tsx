import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("accounts overview", () => {
  it("keeps the search input labelled without displaying its label", () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html).toContain('class="ledger-input-label ledger-input-label--visually-hidden"');
    expect(html).toContain('for="search-accounts"');
    expect(html).toContain('id="search-accounts"');
  });

  it("keeps passive mobile account articles out of the tab order", () => {
    const html = renderToStaticMarkup(<Home />);
    const accountArticles = html.match(/<article\b[^>]*class="[^"]*\bacc-card\b[^"]*"[^>]*>/g);

    expect(accountArticles).not.toBeNull();
    expect(accountArticles?.every((article) => !article.includes("tabindex="))).toBe(true);
  });
});
