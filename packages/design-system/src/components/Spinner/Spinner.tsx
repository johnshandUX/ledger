import type { HTMLAttributes } from "react";
import "./Spinner.css";

export type SpinnerSize = "small" | "medium" | "large";

export type SpinnerProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  size?: SpinnerSize;
  label?: string;
};

export function Spinner({ size = "medium", label, className = "", ...props }: SpinnerProps) {
  const accessibilityProps = label
    ? { role: "status", "aria-label": label }
    : { "aria-hidden": true as const };

  return (
    <span
      {...props}
      {...accessibilityProps}
      className={`ledger-spinner ledger-spinner--${size} ${className}`.trim()}
    />
  );
}
