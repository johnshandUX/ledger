"use client";

import { useState } from "react";
import { Button } from "@johnshandux/ledger-design-system";
import { examplePrompts, type ExampleId } from "@/content/site-content";
import { AccountPreview } from "../_components/AccountPreview";

function PaymentPreview() { return <div className="scenario-preview"><div className="scenario-preview__header"><span className="eyebrow">Payment review</span><span className="status-chip">Awaiting approval</span></div><h3>Review supplier payment</h3><dl><div><dt>From</dt><dd>Operating account · 20451298</dd></div><div><dt>To</dt><dd>Hawthorne Logistics Ltd</dd></div><div><dt>Amount</dt><dd>£24,860.00</dd></div><div><dt>Fee</dt><dd>£0.00</dd></div></dl><div className="scenario-actions"><Button variant="secondary">Back</Button><Button>Submit for approval</Button></div></div>; }
function ActivityPreview() { const rows = [["Hawthorne Logistics", "Supplier payment", "−£24,860.00"], ["Albion Retail Group", "Client receipt", "+£38,400.00"], ["Payroll", "Internal transfer", "−£84,720.18"]]; return <div className="scenario-preview"><div className="scenario-preview__header"><span className="eyebrow">Recent activity</span><span>3 transactions</span></div><h3>Operating account</h3><div className="activity-list">{rows.map(([name, type, amount]) => <div key={name}><span><strong>{name}</strong><small>{type}</small></span><strong>{amount}</strong></div>)}</div></div>; }

export function PlaygroundExamples() {
  const [selected, setSelected] = useState<ExampleId>("accounts");
  const current = examplePrompts.find((item) => item.id === selected)!;
  return <div className="playground-workspace"><section className="chat-panel" aria-labelledby="examples-title"><div className="example-mode"><span>Example mode</span><p>Choose a curated prompt to load its predefined preview. Live generation is planned.</p></div><h2 id="examples-title">Example prompts</h2><div className="prompt-list" role="list">{examplePrompts.map((example) => <button key={example.id} type="button" className={selected === example.id ? "is-selected" : ""} onClick={() => setSelected(example.id)} aria-pressed={selected === example.id}><span>{example.label}</span><small>{example.prompt}</small></button>)}</div><div className="selected-prompt" aria-live="polite"><span className="example-label">Selected prompt</span><p>{current.prompt}</p></div></section><section className="preview-panel" aria-label={`${current.label} predefined preview`}><div className="preview-panel__bar"><span>Preview</span><span>Example data</span></div><div className="preview-panel__canvas">{selected === "accounts" ? <AccountPreview /> : selected === "payments" ? <PaymentPreview /> : <ActivityPreview />}</div></section></div>;
}
