import type { HTMLAttributes } from "react";
import "./Skeleton.css";

export type SkeletonProps = Omit<HTMLAttributes<HTMLDivElement>, "aria-hidden" | "children">;

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  // Discard children defensively at runtime as well as excluding them from the
  // public type, so forced or untyped usage cannot hide meaningful content.
  const { children: _children, ...safeProps } = props as HTMLAttributes<HTMLDivElement>;
  return <div {...safeProps} className={`ledger-skeleton ${className}`.trim()} aria-hidden="true" />;
}
