import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import PaymentsPage from "./page";

describe("payments overview", () => {
  it("renders shared summary values without implying additive categories", () => {
    const html = renderToStaticMarkup(<PaymentsPage />);
    expect(html).toContain("12");
    expect(html).toContain("4 awaiting approval · 5 scheduled · 3 processing");
    expect(html).toContain("7 approval actions outstanding across 4 payments");
    expect(html).toContain("Payment activity");
  });
});
