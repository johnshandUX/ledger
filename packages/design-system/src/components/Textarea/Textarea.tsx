import type { TextareaHTMLAttributes } from "react";
import "./Textarea.css";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function Textarea({
  label,
  hint,
  error,
  id,
  className = "",
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: TextareaProps) {
  const textareaId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  const hintId = hint ? `${textareaId}-hint` : undefined;
  const errorId = error ? `${textareaId}-error` : undefined;

  const describedBy =
    [hintId, errorId, ariaDescribedBy].filter(Boolean).join(" ") || undefined;

  const invalid = error ? true : ariaInvalid;

  return (
    <div className="ledger-textarea-field">
      <label className="ledger-textarea-label" htmlFor={textareaId}>
        {label}
      </label>

      {hint && (
        <div className="ledger-textarea-hint" id={hintId}>
          {hint}
        </div>
      )}

      <textarea
        id={textareaId}
        className={`ledger-textarea ${error ? "ledger-textarea--error" : ""} ${className}`.trim()}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        {...props}
      />

      {error && (
        <div className="ledger-textarea-error" id={errorId}>
          {error}
        </div>
      )}
    </div>
  );
}
