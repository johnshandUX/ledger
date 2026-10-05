import { JournalValidationError, type JournalEntryStatus } from "../../../lib/journal";

export function parseJournalActionIntent(value: FormDataEntryValue | null): JournalEntryStatus {
  if (value === "draft" || value === "published") return value;
  throw new JournalValidationError("Choose Save draft or Publish before continuing.");
}
