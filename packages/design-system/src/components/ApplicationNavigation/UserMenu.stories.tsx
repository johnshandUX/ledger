import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { UserMenu, UserMenuItem } from "./ApplicationNavigation";
const portrait = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23656b75'/%3E%3Ccircle cx='48' cy='36' r='18' fill='%23f4f5f6'/%3E%3Cpath d='M16 96c3-24 16-36 32-36s29 12 32 36' fill='%23f4f5f6'/%3E%3C/svg%3E";
function Example(props: { displayName: string; secondaryText: string; avatarSrc?: string }) { return <div style={{ width: 248 }}><UserMenu {...props}><UserMenuItem>Personal preferences</UserMenuItem><UserMenuItem intent="destructive">Sign out</UserMenuItem></UserMenu></div>; }
const meta = { title: "Patterns/Application Navigation/UserMenu", component: UserMenu, args: { displayName: "John Shand", children: null }, parameters: { layout: "centered" }, tags: ["autodocs"] } satisfies Meta<typeof UserMenu>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ImageAvatar: Story = { render: () => <Example displayName="Ada Lovelace" secondaryText="Administrator" avatarSrc={portrait} /> };
export const InitialsFallback: Story = { render: () => <Example displayName="John Shand" secondaryText="Administrator" />, play: async ({ canvasElement }) => { const body = within(canvasElement.ownerDocument.body); expect(body.getByText("JS")).toBeVisible(); const trigger = body.getByRole("button", { name: /Open user menu/ }); await userEvent.click(trigger); await waitFor(() => expect(body.getByRole("menu")).toBeVisible()); await userEvent.keyboard("{Escape}"); await waitFor(() => expect(trigger).toHaveFocus()); } };
export const LongDisplayNameAndRole: Story = { render: () => <Example displayName="Alexandria Montgomery-Worthington" secondaryText="Senior application administrator for international operations" /> };
