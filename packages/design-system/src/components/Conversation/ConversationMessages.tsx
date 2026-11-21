import type { ReactNode } from "react";
import type { ConversationMessage } from "./conversation.types";
import "./Conversation.css";

export function ConversationMessages({ messages, processing = false, processingLabel = "Processing request", renderStructuredContent, formatTimestamp }: Readonly<{ messages: readonly ConversationMessage[]; processing?: boolean; processingLabel?: string; renderStructuredContent?: (message: ConversationMessage) => ReactNode; formatTimestamp?: (createdAt: string) => ReactNode }>) {
  const visible = messages.filter((message) => message.role !== "system");
  return <ol className="ledger-conversation-messages" aria-label="Conversation messages" aria-live="polite" aria-relevant="additions">
    {visible.map((message) => <li key={message.id} className={`ledger-conversation-message ledger-conversation-message--${message.role}`}><p>{message.content}</p>{renderStructuredContent?.(message)}{formatTimestamp && <time dateTime={message.createdAt}>{formatTimestamp(message.createdAt)}</time>}</li>)}
    {processing && <li className="ledger-conversation-message ledger-conversation-message--processing">{processingLabel}</li>}
  </ol>;
}
