import type { HTMLAttributes, ReactNode } from "react";
import { ErrorStatusIcon, InformationStatusIcon, SuccessStatusIcon, WarningStatusIcon } from "../Icon/StatusIconShapes";
import "./Alert.css";

export type AlertVariant = "neutral" | "informational" | "success" | "warning" | "error";
export type AlertProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode; variant?: AlertVariant };
export type AlertTitleProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };
export type AlertDescriptionProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

const alertIcons = {
  informational: InformationStatusIcon,
  success: SuccessStatusIcon,
  warning: WarningStatusIcon,
  error: ErrorStatusIcon,
};

export function Alert({ children, variant = "neutral", className = "", ...props }: AlertProps) {
  const StatusIcon = variant === "neutral" ? undefined : alertIcons[variant];
  return <div {...props} className={`ledger-alert ledger-alert--${variant} ${className}`.trim()}>{StatusIcon && <StatusIcon aria-hidden="true" className="ledger-alert__icon" focusable="false" height={24} width={24} />}<div className="ledger-alert__content">{children}</div></div>;
}
export function AlertTitle({ children, className = "", ...props }: AlertTitleProps) {
  return <div {...props} className={`ledger-alert__title ${className}`.trim()}>{children}</div>;
}
export function AlertDescription({ children, className = "", ...props }: AlertDescriptionProps) {
  return <div {...props} className={`ledger-alert__description ${className}`.trim()}>{children}</div>;
}
