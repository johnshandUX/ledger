import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { DataTable } from "./DataTable";
import type { DataTableColumn, DataTableState } from "./DataTable.types";

type Account = {
  id: string;
  name: string;
  type: string;
  accountNumber: string;
  available: number;
};

const accounts: readonly Account[] = Array.from({ length: 23 }, (_, index) => ({
  id: `account-${index + 1}`,
  name: index === 0 ? "Operating account" : `Account ${String(index + 1).padStart(2, "0")}`,
  type: index % 2 === 0 ? "Current" : "Reserve",
  accountNumber: String(12345678 + index),
  available: 250000 - index * 7250,
}));

const columns: readonly DataTableColumn<Account>[] = [
  { id: "name", label: "Account", header: "Account", cell: ({ row }) => row.name, sort: { value: row => row.name } },
  { id: "number", label: "Account number", header: "Account number", cell: ({ row }) => row.accountNumber, nowrap: true },
  { id: "type", label: "Account type", header: "Type", cell: ({ row }) => row.type },
  { id: "available", label: "Available balance", header: "Available", cell: ({ row }) => `£${row.available.toLocaleString("en-GB")}`, align: "right", headerAlign: "right", numeric: true, sort: { value: row => row.available, initialDirection: "descending" } },
];

const meta = {
  title: "Components/DataTable",
  component: DataTable<Account>,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof DataTable<Account>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Foundation: Story = {
  args: { caption: "Accounts", rows: accounts, columns, getRowId: row => row.id },
  render: args => <DataTable {...args} pageSizeOptions={[10, 20, 50]} />,
};

export const PaginationInteraction: Story = {
  args: { caption: "Interactive accounts", rows: accounts, columns, getRowId: row => row.id },
  render: args => <DataTable {...args} pageSizeOptions={[10, 20, 50]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sort = canvas.getByRole("button", { name: "Sort by Available balance" });
    await userEvent.click(sort);
    expect(sort).toHaveAccessibleName("Sort by Available balance, currently descending");
    expect(canvas.getByText("1–10 of 23")).toBeVisible();
    expect(canvas.queryByRole("button", { name: "Previous page" })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: /Showing 1–10 of 23 results. Change rows per page/ }));
    const body = within(canvasElement.ownerDocument.body);
    expect(await body.findByRole("menuitemradio", { name: "Show 10 results per page" })).toHaveAttribute("aria-checked", "true");
    await userEvent.click(body.getByRole("menuitemradio", { name: "Show 20 results per page" }));
    expect(canvas.getByText("1–20 of 23")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Next page" }));
    expect(canvas.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
    await userEvent.click(sort);
    expect(sort).toHaveAccessibleName("Sort by Available balance, currently ascending");
  },
};

export const CompactZebra: Story = {
  args: { caption: "Compact accounts", rows: accounts.slice(0, 8), columns, getRowId: row => row.id, density: "compact", rowTreatment: "zebra" },
};

export const WideOverflow: Story = {
  args: {
    caption: "Wide account dataset",
    rows: accounts.slice(0, 6),
    getRowId: row => row.id,
    columns: [...columns, ...columns.map(column => ({ ...column, id: `secondary-${column.id}`, label: `Secondary ${column.label}`, header: `Secondary ${column.label}` }))],
  },
  decorators: [Story => <div style={{ maxWidth: 560 }}><Story /></div>],
};

export const Loading: Story = {
  args: { caption: "Accounts", rows: [], columns, getRowId: row => row.id, status: "loading", loadingLabel: "Loading accounts" },
};

export const Empty: Story = {
  args: { caption: "Accounts", rows: [], columns, getRowId: row => row.id, emptyState: { title: "No accounts to display", description: "Accounts will appear here when available." } },
};

export const NoResults: Story = {
  args: {
    caption: "Accounts",
    rows: [],
    columns,
    getRowId: row => row.id,
    status: "no-results",
    noResultsState: { title: "No matching accounts", description: "No-results presentation is ready for the later search and filter slice." },
  },
};

export const ErrorState: Story = {
  args: { caption: "Accounts", rows: [], columns, getRowId: row => row.id, status: "error", errorState: { title: "Accounts could not be loaded", description: "Try again later." } },
};

export const Controlled: Story = {
  args: { caption: "Controlled accounts", rows: accounts, columns, getRowId: row => row.id, state: { query: "", filters: {}, pageIndex: 0, pageSize: 10 }, onStateChange: () => undefined },
  render: function ControlledStory() {
    const [state, setState] = useState<DataTableState>({ query: "", filters: {}, pageIndex: 0, pageSize: 10 });
    return <DataTable caption="Controlled accounts" rows={accounts} columns={columns} getRowId={row => row.id} state={state} onStateChange={setState} />;
  },
};
