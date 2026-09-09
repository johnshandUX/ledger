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
  ...props
}: RadioProps) {
  const radioId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  const hintId = hint ? `${radioId}-hint` : undefined;
  const errorId = error ? `${radioId}-error` : undefined;

  const describedBy =
    [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="ledger-radio-field">
      <label className="ledger-radio-label" htmlFor={radioId}>
        <input
          id={radioId}
          type="radio"
          className={`ledger-radio ${error ? "ledger-radio--error" : ""} ${className}`.trim()}
          aria-invalid={error ? true : undefined}
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
