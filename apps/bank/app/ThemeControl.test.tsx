import { afterEach, describe, expect, it, vi } from "vitest";
import {
  applyThemePreference,
  INITIAL_THEME_PREFERENCE,
  observeSystemAppearance,
  resolveAppearance,
} from "./ThemeControl";

afterEach(() => vi.unstubAllGlobals());

describe("ThemeControl", () => {
  it("starts with the system preference", () => {
    expect(INITIAL_THEME_PREFERENCE).toBe("system");
  });

  it("resolves System from the current OS appearance", () => {
    expect(resolveAppearance("system", "light")).toBe("light");
    expect(resolveAppearance("system", "dark")).toBe("dark");
  });

  it("keeps explicit preferences when the OS appearance changes", () => {
    expect(resolveAppearance("light", "dark")).toBe("light");
    expect(resolveAppearance("dark", "light")).toBe("dark");
    expect(resolveAppearance("dark", "dark")).toBe("dark");
  });

  it("follows live system changes and removes its listener on cleanup", () => {
    let listener: (() => void) | undefined;
    const media = {
      matches: false,
      addEventListener: vi.fn((_type: "change", nextListener: () => void) => {
        listener = nextListener;
      }),
      removeEventListener: vi.fn(),
    };
    const appearances: Array<"light" | "dark"> = [];

    const cleanup = observeSystemAppearance(media, (appearance) => appearances.push(appearance));
    expect(appearances).toEqual(["light"]);

    media.matches = true;
    listener?.();
    expect(appearances).toEqual(["light", "dark"]);

    cleanup();
    expect(media.removeEventListener).toHaveBeenCalledWith("change", listener);
  });

  it("sets explicit appearances and removes the override for system", () => {
    const dataset: Record<string, string> = {};
    vi.stubGlobal("document", { documentElement: { dataset } });

    applyThemePreference("dark");
    expect(dataset.theme).toBe("dark");

    applyThemePreference("light");
    expect(dataset.theme).toBe("light");

    applyThemePreference("system");
    expect(dataset.theme).toBeUndefined();
  });
});
