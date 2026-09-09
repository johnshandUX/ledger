import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import "./FormField.css";

type FormFieldProps = {
  id?: string;
  label: string;
  helperText?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

type ChildControlProps = {
  id?: string;
  label?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "grammar" | "spelling";
};

export function FormField({
  id,
  label,
  helperText,
  required = false,
  error,
  disabled = false,
  className = "",
  children,
}: FormFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  const child = isValidElement<ChildControlProps>(children)
    ? cloneElement(children as ReactElement<ChildControlProps>, {
        id: children.props.id ?? fieldId,
        label: children.props.label ?? label,
        hint: children.props.hint ?? helperText,
        error: children.props.error ?? error,
        disabled: children.props.disabled ?? disabled,
        required: children.props.required ?? required,
        "aria-describedby":
          [children.props["aria-describedby"], helperText ? `${fieldId}-helper` : undefined, error ? `${fieldId}-error` : undefined]
            .filter(Boolean)
            .join(" ") || undefined,
        "aria-invalid": error ? true : children.props["aria-invalid"],
      })
    : children;

  return <div className={`ledger-form-field ${className}`.trim()}>{child}</div>;
}
