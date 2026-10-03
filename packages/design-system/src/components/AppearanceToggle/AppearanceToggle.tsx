"use client";

import type { ButtonHTMLAttributes } from "react";
import { Icon } from "../Icon/Icon";
import "./AppearanceToggle.css";

export type LedgerAppearance = "light" | "dark";

export type AppearanceToggleProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label" | "aria-pressed" | "children" | "onClick"
> & {
  appearance: LedgerAppearance;
  onAppearanceChange: (appearance: LedgerAppearance) => void;
};

export function AppearanceToggle({
  appearance,
  onAppearanceChange,
  className = "",
  ...props
}: AppearanceToggleProps) {
  const isDark = appearance === "dark";
  const nextAppearance = isDark ? "light" : "dark";

  return (
    <button
      type="button"
      className={`ledger-appearance-toggle ${className}`.trim()}
      aria-label="Dark appearance"
      aria-pressed={isDark}
      title={`Switch to ${nextAppearance} appearance`}
      onClick={() => onAppearanceChange(nextAppearance)}
      {...props}
    >
      <Icon name={isDark ? "moon" : "sun"} size="small" />
    </button>
  );
}
