import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, expectTypeOf, it } from "vitest";
import { AppearanceToggle, type AppearanceToggleProps } from "./AppearanceToggle";

describe("AppearanceToggle", () => {
  it("exposes dark appearance as a pressed toggle", () => {
    const html = renderToStaticMarkup(
      <AppearanceToggle appearance="dark" onAppearanceChange={() => undefined} />,
    );

    expect(html).toContain('aria-label="Dark appearance"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('title="Switch to light appearance"');
  });

  it("requires controlled appearance state", () => {
    expectTypeOf<AppearanceToggleProps>().toHaveProperty("appearance");
    expectTypeOf<AppearanceToggleProps>().toHaveProperty("onAppearanceChange");
  });
});
