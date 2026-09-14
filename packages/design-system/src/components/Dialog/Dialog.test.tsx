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
    }>();
  });
});
