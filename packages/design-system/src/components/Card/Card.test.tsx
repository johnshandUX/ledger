import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Card, CardBody, CardFooter, CardHeader } from "./Card";

describe("Card", () => {
  it("renders structural regions without interactive semantics", () => { const html = renderToStaticMarkup(<Card><CardHeader><h2>Operating account</h2></CardHeader><CardBody>£248,905.42</CardBody><CardFooter>Updated today</CardFooter></Card>); expect(html).toContain("ledger-card__header"); expect(html).toContain("<h2>Operating account</h2>"); expect(html).toContain("ledger-card__body"); expect(html).toContain("ledger-card__footer"); expect(html).not.toContain("tabindex"); expect(html).not.toContain("aria-label"); });
});
