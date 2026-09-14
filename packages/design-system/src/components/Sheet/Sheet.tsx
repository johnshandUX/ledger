"use client";

import type { ComponentProps, HTMLAttributes, ReactNode } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "#lib/utils";
import "./Sheet.css";

export type SheetProps = Pick<ComponentProps<typeof DialogPrimitive.Root>, "defaultOpen" | "onOpenChange" | "open"> & { children?: ReactNode };
export function Sheet(props: SheetProps) { return <DialogPrimitive.Root modal {...props} />; }
export function SheetTrigger(props: ComponentProps<typeof DialogPrimitive.Trigger>) { return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />; }
export function SheetClose(props: ComponentProps<typeof DialogPrimitive.Close>) { return <DialogPrimitive.Close data-slot="sheet-close" {...props} />; }
export type SheetContentProps = { children?: ReactNode; className?: string; title: ReactNode; description?: ReactNode; closeLabel?: string; showCloseButton?: boolean; side?: "left" | "right" };
export function SheetContent({ children, className, closeLabel = "Close sheet", description, showCloseButton = true, side = "right", title }: SheetContentProps) {
  const optionalDescriptionProps = description === undefined ? { "aria-describedby": undefined } : {};
  return <DialogPrimitive.Portal><DialogPrimitive.Overlay className="ledger-sheet__overlay" /><DialogPrimitive.Content data-slot="sheet-content" data-side={side} className={cn("ledger-sheet__content", className)} {...optionalDescriptionProps}><div className="ledger-sheet__header"><DialogPrimitive.Title className="ledger-sheet__title">{title}</DialogPrimitive.Title>{description !== undefined && <DialogPrimitive.Description className="ledger-sheet__description">{description}</DialogPrimitive.Description>}</div>{children}{showCloseButton && <DialogPrimitive.Close className="ledger-sheet__close" aria-label={closeLabel}><span className="ledger-sheet__close-icon" aria-hidden="true" /></DialogPrimitive.Close>}</DialogPrimitive.Content></DialogPrimitive.Portal>;
}
export function SheetBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div data-slot="sheet-body" className={cn("ledger-sheet__body", className)} {...props} />; }
export function SheetFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div data-slot="sheet-footer" className={cn("ledger-sheet__footer", className)} {...props} />; }
