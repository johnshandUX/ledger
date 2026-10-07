import { forwardRef, type ReactNode, type SVGProps } from "react";

type StatusIconShapeProps = SVGProps<SVGSVGElement>;

function statusIcon(displayName: string, children: ReactNode) {
  const Component = forwardRef<SVGSVGElement, StatusIconShapeProps>((props, ref) => (
    <svg ref={ref} viewBox="0 0 24 24" {...props}>
      {children}
    </svg>
  ));
  Component.displayName = displayName;
  return Component;
}

const glyphProps = {
  fill: "none",
  stroke: "var(--ledger-color-icon-status-foreground)",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 2.25,
};

export const InformationStatusIcon = statusIcon("InformationStatusIcon", <><circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" /><path {...glyphProps} d="M12 10.5v6" /><circle cx="12" cy="7.25" r="1.15" fill="var(--ledger-color-icon-status-foreground)" stroke="none" /></>);
export const SuccessStatusIcon = statusIcon("SuccessStatusIcon", <><circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" /><path {...glyphProps} d="m7.5 12.2 3 3 6-6.5" /></>);
export const WarningStatusIcon = statusIcon("WarningStatusIcon", <><path d="M10.3 3.7a2 2 0 0 1 3.4 0l8.05 13.8a2 2 0 0 1-1.7 3H3.95a2 2 0 0 1-1.7-3Z" fill="currentColor" stroke="none" /><path {...glyphProps} d="M12 8v5.25" /><circle cx="12" cy="16.75" r="1.15" fill="var(--ledger-color-icon-status-foreground)" stroke="none" /></>);
export const ErrorStatusIcon = statusIcon("ErrorStatusIcon", <><path d="m8.1 2 7.8 0L22 8.1v7.8L15.9 22H8.1L2 15.9V8.1Z" fill="currentColor" stroke="none" /><path {...glyphProps} d="m8.6 8.6 6.8 6.8m0-6.8-6.8 6.8" /></>);
