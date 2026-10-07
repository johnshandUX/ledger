import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders a non-interactive neutral status by default", () => { const html = renderToStaticMarkup(<Badge>Pending</Badge>); expect(html).toContain("<span"); expect(html).toContain("ledger-badge--neutral"); expect(html).not.toContain("role="); });
  it("maps semantic variants and passes through text context", () => { const html = renderToStaticMarkup(<Badge variant="success" aria-label="Payment status: completed">Completed</Badge>); expect(html).toContain("ledger-badge--success"); expect(html).toContain('aria-label="Payment status: completed"'); });
});
