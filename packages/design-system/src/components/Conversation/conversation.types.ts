import type { ReactNode } from "react";

export type ConversationRole = "user" | "assistant" | "system";
export type ConversationStatus = "idle" | "processing" | "clarification-required" | "ready-for-action" | "error";

export type ConversationMessage<Metadata = unknown> = Readonly<{
  id: string;
  role: ConversationRole;
  content: string;
  createdAt: string;
  metadata?: Metadata;
}>;

export type ClarificationChoice = Readonly<{ id: string; label: string; description?: string }>;
export type ConversationClarification = Readonly<{
  id: string;
  turnId: string;
  message: string;
  choices: readonly ClarificationChoice[];
  allowFreeText?: boolean;
  selectedChoiceId?: string;
  freeText?: string;
}>;

export type StructuredConversationAction = Readonly<{ type: string }>;
export type ConversationOutcome<Action extends StructuredConversationAction = StructuredConversationAction> =
  | Readonly<{ kind: "action"; action: Action; message?: string }>
  | Readonly<{ kind: "clarification"; clarification: ConversationClarification }>
  | Readonly<{ kind: "unsupported"; message: string }>
  | Readonly<{ kind: "error"; message: string; recoverable: boolean }>;

export type ConversationInterpretRequest = Readonly<{ id: string; content: string; createdAt: string }>;
export type ConversationInterpretContext<Context> = Readonly<{
  context: Context;
  messages: readonly ConversationMessage[];
  signal: AbortSignal;
  requestId: number;
}>;
export interface ConversationInterpreter<Context, Action extends StructuredConversationAction> {
  interpret(request: ConversationInterpretRequest, context: ConversationInterpretContext<Context>): Promise<ConversationOutcome<Action>>;
}

export type ConversationState<Action extends StructuredConversationAction = StructuredConversationAction> = Readonly<{
  messages: readonly ConversationMessage[];
  status: ConversationStatus;
  clarification?: ConversationClarification;
  outcome?: ConversationOutcome<Action>;
  error?: string;
  activeRequestId?: number;
}>;

export type ConversationActionRenderer<Action extends StructuredConversationAction> = (action: Action) => ReactNode;
