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
export const MultipleOrganisations: Story = {
  render: () => <Example options={standard} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: /Switch organisation/ });
    await userEvent.click(trigger);
    const menu = await body.findByRole("menu");
    const selectedItem = within(menu).getByRole("menuitemradio", { checked: true });
    const nextItem = within(menu).getByRole("menuitemradio", { name: "Cedar & Field Services" });
    await waitFor(() => expect(menu).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(selectedItem).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(nextItem).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(trigger).toHaveTextContent("Cedar & Field Services"));
  },
};
export const LongOrganisationNames: Story = { render: () => <Example options={[{ id: "long", name: "The International Organisation for Complex Enterprise Operations" }, ...standard]} /> };
