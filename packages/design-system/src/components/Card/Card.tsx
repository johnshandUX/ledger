import type { HTMLAttributes, ReactNode } from "react";
import "./Card.css";

type CardPartProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };
export type CardProps = CardPartProps;

function partClass(base: string, className: string) { return `${base} ${className}`.trim(); }
export function Card({ children, className = "", ...props }: CardProps) { return <div {...props} className={partClass("ledger-card", className)}>{children}</div>; }
export function CardHeader({ children, className = "", ...props }: CardPartProps) { return <div {...props} className={partClass("ledger-card__header", className)}>{children}</div>; }
export function CardBody({ children, className = "", ...props }: CardPartProps) { return <div {...props} className={partClass("ledger-card__body", className)}>{children}</div>; }
export function CardFooter({ children, className = "", ...props }: CardPartProps) { return <div {...props} className={partClass("ledger-card__footer", className)}>{children}</div>; }
