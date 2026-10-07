import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import "./AspectRatio.css";

export type AspectRatioProps = HTMLAttributes<HTMLDivElement> & {
  ratio: number;
  children: ReactNode;
};

export function AspectRatio({ ratio, children, className = "", style, ...props }: AspectRatioProps) {
  if (!Number.isFinite(ratio) || ratio <= 0) {
    throw new RangeError("AspectRatio ratio must be a finite number greater than zero.");
  }

  return (
    <div
      {...props}
      className={`ledger-aspect-ratio ${className}`.trim()}
      style={{ ...style, aspectRatio: ratio } as CSSProperties}
    >
      {children}
    </div>
  );
}
