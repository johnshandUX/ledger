"use server";

import { assertJournalAdmin } from "../../../lib/journal-auth";
import { createGitHubJournalEntry, JournalConflictError, JournalConfigurationError, JournalGitHubError, updateGitHubJournalDraft } from "../../../lib/journal-github";
import { JournalValidationError, type JournalAuthorInput } from "../../../lib/journal";
import type { JournalActionState } from "./action-state";
import { parseJournalActionIntent } from "./action-contract";

function formValues(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    tags: String(formData.get("tags") ?? ""),
    body: String(formData.get("body") ?? ""),
  };
}

function authorInput(values: ReturnType<typeof formValues>): JournalAuthorInput {
  return { title: values.title, summary: values.summary, body: values.body, tags: values.tags.split(/[,\n]/) };
}

function failure(error: unknown, values: ReturnType<typeof formValues>): JournalActionState {
  if (error instanceof JournalValidationError) return { status: "error", message: error.message, field: error.field, values };
  if (error instanceof JournalConflictError) return { status: "error", message: error.message, values };
  if (error instanceof JournalConfigurationError) return { status: "error", message: "Journal publishing is not configured yet.", values };
  if (error instanceof JournalGitHubError) return { status: "error", message: error.message, values };
  return { status: "error", message: "The Journal entry could not be saved.", values };
}

export async function createJournalEntryAction(_state: JournalActionState, formData: FormData): Promise<JournalActionState> {
  const values = formValues(formData);
  try {
    await assertJournalAdmin();
    const actionIntent = parseJournalActionIntent(formData.get("intent"));
    const result = await createGitHubJournalEntry(authorInput(values), actionIntent);
    return { status: "success", intent: actionIntent, message: "Commit created — deployment pending", commitUrl: result.url, values };
  } catch (error) { return failure(error, values); }
}

export async function updateJournalDraftAction(originalSlug: string, _state: JournalActionState, formData: FormData): Promise<JournalActionState> {
  const values = formValues(formData);
  try {
    await assertJournalAdmin();
    const actionIntent = parseJournalActionIntent(formData.get("intent"));
    const result = await updateGitHubJournalDraft(originalSlug, authorInput(values), actionIntent);
    return { status: "success", intent: actionIntent, message: "Commit created — deployment pending", commitUrl: result.url, values };
  } catch (error) { return failure(error, values); }
}
