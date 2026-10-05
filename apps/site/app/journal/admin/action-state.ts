export type JournalActionState = {
  status: "idle" | "error" | "success";
  intent?: "draft" | "published";
  message?: string;
  commitUrl?: string;
  field?: string;
  values?: { title: string; summary: string; tags: string; body: string };
};

export const initialJournalActionState: JournalActionState = { status: "idle" };

export function getJournalActionAvailability(mode: "new" | "draft", state: JournalActionState, pending: boolean) {
  const completed = state.status === "success";
  return {
    saveDisabled: pending || completed,
    publishDisabled: pending || (completed && (mode === "new" || state.intent === "published")),
  };
}
