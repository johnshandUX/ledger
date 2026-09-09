import type { ComponentType, SVGProps } from "react";
import {
  CircleCheck,
  CircleX,
  Info,
  TriangleAlert,
} from "lucide-react";
import "./Icon.css";

export type IconSize = "small" | "medium" | "large";

export type LedgerIconProps = Omit<SVGProps<SVGSVGElement>, "color" | "size"> & {
  size?: IconSize;
  className?: string;
  "aria-label"?: string;
};

const iconSizeMap: Record<IconSize, number> = {
  small: 16,
  medium: 20,
  large: 24,
};

const baseIconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function createLedgerIcon(Component: ComponentType<SVGProps<SVGSVGElement>>) {
  return function LedgerIcon({
    size = "medium",
    className = "",
    ...props
  }: LedgerIconProps) {
    const { "aria-label": ariaLabel, ...rest } = props;
    const isDecorative = !ariaLabel;
    const resolvedSize = iconSizeMap[size];

    return (
      <Component
        {...baseIconProps}
        {...rest}
        className={`ledger-icon ${className}`.trim()}
        width={resolvedSize}
        height={resolvedSize}
        role={isDecorative ? undefined : "img"}
        aria-hidden={isDecorative || undefined}
        aria-label={ariaLabel}
      />
    );
  };
}

export const InformationIcon = createLedgerIcon(Info);
export const SuccessIcon = createLedgerIcon(CircleCheck);
export const WarningIcon = createLedgerIcon(TriangleAlert);
export const ErrorIcon = createLedgerIcon(CircleX);
