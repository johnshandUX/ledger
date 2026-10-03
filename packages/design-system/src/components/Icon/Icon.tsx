import { iconRegistry } from "./icons";
import type { IconName } from "./icons";
import type { IconProps, IconSize, LedgerIconProps } from "./Icon.types";
import "./Icon.css";

const iconSizeMap: Record<IconSize, number> = {
  small: 16,
  medium: 20,
  large: 24,
};

export function Icon({ name, size = "medium", className = "", "aria-label": ariaLabel, ...props }: IconProps) {
  const Component = iconRegistry[name].component;
  const isDecorative = !ariaLabel;
  const resolvedSize = iconSizeMap[size];

  return <Component {...props} className={`ledger-icon ${className}`.trim()} width={resolvedSize} height={resolvedSize} fill="none" stroke="currentColor" strokeWidth={2} role={isDecorative ? undefined : "img"} aria-hidden={isDecorative || undefined} aria-label={ariaLabel} focusable="false" />;
}

function createCompatibilityIcon(name: IconName) {
  return function LedgerCompatibilityIcon(props: LedgerIconProps) { return <Icon name={name} {...props} />; };
}

/** @deprecated Use `<Icon name="information" />`. */
export const InformationIcon = createCompatibilityIcon("information");
/** @deprecated Use `<Icon name="success" />`. */
export const SuccessIcon = createCompatibilityIcon("success");
/** @deprecated Use `<Icon name="warning" />`. */
export const WarningIcon = createCompatibilityIcon("warning");
/** @deprecated Use `<Icon name="error" />`. */
export const ErrorIcon = createCompatibilityIcon("error");

export type { IconName, IconProps, IconSize, LedgerIconProps };
