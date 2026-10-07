import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders a native button and preserves button attributes", () => {
    const html = renderToStaticMarkup(<Button type="submit" disabled name="intent" value="save">Save</Button>);
    expect(html).toContain('<button class="ledger-button ledger-button--primary"');
    expect(html).toContain('type="submit"');
    expect(html).toContain('disabled=""');
    expect(html).toContain('name="intent"');
  });

  it("maps the supported intent variant without discarding consumer classes", () => {
    const html = renderToStaticMarkup(<Button variant="destructive" className="checkout-action">Delete</Button>);
    expect(html).toContain('class="ledger-button ledger-button--destructive checkout-action"');
  });

  it("adds the small size without changing the default class contract", () => {
    expect(renderToStaticMarkup(<Button>Default</Button>)).not.toContain("ledger-button--small");
    expect(renderToStaticMarkup(<Button size="small">Compact action</Button>)).toContain("ledger-button--small");
  });
});
