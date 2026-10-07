import type { HTMLAttributes } from "react";
import "./Separator.css";

export type SeparatorOrientation = "horizontal" | "vertical";

export type SeparatorProps = HTMLAttributes<HTMLElement> & {
  orientation?: SeparatorOrientation;
  decorative?: boolean;
};

export function Separator({
  orientation = "horizontal",
  decorative = true,
  className = "",
  ...props
}: SeparatorProps) {
  const classes = `ledger-separator ledger-separator--${orientation} ${className}`.trim();
  const accessibilityProps = decorative
    ? { "aria-hidden": true as const }
    : { role: "separator", "aria-orientation": orientation };

  if (orientation === "horizontal") {
    return <hr {...props} {...accessibilityProps} className={classes} />;
  }

  return <span {...props} {...accessibilityProps} className={classes} />;
}
