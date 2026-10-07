"use client";

import type { ComponentPropsWithoutRef } from "react";
import { Avatar as AvatarPrimitive } from "radix-ui";
import "./Avatar.css";

export type AvatarSize = "small" | "medium" | "large";
type AvatarRootProps = Omit<ComponentPropsWithoutRef<"span">, "children" | "role" | "aria-label" | "aria-hidden">;

export type AvatarProps = AvatarRootProps & {
  src: string;
  alt: string;
  fallback: string;
  fallbackDelayMs?: number;
  size?: AvatarSize;
};

export function Avatar({ src, alt, fallback, fallbackDelayMs = 0, size = "medium", className = "", ...props }: AvatarProps) {
  if (!Number.isFinite(fallbackDelayMs) || fallbackDelayMs < 0) throw new RangeError("Avatar fallbackDelayMs must be a finite number greater than or equal to zero.");
  return <AvatarPrimitive.Root {...props} role={alt ? "img" : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true} className={`ledger-avatar ledger-avatar--${size} ${className}`.trim()}>
    <AvatarPrimitive.Image className="ledger-avatar__image" src={src} alt="" />
    <AvatarPrimitive.Fallback className="ledger-avatar__fallback" delayMs={fallbackDelayMs}>{fallback}</AvatarPrimitive.Fallback>
  </AvatarPrimitive.Root>;
}
