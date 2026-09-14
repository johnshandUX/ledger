"use client";

import type { ComponentProps, ReactNode } from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { cn } from "#lib/utils";
import "./Popover.css";

export type PopoverProps = Pick<ComponentProps<typeof PopoverPrimitive.Root>, "defaultOpen" | "onOpenChange" | "open"> & { children?: ReactNode };
export function Popover(props: PopoverProps) {
  return <PopoverPrimitive.Root modal={false} {...props} />;
}

export function PopoverTrigger(props: ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

export function PopoverClose(props: ComponentProps<typeof PopoverPrimitive.Close>) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
}

export type PopoverContentProps = Pick<ComponentProps<typeof PopoverPrimitive.Content>, "align" | "children" | "className" | "side">;
export function PopoverContent({ className, ...props }: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        className={cn("ledger-popover__content", className)}
        sideOffset={8}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
