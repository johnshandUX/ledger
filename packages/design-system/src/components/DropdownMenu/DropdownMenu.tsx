"use client";

import type { ComponentProps, ReactNode } from "react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { cn } from "#lib/utils";
import "./DropdownMenu.css";

export type DropdownMenuProps = Pick<ComponentProps<typeof DropdownMenuPrimitive.Root>, "defaultOpen" | "onOpenChange" | "open"> & { children?: ReactNode };
export function DropdownMenu(props: DropdownMenuProps) {
  return <DropdownMenuPrimitive.Root modal {...props} />;
}
export function DropdownMenuTrigger(props: ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}
export type DropdownMenuContentProps = Pick<ComponentProps<typeof DropdownMenuPrimitive.Content>, "align" | "children" | "className" | "side">;
export function DropdownMenuContent({ className, ...props }: DropdownMenuContentProps) {
  return <DropdownMenuPrimitive.Portal><DropdownMenuPrimitive.Content data-slot="dropdown-menu-content" className={cn("ledger-dropdown-menu__content", className)} sideOffset={8} {...props} /></DropdownMenuPrimitive.Portal>;
}
export type DropdownMenuItemProps = ComponentProps<typeof DropdownMenuPrimitive.Item> & { intent?: "default" | "destructive" };
export function DropdownMenuItem({ className, intent = "default", ...props }: DropdownMenuItemProps) {
  return <DropdownMenuPrimitive.Item data-slot="dropdown-menu-item" data-intent={intent} className={cn("ledger-dropdown-menu__item", className)} {...props} />;
}
export function DropdownMenuSeparator({ className, ...props }: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return <DropdownMenuPrimitive.Separator data-slot="dropdown-menu-separator" className={cn("ledger-dropdown-menu__separator", className)} {...props} />;
}
