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
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: CheckboxProps) {
  const checkboxId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  const hintId = hint ? `${checkboxId}-hint` : undefined;
  const errorId = error ? `${checkboxId}-error` : undefined;

  const describedBy =
    [hintId, errorId, ariaDescribedBy].filter(Boolean).join(" ") || undefined;

  const invalid = error ? true : ariaInvalid;

  return (
    <div className="ledger-checkbox-field">
      <label className="ledger-checkbox-label" htmlFor={checkboxId}>
        <input
          id={checkboxId}
          type="checkbox"
          className={`ledger-checkbox ${error ? "ledger-checkbox--error" : ""} ${className}`.trim()}
          aria-invalid={invalid}
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
