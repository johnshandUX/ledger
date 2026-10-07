import type { HTMLAttributes, ReactNode } from "react";
import "./Badge.css";

export type BadgeVariant = "neutral" | "informational" | "success" | "warning" | "error";
export type BadgeProps = HTMLAttributes<HTMLSpanElement> & { children: ReactNode; variant?: BadgeVariant };

export function Badge({ children, variant = "neutral", className = "", ...props }: BadgeProps) {
  return <span {...props} className={`ledger-badge ledger-badge--${variant} ${className}`.trim()}>{children}</span>;
}
