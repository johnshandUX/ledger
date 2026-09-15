import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("accounts overview", () => {
  it("keeps passive mobile account articles out of the tab order", () => {
    const html = renderToStaticMarkup(<Home />);
    const accountArticles = html.match(/<article\b[^>]*class="[^"]*\bacc-card\b[^"]*"[^>]*>/g);

    expect(accountArticles).not.toBeNull();
    expect(accountArticles?.every((article) => !article.includes("tabindex="))).toBe(true);
  });
});
