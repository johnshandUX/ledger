import type { InputHTMLAttributes } from "react";
import "./Radio.css";

type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  hint?: string;
  error?: string;
};

export function Radio({
  label,
  hint,
  error,
  id,
  className = "",
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: RadioProps) {
  const radioId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  const hintId = hint ? `${radioId}-hint` : undefined;
  const errorId = error ? `${radioId}-error` : undefined;

  const describedBy =
    [hintId, errorId, ariaDescribedBy].filter(Boolean).join(" ") || undefined;

  const invalid = error ? true : ariaInvalid;

  return (
    <div className="ledger-radio-field">
      <label className="ledger-radio-label" htmlFor={radioId}>
        <input
          id={radioId}
          type="radio"
          className={`ledger-radio ${error ? "ledger-radio--error" : ""} ${className}`.trim()}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          {...props}
        />
        <span>{label}</span>
      </label>

      {hint && (
        <div className="ledger-radio-hint" id={hintId}>
          {hint}
        </div>
      )}

      {error && (
        <div className="ledger-radio-error" id={errorId}>
          {error}
        </div>
      )}
    </div>
  );
}
