"use client";

import { useActionState, useState, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import { Button, Input, Textarea } from "@johnshandux/ledger-design-system";
import { getJournalActionAvailability, initialJournalActionState, type JournalActionState } from "../action-state";

type Values = { title: string; summary: string; tags: string; body: string };
type Props = { action: (state: JournalActionState, formData: FormData) => Promise<JournalActionState>; initialValues?: Values; journalNumber: string; mode: "new" | "draft" };

export function JournalEntryForm({ action, initialValues = { title: "", summary: "", tags: "", body: "" }, journalNumber, mode }: Props) {
  const [state, formAction, pending] = useActionState(action, initialJournalActionState);
  const [values, setValues] = useState(initialValues);
  const [preview, setPreview] = useState(false);
  const [pendingIntent, setPendingIntent] = useState<"draft" | "published" | null>(null);
  const { saveDisabled, publishDisabled } = getJournalActionAvailability(mode, state, pending);
  const fieldError = (field: string) => state.status === "error" && state.field === field ? state.message : undefined;
  const captureIntent = (event: FormEvent<HTMLFormElement>) => {
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    setPendingIntent(submitter?.value === "published" ? "published" : "draft");
  };

  return <div className="journal-admin-editor">
    <div className="journal-admin-editor__bar"><div><span>Journal {journalNumber}</span><strong>{mode === "new" ? "New entry" : "Draft entry"}</strong></div><div className="journal-admin-view-toggle" role="group" aria-label="Editor view"><Button type="button" variant={!preview ? "primary" : "secondary"} onClick={() => setPreview(false)}>Write</Button><Button type="button" variant={preview ? "primary" : "secondary"} onClick={() => setPreview(true)}>Preview</Button></div></div>

    {preview ? <section className="journal-admin-preview" aria-label="Entry preview"><p className="journal-article-number">Journal {journalNumber}</p><h1>{values.title || "Untitled entry"}</h1>{values.summary && <p className="journal-article-summary">{values.summary}</p>}<ul className="journal-admin-preview__tags">{values.tags.split(/[,\n]/).map((tag) => tag.trim()).filter(Boolean).map((tag) => <li key={tag}>{tag}</li>)}</ul><div className="journal-prose"><ReactMarkdown>{values.body || "Nothing to preview yet."}</ReactMarkdown></div></section> :
      <form action={formAction} className="journal-admin-form" onSubmit={captureIntent}>
        <Input label="Title" name="title" required maxLength={160} value={values.title} error={fieldError("title")} onChange={(event) => setValues({ ...values, title: event.target.value })} />
        <Textarea label="Summary" name="summary" required maxLength={320} rows={3} hint="Used on the Journal index and in page metadata." value={values.summary} error={fieldError("summary")} onChange={(event) => setValues({ ...values, summary: event.target.value })} />
        <Input label="Tags" name="tags" required value={values.tags} error={fieldError("tags")} hint="Separate tags with commas." onChange={(event) => setValues({ ...values, tags: event.target.value })} />
        <Textarea label="Body" name="body" required maxLength={50000} rows={20} hint="Markdown and plain text are supported." value={values.body} error={fieldError("body")} onChange={(event) => setValues({ ...values, body: event.target.value })} />
        {state.message && <div className={`journal-admin-message journal-admin-message--${state.status}`} role={state.status === "error" ? "alert" : "status"}><p>{state.message}</p>{state.commitUrl && <a className="text-link" href={state.commitUrl} target="_blank" rel="noreferrer">View commit <span className="sr-only">(opens in a new tab)</span></a>}</div>}
        <div className="journal-admin-actions"><Button type="submit" name="intent" value="draft" variant="secondary" disabled={saveDisabled}>{pending && pendingIntent === "draft" ? "Saving…" : "Save draft"}</Button><Button type="submit" name="intent" value="published" disabled={publishDisabled}>{pending && pendingIntent === "published" ? "Publishing…" : "Publish"}</Button></div>
      </form>}
  </div>;
}
