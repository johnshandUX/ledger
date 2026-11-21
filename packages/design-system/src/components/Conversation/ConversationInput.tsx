"use client";

import { useId, type KeyboardEvent, type ReactNode } from "react";
import { Button } from "../Button/Button";
import { Textarea } from "../Textarea/Textarea";
import "./Conversation.css";

export type ConversationInputProps = Readonly<{
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  label: string;
  heading?: ReactNode;
  headingLevel?: 2 | 3;
  headingIcon?: ReactNode;
  suggestions?: readonly string[];
  suggestionsLabel?: string;
  submitLabel: string;
  submitContent?: ReactNode;
  disabled?: boolean;
  processing?: boolean;
  submitUnavailable?: boolean;
  unavailableTitle?: string;
  className?: string;
}>;

export function ConversationInput({ value, onChange, onSubmit, label, heading, headingLevel = 2, headingIcon, suggestions = [], suggestionsLabel = "Try:", submitLabel, submitContent = "Submit", disabled = false, processing = false, submitUnavailable = false, unavailableTitle, className = "" }: ConversationInputProps) {
  const headingId = useId();
  const Heading = `h${headingLevel}` as "h2" | "h3";
  const canSubmit = Boolean(value.trim()) && !disabled && !processing && !submitUnavailable && Boolean(onSubmit);
  const submit = () => { if (canSubmit) onSubmit?.(value.trim()); };
  const keyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); submit(); }
  };
  return <section className={`ledger-conversation-input ${className}`.trim()} aria-busy={processing || undefined} aria-labelledby={heading ? headingId : undefined} aria-label={heading ? undefined : label}>
    {heading && <div className="ledger-conversation-input__heading">{headingIcon && <span className="ledger-conversation-input__icon" aria-hidden="true">{headingIcon}</span>}<Heading id={headingId}>{heading}</Heading></div>}
    <div className="ledger-conversation-input__field">
      <Textarea label={label} value={value} onChange={(event) => onChange(event.currentTarget.value)} onKeyDown={keyDown} rows={2} disabled={disabled || processing} />
      <Button className="ledger-conversation-input__submit" type="button" onClick={submit} disabled={!canSubmit} aria-label={submitLabel} title={submitUnavailable ? unavailableTitle : undefined}>{submitContent}</Button>
    </div>
    {suggestions.length > 0 && <div className="ledger-conversation-input__suggestions" aria-label="Suggested prompts"><span>{suggestionsLabel}</span>{suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => onChange(suggestion)} disabled={disabled || processing}>{suggestion}</button>)}</div>}
  </section>;
}
