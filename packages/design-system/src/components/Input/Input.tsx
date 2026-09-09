import type { InputHTMLAttributes } from "react";
import "./Input.css";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function Input({
  label,
  hint,
  error,
  id,
  className = "",
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  const describedBy =
    [hintId, errorId, ariaDescribedBy].filter(Boolean).join(" ") || undefined;

  const invalid = error ? true : ariaInvalid;

  return (
    <div className="ledger-input-field">
      <label className="ledger-input-label" htmlFor={inputId}>
        {label}
      </label>

      {hint && (
        <div className="ledger-input-hint" id={hintId}>
          {hint}
        </div>
      )}

      <input
        id={inputId}
        className={`ledger-input ${error ? "ledger-input--error" : ""} ${className}`.trim()}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        {...props}
      />

      {error && (
        <div className="ledger-input-error" id={errorId}>
          {error}
        </div>
      )}
    </div>
  );
}