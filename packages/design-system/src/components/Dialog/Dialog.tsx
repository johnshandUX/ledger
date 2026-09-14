"use client";

import type { ComponentProps, HTMLAttributes, ReactNode } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "#lib/utils";
import "./Dialog.css";

export function Dialog(props: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

export function DialogTrigger(
  props: ComponentProps<typeof DialogPrimitive.Trigger>,
) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal(
  props: ComponentProps<typeof DialogPrimitive.Portal>,
) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

export function DialogClose(
  props: ComponentProps<typeof DialogPrimitive.Close>,
) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn("ledger-dialog__overlay", className)}
      {...props}
    />
  );
}

export type DialogContentProps = Omit<
  ComponentProps<typeof DialogPrimitive.Content>,
  "title"
> & {
  title: ReactNode;
  description?: ReactNode;
  closeLabel?: string;
  showCloseButton?: boolean;
};

export function DialogContent({
  children,
  className,
  closeLabel = "Close dialog",
  description,
  showCloseButton = true,
  title,
  ...props
}: DialogContentProps) {
  const optionalDescriptionProps =
    description === undefined && props["aria-describedby"] === undefined
      ? { "aria-describedby": undefined }
      : {};

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn("ledger-dialog__content", className)}
        {...optionalDescriptionProps}
        {...props}
      >
        <div data-slot="dialog-header" className="ledger-dialog__header">
          <DialogPrimitive.Title
            data-slot="dialog-title"
            className="ledger-dialog__title"
          >
            {title}
          </DialogPrimitive.Title>
          {description !== undefined && (
            <DialogPrimitive.Description
              data-slot="dialog-description"
              className="ledger-dialog__description"
            >
              {description}
            </DialogPrimitive.Description>
          )}
        </div>
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            className="ledger-dialog__close"
            aria-label={closeLabel}
          >
            <span className="ledger-dialog__close-icon" aria-hidden="true" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function DialogBody({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-body"
      className={cn("ledger-dialog__body", className)}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("ledger-dialog__footer", className)}
      {...props}
    />
  );
}
