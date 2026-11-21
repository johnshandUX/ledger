import type { ConversationClarification, ConversationMessage, ConversationOutcome, ConversationState, StructuredConversationAction } from "./conversation.types";

export type ConversationStateAction<Action extends StructuredConversationAction> =
  | Readonly<{ type: "request-started"; requestId: number; message: ConversationMessage }>
  | Readonly<{ type: "outcome-received"; requestId: number; outcome: ConversationOutcome<Action>; assistantMessage?: ConversationMessage }>
  | Readonly<{ type: "request-failed"; requestId: number; message: string }>
  | Readonly<{ type: "clarification-selected"; choiceId?: string; freeText?: string }>
  | Readonly<{ type: "reset" }>;

export function createConversationState<Action extends StructuredConversationAction>(messages: readonly ConversationMessage[] = []): ConversationState<Action> {
  return { messages, status: "idle" };
}

function statusFor<Action extends StructuredConversationAction>(outcome: ConversationOutcome<Action>): ConversationState<Action>["status"] {
  if (outcome.kind === "clarification") return "clarification-required";
  if (outcome.kind === "action") return "ready-for-action";
  if (outcome.kind === "error") return "error";
  return "idle";
}

export function conversationReducer<Action extends StructuredConversationAction>(state: ConversationState<Action>, action: ConversationStateAction<Action>): ConversationState<Action> {
  if (action.type === "reset") return createConversationState<Action>();
  if (action.type === "request-started") return { messages: [...state.messages, action.message], status: "processing", activeRequestId: action.requestId, clarification: undefined, outcome: undefined, error: undefined };
  if (action.type === "clarification-selected") {
    if (!state.clarification) return state;
    const clarification: ConversationClarification = { ...state.clarification, selectedChoiceId: action.choiceId, freeText: action.freeText };
    return { ...state, clarification };
  }
  if (action.requestId !== state.activeRequestId) return state;
  if (action.type === "request-failed") return { ...state, status: "error", clarification: undefined, outcome: undefined, error: action.message, activeRequestId: undefined };
  return {
    ...state,
    messages: action.assistantMessage ? [...state.messages, action.assistantMessage] : state.messages,
    status: statusFor(action.outcome),
    clarification: action.outcome.kind === "clarification" ? action.outcome.clarification : undefined,
    outcome: action.outcome,
    error: action.outcome.kind === "error" ? action.outcome.message : undefined,
    activeRequestId: undefined,
  };
}
