import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PrototypeNotice } from "./PrototypeNotice";

describe("PrototypeNotice", () => {
  it("identifies every hosted state as fictional and non-production", () => {
    const html = renderToStaticMarkup(<PrototypeNotice />);

    expect(html).toContain('aria-label="Prototype notice"');
    expect(html).toContain("Demonstration prototype");
    expect(html).toContain("Fictional data");
    expect(html).toContain("Not a production banking service");
  });
});
