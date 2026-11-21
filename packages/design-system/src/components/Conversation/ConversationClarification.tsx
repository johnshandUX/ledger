"use client";

import { Button } from "../Button/Button";
import { Radio } from "../Radio/Radio";
import type { ConversationClarification } from "./conversation.types";
import "./Conversation.css";

export function ConversationClarificationControls({ clarification, onChange, onConfirm, onCancel, disabled = false }: Readonly<{ clarification: ConversationClarification; onChange: (choiceId: string) => void; onConfirm: () => void; onCancel: () => void; disabled?: boolean }>) {
  return <fieldset className="ledger-conversation-clarification" disabled={disabled}><legend>{clarification.message}</legend><div>{clarification.choices.map((choice) => <Radio key={choice.id} id={`${clarification.id}-${choice.id}`} name={clarification.id} label={choice.label} hint={choice.description} checked={clarification.selectedChoiceId === choice.id} onChange={() => onChange(choice.id)} />)}</div><div className="ledger-conversation-clarification__actions"><Button type="button" onClick={onConfirm} disabled={!clarification.selectedChoiceId}>Confirm</Button><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button></div></fieldset>;
}
