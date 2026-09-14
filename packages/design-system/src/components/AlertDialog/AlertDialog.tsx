"use client";

import type { ComponentProps, ReactElement, ReactNode } from "react";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import { cn } from "#lib/utils";
import "./AlertDialog.css";

export type AlertDialogProps = Pick<ComponentProps<typeof AlertDialogPrimitive.Root>, "defaultOpen" | "onOpenChange" | "open"> & { children?: ReactNode };
export function AlertDialog(props: AlertDialogProps) { return <AlertDialogPrimitive.Root {...props} />; }
export function AlertDialogTrigger(props: ComponentProps<typeof AlertDialogPrimitive.Trigger>) { return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />; }

export type AlertDialogContentProps = {
  action: ReactElement;
  cancelAction: ReactElement;
  children?: ReactNode;
  className?: string;
  description?: ReactNode;
  title: ReactNode;
};
export function AlertDialogContent({ action, cancelAction, children, className, description, title }: AlertDialogContentProps) {
  const optionalDescriptionProps = description === undefined ? { "aria-describedby": undefined } : {};
  return <AlertDialogPrimitive.Portal><AlertDialogPrimitive.Overlay className="ledger-alert-dialog__overlay" /><AlertDialogPrimitive.Content data-slot="alert-dialog-content" className={cn("ledger-alert-dialog__content", className)} {...optionalDescriptionProps}><div className="ledger-alert-dialog__header"><AlertDialogPrimitive.Title className="ledger-alert-dialog__title">{title}</AlertDialogPrimitive.Title>{description !== undefined && <AlertDialogPrimitive.Description className="ledger-alert-dialog__description">{description}</AlertDialogPrimitive.Description>}</div>{children !== undefined && <div data-slot="alert-dialog-body" className="ledger-alert-dialog__body">{children}</div>}<div data-slot="alert-dialog-footer" className="ledger-alert-dialog__footer"><AlertDialogPrimitive.Cancel asChild>{cancelAction}</AlertDialogPrimitive.Cancel><AlertDialogPrimitive.Action asChild>{action}</AlertDialogPrimitive.Action></div></AlertDialogPrimitive.Content></AlertDialogPrimitive.Portal>;
}
