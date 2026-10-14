import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BankStateProvider } from "../../BankStateProvider";
import NewPaymentPage from "./page";

describe("new payment page", () => {
  it("renders the promoted payment journey", () => {
    const html = renderToStaticMarkup(
      <BankStateProvider><NewPaymentPage /></BankStateProvider>,
    );

    expect(html).toContain("Make a payment");
    expect(html).toContain("Main Operating Account");
    expect(html).toContain("Multiple");
  });
});
