import type { ReactNode } from "react";
import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import "./Table.css";

type Align = "left" | "center" | "right";

type TableProps = {
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
};

type SectionProps = {
  className?: string;
  children: ReactNode;
};

type RowProps = HTMLAttributes<HTMLTableRowElement> & {
  className?: string;
  children: ReactNode;
};

type CellProps = TdHTMLAttributes<HTMLTableCellElement> & {
  className?: string;
  children: ReactNode;
  align?: Align;
};

export function Table({ className = "", children, ariaLabel }: TableProps) {
  return (
    <table className={`ledger-table ${className}`.trim()} aria-label={ariaLabel}>
      {children}
    </table>
  );
}

export function TableHead({ className = "", children }: SectionProps) {
  return <thead className={`ledger-table__head ${className}`.trim()}>{children}</thead>;
}

export function TableBody({ className = "", children }: SectionProps) {
  return <tbody className={`ledger-table__body ${className}`.trim()}>{children}</tbody>;
}

export function TableRow({ className = "", children, ...props }: RowProps) {
  return (
    <tr {...props} className={`ledger-table__row ${className}`.trim()}>
      {children}
    </tr>
  );
}

export function TableHeaderCell({ className = "", children, align = "left", ...props }: ThHTMLAttributes<HTMLTableCellElement> & { className?: string; children: ReactNode; align?: Align }) {
  const cls = `ledger-table__cell ledger-table__header ${className || ""}`.trim();
  return (
    <th {...props} className={cls} scope={props.scope ?? "col"} style={{ textAlign: align, ...(props.style || {}) }}>
      {children}
    </th>
  );
}

export function TableCell({ className = "", children, align = "left", ...props }: CellProps) {
  const cls = `ledger-table__cell ${className}`.trim();
  return (
    <td {...props} className={cls} style={{ textAlign: align, ...(props.style || {}) }}>
      {children}
    </td>
  );
}

export default Table;
