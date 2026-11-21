import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ConversationInput } from "./ConversationInput";
import { ConversationMessages } from "./ConversationMessages";
import { ConversationClarificationControls } from "./ConversationClarification";
import { ConversationAction } from "./ConversationAction";
import { Button } from "../Button/Button";

const meta = { title: "Patterns/Conversation", component: ConversationInput, parameters: { layout: "padded" } } satisfies Meta<typeof ConversationInput>;
export default meta;
type Story = StoryObj<typeof meta>;
const storyArgs = { value: "", onChange: () => undefined, label: "Request", submitLabel: "Submit request" };
export const Input: Story = { args: storyArgs, render: () => { const [value, setValue] = useState(""); return <ConversationInput value={value} onChange={setValue} onSubmit={() => undefined} label="Request" heading="What would you like to explore?" suggestions={["Show recent activity", "Compare account balances"]} submitLabel="Submit request" />; } };
export const Messages: Story = { args: storyArgs, render: () => <ConversationMessages messages={[{ id: "1", role: "user", content: "Compare account balances", createdAt: "2026-11-16T09:00:00.000Z" }, { id: "2", role: "assistant", content: "Which reporting period should I use?", createdAt: "2026-11-16T09:00:01.000Z" }]} /> };
export const Clarification: Story = { args: storyArgs, render: () => { const [selectedChoiceId, setSelectedChoiceId] = useState<string>(); const clarification = { id: "period", turnId: "1", message: "Choose a reporting period", choices: [{ id: "month", label: "Last month" }, { id: "quarter", label: "Last quarter" }], selectedChoiceId }; return <ConversationClarificationControls clarification={clarification} onChange={setSelectedChoiceId} onConfirm={() => undefined} onCancel={() => setSelectedChoiceId(undefined)} />; } };
export const Processing: Story = { args: storyArgs, render: () => <ConversationMessages processing messages={[{ id: "1", role: "user", content: "Compare account balances", createdAt: "2026-11-16T09:00:00.000Z" }]} /> };
export const ErrorResponse: Story = { args: storyArgs, render: () => <ConversationMessages messages={[{ id: "1", role: "assistant", content: "The request could not be interpreted. Please try again.", createdAt: "2026-11-16T09:00:00.000Z" }]} /> };
export const UnavailableInput: Story = { args: storyArgs, render: () => <ConversationInput value="Compare balances" onChange={() => undefined} label="Request" submitLabel="Submit request" submitUnavailable unavailableTitle="Available in a future phase" /> };
export const StructuredAction: Story = { args: storyArgs, render: () => <ConversationAction title="Configuration prepared" actions={<Button type="button">Review configuration</Button>}><p>A domain-owned summary can be rendered here.</p></ConversationAction> };
