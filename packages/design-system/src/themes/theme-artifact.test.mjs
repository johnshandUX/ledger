import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const stylesheetUrl = new URL("../../dist/ledger-design-system.css", import.meta.url);

test("published stylesheet contains the complete appearance theme contract", async () => {
  const css = await readFile(stylesheetUrl, "utf8");

  const requirements = [
    ["background semantic", /--ledger-color-background:/],
    ["surface semantic", /--ledger-color-surface:/],
    ["subtle surface semantic", /--ledger-color-surface-subtle:/],
    ["elevated surface semantic", /--ledger-color-surface-elevated:/],
    ["subtle border semantic", /--ledger-color-border-subtle:/],
    ["default border semantic", /--ledger-color-border:/],
    ["strong border semantic", /--ledger-color-border-strong:/],
    ["table border semantic", /--ledger-color-table-border:/],
    ["table header surface semantic", /--ledger-color-table-header-surface:/],
    ["table header hover semantic", /--ledger-color-table-header-hover:/],
    ["table zebra row semantic", /--ledger-color-table-row-zebra:/],
    ["control border semantic", /--ledger-color-control-border:/],
    ["resting control border semantic", /--ledger-color-control-border-resting:/],
    ["hover control border semantic", /--ledger-color-control-border-hover:/],
    ["control background semantic", /--ledger-color-control-background:/],
    ["error control border semantic", /--ledger-color-control-border-error:/],
    ["disabled control border semantic", /--ledger-color-control-border-disabled:/],
    ["explicit light selector", /:root\[data-theme=["']?light["']?\]/],
    ["explicit dark selector", /:root\[data-theme=["']?dark["']?\]/],
    ["system dark media query", /@media\s*\(prefers-color-scheme:\s*dark\)/],
    ["system preference selector", /:root:not\(\[data-theme\]\)/],
    ["info status icon semantic", /--ledger-color-icon-status-info:/],
    ["success status icon semantic", /--ledger-color-icon-status-success:/],
    ["warning status icon semantic", /--ledger-color-icon-status-warning:/],
    ["error status icon semantic", /--ledger-color-icon-status-error:/],
    ["status icon foreground semantic", /--ledger-color-icon-status-foreground:/],
  ];

  for (const [label, pattern] of requirements) {
    assert(
      pattern.test(css),
      `Published design-system stylesheet is missing its ${label}`,
    );
  }
});
