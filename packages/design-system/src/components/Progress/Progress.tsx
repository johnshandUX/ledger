"use client";

import type { ComponentPropsWithoutRef } from "react";
import { Progress as ProgressPrimitive } from "radix-ui";
import "./Progress.css";

type ProgressRootProps = Omit<ComponentPropsWithoutRef<"div">, "children" | "role" | "aria-label" | "aria-valuemin" | "aria-valuemax" | "aria-valuenow" | "aria-valuetext">;

export type ProgressProps = ProgressRootProps & {
  label: string;
  value: number | null;
  max?: number;
};

export function Progress({ label, value, max = 100, className = "", ...props }: ProgressProps) {
  if (!Number.isFinite(max) || max <= 0) throw new RangeError("Progress max must be a finite number greater than zero.");
  if (value !== null && (!Number.isFinite(value) || value < 0 || value > max)) throw new RangeError("Progress value must be between zero and max, or null for indeterminate progress.");
  const percentage = value === null ? undefined : (value / max) * 100;

  return <ProgressPrimitive.Root {...props} value={value} max={max} aria-label={label} className={`ledger-progress ${className}`.trim()}>
    <ProgressPrimitive.Indicator className="ledger-progress__indicator" style={percentage === undefined ? undefined : { transform: `translateX(-${100 - percentage}%)` }} />
  </ProgressPrimitive.Root>;
}
