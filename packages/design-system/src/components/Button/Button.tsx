import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.css";

type ButtonVariant = "primary" | "secondary" | "destructive";
type ButtonSize = "default" | "small";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  children,
  variant = "primary",
  size = "default",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`ledger-button ledger-button--${variant}${size === "small" ? " ledger-button--small" : ""} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
