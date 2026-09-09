import type { InputHTMLAttributes } from "react";
import "./Checkbox.css";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  hint?: string;
  error?: string;
};

export function Checkbox({
  label,
  hint,
  error,
  id,
  className = "",
  ...props
}: CheckboxProps) {
  const checkboxId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  const hintId = hint ? `${checkboxId}-hint` : undefined;
  const errorId = error ? `${checkboxId}-error` : undefined;

  const describedBy =
    [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="ledger-checkbox-field">
      <label className="ledger-checkbox-label" htmlFor={checkboxId}>
        <input
          id={checkboxId}
          type="checkbox"
          className={`ledger-checkbox ${error ? "ledger-checkbox--error" : ""} ${className}`.trim()}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...props}
        />
        <span>{label}</span>
      </label>

      {hint && (
        <div className="ledger-checkbox-hint" id={hintId}>
          {hint}
        </div>
      )}

      {error && (
        <div className="ledger-checkbox-error" id={errorId}>
          {error}
        </div>
      )}
    </div>
  );
}
