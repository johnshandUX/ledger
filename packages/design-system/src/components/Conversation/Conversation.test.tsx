// @vitest-environment happy-dom
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConversationClarificationControls } from "./ConversationClarification";
import { ConversationInput } from "./ConversationInput";
import { ConversationMessages } from "./ConversationMessages";
import { conversationReducer, createConversationState } from "./conversation.state";
import { useConversation } from "./useConversation";
import type { ConversationInterpreter } from "./conversation.types";

let container: HTMLDivElement;
let root: Root;
beforeEach(() => { (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true; container = document.createElement("div"); document.body.append(container); root = createRoot(container); });
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });
const setTextarea = async (value: string) => { const textarea = container.querySelector("textarea")!; const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!; await act(async () => { setter.call(textarea, value); textarea.dispatchEvent(new Event("input", { bubbles: true })); }); };

describe("ConversationInput", () => {
  it("is controlled, ignores empty submission and selects suggestions", async () => {
    const submit = vi.fn();
    function Harness() { const [value, setValue] = useState(""); return <ConversationInput value={value} onChange={setValue} onSubmit={submit} label="Request" suggestions={["Recent activity"]} submitLabel="Submit" />; }
    await act(async () => root.render(<Harness />));
    expect(container.querySelector<HTMLButtonElement>('button[aria-label="Submit"]')!.disabled).toBe(true);
    await act(async () => container.querySelector<HTMLButtonElement>(".ledger-conversation-input__suggestions button")!.click());
    expect(container.querySelector<HTMLTextAreaElement>("textarea")!.value).toBe("Recent activity");
    await setTextarea("   ");
    container.querySelector<HTMLTextAreaElement>("textarea")!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(submit).not.toHaveBeenCalled();
  });

  it("submits Enter and preserves Shift+Enter for multiline input", async () => {
    const submit = vi.fn();
    function Harness() { const [value, setValue] = useState("Balances"); return <ConversationInput value={value} onChange={setValue} onSubmit={submit} label="Request" submitLabel="Submit" />; }
    await act(async () => root.render(<Harness />));
    await act(async () => container.querySelector("textarea")!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", shiftKey: true, bubbles: true, cancelable: true })));
    expect(submit).not.toHaveBeenCalled();
    await act(async () => container.querySelector("textarea")!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })));
    expect(submit).toHaveBeenCalledWith("Balances");
  });
});

describe("conversation presentation", () => {
  it("orders customer-facing messages and hides system messages", async () => {
    await act(async () => root.render(<ConversationMessages messages={[{ id: "system", role: "system", content: "private", createdAt: "2026-01-01T00:00:00Z" }, { id: "user", role: "user", content: "First", createdAt: "2026-01-01T00:00:01Z" }, { id: "assistant", role: "assistant", content: "Second", createdAt: "2026-01-01T00:00:02Z" }]} />));
    expect([...container.querySelectorAll("p")].map((node) => node.textContent)).toEqual(["First", "Second"]);
    expect(container.textContent).not.toContain("private");
  });

  it("selects and confirms one clarification choice", async () => {
    const change = vi.fn(); const confirm = vi.fn();
    const base = { id: "period", turnId: "turn", message: "Choose", choices: [{ id: "month", label: "Month" }] } as const;
    await act(async () => root.render(<ConversationClarificationControls clarification={base} onChange={change} onConfirm={confirm} onCancel={() => undefined} />));
    await act(async () => container.querySelector<HTMLInputElement>("input")!.click());
    await act(async () => root.render(<ConversationClarificationControls clarification={{ ...base, selectedChoiceId: "month" }} onChange={change} onConfirm={confirm} onCancel={() => undefined} />));
    await act(async () => [...container.querySelectorAll<HTMLButtonElement>("button")].find((button) => button.textContent === "Confirm")!.click());
    expect(change).toHaveBeenCalledWith("month"); expect(confirm).toHaveBeenCalledOnce();
  });
});

describe("conversation state", () => {
  type DomainAction = { type: "prepared"; value: number };
  const message = { id: "m1", role: "user" as const, content: "Request", createdAt: "2026-01-01T00:00:00Z" };
  it("transitions through processing, clarification and ready states", () => {
    let state = conversationReducer<DomainAction>(createConversationState(), { type: "request-started", requestId: 1, message });
    expect(state.status).toBe("processing");
    state = conversationReducer(state, { type: "outcome-received", requestId: 1, outcome: { kind: "clarification", clarification: { id: "c", turnId: "m1", message: "Choose", choices: [{ id: "one", label: "One" }] } } });
    expect(state.status).toBe("clarification-required");
    state = conversationReducer(state, { type: "clarification-selected", choiceId: "one" });
    expect(state.clarification?.selectedChoiceId).toBe("one");
    state = conversationReducer(state, { type: "request-started", requestId: 2, message: { ...message, id: "m2" } });
    expect(state).toMatchObject({ status: "processing", clarification: undefined, outcome: undefined, error: undefined });
    state = conversationReducer(state, { type: "outcome-received", requestId: 2, outcome: { kind: "action", action: { type: "prepared", value: 1 } } });
    expect(state.status).toBe("ready-for-action"); expect(state.outcome).toMatchObject({ kind: "action" });
  });
  it("represents recoverable errors, resets, and ignores stale responses", () => {
    let state = conversationReducer<DomainAction>(createConversationState(), { type: "request-started", requestId: 2, message });
    const stale = conversationReducer(state, { type: "outcome-received", requestId: 1, outcome: { kind: "action", action: { type: "prepared", value: 0 } } });
    expect(stale).toBe(state);
    state = conversationReducer(state, { type: "outcome-received", requestId: 2, outcome: { kind: "error", message: "Try again", recoverable: true } });
    expect(state).toMatchObject({ status: "error", error: "Try again" });
    state = conversationReducer(state, { type: "request-started", requestId: 3, message: { ...message, id: "m3" } });
    state = conversationReducer(state, { type: "request-failed", requestId: 3, message: "Network failure" });
    expect(state).toMatchObject({ status: "error", clarification: undefined, outcome: undefined, error: "Network failure" });
    expect(conversationReducer(state, { type: "reset" })).toEqual(createConversationState());
  });
});

describe("useConversation", () => {
  type DomainAction = { type: "prepared"; value: number };
  function Harness({ interpreter }: { interpreter: ConversationInterpreter<{ scope: string }, DomainAction> }) {
    const conversation = useConversation({ interpreter, context: { scope: "test" }, createId: (() => { let id = 0; return () => `id-${++id}`; })(), now: () => "2026-01-01T00:00:00.000Z" });
    return <><button id="first" onClick={() => void conversation.submit("First")}>First</button><button id="second" onClick={() => void conversation.submit("Second")}>Second</button><button id="reset" onClick={conversation.reset}>Reset</button><output>{JSON.stringify(conversation.state)}</output></>;
  }

  it("aborts superseded work and prevents stale completion from overwriting current state", async () => {
    const pending: Array<{ signal: AbortSignal; resolve: (value: { kind: "action"; action: DomainAction }) => void }> = [];
    const interpreter: ConversationInterpreter<{ scope: string }, DomainAction> = { interpret: (_request, context) => new Promise((resolve) => pending.push({ signal: context.signal, resolve })) };
    await act(async () => root.render(<Harness interpreter={interpreter} />));
    await act(async () => container.querySelector<HTMLButtonElement>("#first")!.click());
    await act(async () => container.querySelector<HTMLButtonElement>("#second")!.click());
    expect(pending[0].signal.aborted).toBe(true);
    await act(async () => pending[0].resolve({ kind: "action", action: { type: "prepared", value: 1 } }));
    expect(container.querySelector("output")!.textContent).not.toContain('"value":1');
    await act(async () => pending[1].resolve({ kind: "action", action: { type: "prepared", value: 2 } }));
    expect(container.querySelector("output")!.textContent).toContain('"value":2');
  });

  it("uses a safe error message and reset aborts active work", async () => {
    let signal: AbortSignal | undefined;
    const interpreter: ConversationInterpreter<{ scope: string }, DomainAction> = { interpret: async (_request, context) => { signal = context.signal; throw new Error("private provider detail"); } };
    await act(async () => root.render(<Harness interpreter={interpreter} />));
    await act(async () => container.querySelector<HTMLButtonElement>("#first")!.click());
    expect(container.querySelector("output")!.textContent).toContain("Please try again");
    expect(container.querySelector("output")!.textContent).not.toContain("private provider detail");
    const waiting: ConversationInterpreter<{ scope: string }, DomainAction> = { interpret: (_request, context) => { signal = context.signal; return new Promise(() => undefined); } };
    await act(async () => root.render(<Harness interpreter={waiting} />));
    await act(async () => container.querySelector<HTMLButtonElement>("#first")!.click());
    await act(async () => container.querySelector<HTMLButtonElement>("#reset")!.click());
    expect(signal?.aborted).toBe(true);
    expect(JSON.parse(container.querySelector("output")!.textContent || "{}")).toEqual({ messages: [], status: "idle" });
  });
});
