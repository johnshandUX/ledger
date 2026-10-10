import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { OrganisationSwitcher, type OrganisationOption } from "./ApplicationNavigation";

function Example({ options }: { options: readonly OrganisationOption[] }) { const [selectedId, setSelectedId] = useState(options[0].id); return <div style={{ width: 248 }}><OrganisationSwitcher organisations={options} selectedId={selectedId} onSelectedIdChange={setSelectedId} /></div>; }
const standard = [{ id: "one", name: "Northstar Ltd" }, { id: "two", name: "Cedar & Field Services" }];
const meta = { title: "Patterns/Application Navigation/OrganisationSwitcher", component: OrganisationSwitcher, args: { organisations: standard, selectedId: "one" }, parameters: { layout: "centered" }, tags: ["autodocs"] } satisfies Meta<typeof OrganisationSwitcher>;
export default meta;
type Story = StoryObj<typeof meta>;
export const OneOrganisation: Story = { render: () => <Example options={standard.slice(0, 1)} /> };
export const MultipleOrganisations: Story = { render: () => <Example options={standard} />, play: async ({ canvasElement }) => { const body = within(canvasElement.ownerDocument.body); const trigger = body.getByRole("button", { name: /Switch organisation/ }); await userEvent.click(trigger); await waitFor(() => expect(body.getByRole("menu")).toBeVisible()); await userEvent.keyboard("{ArrowDown}{Enter}"); await waitFor(() => expect(trigger).toHaveTextContent("Cedar & Field Services")); } };
export const LongOrganisationNames: Story = { render: () => <Example options={[{ id: "long", name: "The International Organisation for Complex Enterprise Operations" }, ...standard]} /> };
