import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, expectTypeOf, it } from "vitest";
import { AlertDialog, AlertDialogTrigger, type AlertDialogContentProps } from "./AlertDialog";
describe("AlertDialog", () => {
  it("exposes an alert-dialog trigger", () => { const html = renderToStaticMarkup(<AlertDialog><AlertDialogTrigger>Delete</AlertDialogTrigger></AlertDialog>); expect(html).toContain('aria-haspopup="dialog"'); });
  it("requires a visible title and both decision actions", () => { expectTypeOf<AlertDialogContentProps>().toMatchTypeOf<{ title: ReactNode; cancelAction: ReactElement; action: ReactElement; description?: ReactNode }>(); });
});
