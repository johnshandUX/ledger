"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { conversationReducer, createConversationState } from "./conversation.state";
import type { ConversationInterpreter, ConversationMessage, StructuredConversationAction } from "./conversation.types";

type UseConversationOptions<Context, Action extends StructuredConversationAction> = Readonly<{
  interpreter: ConversationInterpreter<Context, Action>;
  context: Context;
  createId?: () => string;
  now?: () => string;
}>;

export function useConversation<Context, Action extends StructuredConversationAction>({ interpreter, context, createId = () => crypto.randomUUID(), now = () => new Date().toISOString() }: UseConversationOptions<Context, Action>) {
  const [state, dispatch] = useReducer(conversationReducer<Action>, undefined, () => createConversationState<Action>());
  const requestSequence = useRef(0);
  const controller = useRef<AbortController | undefined>(undefined);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => () => controller.current?.abort(), []);

  const submit = useCallback(async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return false;
    controller.current?.abort();
    const abortController = new AbortController();
    controller.current = abortController;
    const requestId = ++requestSequence.current;
    const createdAt = now();
    const request = { id: createId(), content: trimmed, createdAt };
    const message: ConversationMessage = { ...request, role: "user" };
    dispatch({ type: "request-started", requestId, message });
    try {
      const outcome = await interpreter.interpret(request, { context, messages: [...stateRef.current.messages, message], signal: abortController.signal, requestId });
      if (abortController.signal.aborted) return false;
      const assistantMessage = outcome.kind === "action" && outcome.message
        ? { id: createId(), role: "assistant" as const, content: outcome.message, createdAt: now() }
        : outcome.kind === "unsupported" || outcome.kind === "error"
          ? { id: createId(), role: "assistant" as const, content: outcome.message, createdAt: now() }
          : undefined;
      dispatch({ type: "outcome-received", requestId, outcome, assistantMessage });
      return true;
    } catch (error) {
      if (abortController.signal.aborted) return false;
      dispatch({ type: "request-failed", requestId, message: "The request could not be interpreted. Please try again." });
      return false;
    }
  }, [context, createId, interpreter, now]);

  const reset = useCallback(() => { controller.current?.abort(); requestSequence.current += 1; dispatch({ type: "reset" }); }, []);
  const selectClarification = useCallback((choiceId?: string, freeText?: string) => dispatch({ type: "clarification-selected", choiceId, freeText }), []);
  return { state, submit, reset, selectClarification } as const;
}
