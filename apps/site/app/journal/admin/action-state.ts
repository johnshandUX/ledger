export type JournalActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  commitUrl?: string;
  field?: string;
  values?: { title: string; summary: string; tags: string; body: string };
};

export const initialJournalActionState: JournalActionState = { status: "idle" };
