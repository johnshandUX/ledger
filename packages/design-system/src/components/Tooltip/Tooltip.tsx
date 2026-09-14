"use client";

import type { ComponentProps, ReactElement, ReactNode } from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";
import { cn } from "#lib/utils";
import "./Tooltip.css";

export type TooltipProps = Pick<ComponentProps<typeof TooltipPrimitive.Root>, "defaultOpen" | "onOpenChange" | "open"> & {
  children: ReactElement;
  content: ReactNode;
  delayDuration?: number;
};

export function Tooltip({ children, content, delayDuration = 400, ...props }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root {...props}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            data-slot="tooltip-content"
            className="ledger-tooltip__content"
            sideOffset={8}
          >
            {content}
            <TooltipPrimitive.Arrow className="ledger-tooltip__arrow" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
