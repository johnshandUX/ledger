import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, expectTypeOf, it } from "vitest";
import { Dialog, DialogTrigger, type DialogContentProps } from "./Dialog";

describe("Dialog", () => {
  it("exposes the Radix trigger through the Ledger API", () => {
    const html = renderToStaticMarkup(
      <Dialog>
        <DialogTrigger>Open dialog</DialogTrigger>
      </Dialog>,
    );

    expect(html).toContain('data-slot="dialog-trigger"');
    expect(html).toContain("Open dialog");
    expect(html).toContain('aria-haspopup="dialog"');
  });

  it("requires a title while keeping the description optional", () => {
    expectTypeOf<DialogContentProps>().toMatchTypeOf<{
      title: ReactNode;
      description?: ReactNode;
      mobileFullScreen?: boolean;
    }>();
  });

  it("top-aligns body content and defines the mobile full-screen three-region layout", () => {
    const css = readFileSync(new URL("./Dialog.css", import.meta.url), "utf8");

    expect(css).toMatch(/\.ledger-dialog__body\s*\{[^}]*align-content:\s*start;/s);
    expect(css).toMatch(/\.ledger-dialog__content\.ledger-dialog__content--mobile-full-screen\[data-slot="dialog-content"\]\s*\{[^}]*box-sizing:\s*border-box;/s);
    expect(css).toMatch(/\.ledger-dialog__content\.ledger-dialog__content--mobile-full-screen\[data-slot="dialog-content"\]\s*\{[^}]*grid-template-rows:\s*auto minmax\(0, 1fr\) auto;/s);
    expect(css).toMatch(/\.ledger-dialog__content\.ledger-dialog__content--mobile-full-screen\[data-slot="dialog-content"\]\s*\{[^}]*height:\s*100dvh;/s);
    expect(css).toContain("env(safe-area-inset-bottom)");
  });
});
