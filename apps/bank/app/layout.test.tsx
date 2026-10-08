import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Ledger Bank application state boundary", () => {
  it("mounts one state provider around route content in the persistent root layout", () => {
    const source = readFileSync(new URL("./layout.tsx", import.meta.url), "utf8");

    expect(source.match(/<BankStateProvider>/g)).toHaveLength(1);
    expect(source).toContain("<BankStateProvider>{children}</BankStateProvider>");
  });
});
