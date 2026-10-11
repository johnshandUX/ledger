import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { DataTable } from "./DataTable";
import type { DataTableColumn, DataTableFilterDefinition, DataTableState, DataTableStateChangeReason } from "./DataTable.types";

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

type AccountFilterId = "type" | "currency";
const filters: readonly DataTableFilterDefinition<Account, AccountFilterId>[] = [
  {
    id: "type",
    label: "Account type",
    options: [{ value: "Current", label: "Current" }, { value: "Reserve", label: "Reserve" }],
    values: account => account.type,
  },
  {
    id: "currency",
    label: "Currency",
    options: [{ value: "GBP", label: "GBP" }, { value: "EUR", label: "EUR" }],
    values: account => account.id === "account-23" ? "EUR" : "GBP",
  },
];
const search = {
  label: "Search accounts",
  placeholder: "Search by name or account number",
  values: (account: Account) => [account.name, account.accountNumber],
};

const meta = {
  title: "Components/DataTable",
  component: DataTable<Account>,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof DataTable<Account>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Foundation: Story = {
  args: { caption: "Accounts", rows: accounts, columns, getRowId: row => row.id, itemLabel: { singular: "account", plural: "accounts" } },
  render: args => <DataTable {...args} pageSizeOptions={[10, 20, 50]} />,
};

export const PaginationInteraction: Story = {
  args: { caption: "Interactive accounts", rows: accounts, columns, getRowId: row => row.id, itemLabel: { singular: "account", plural: "accounts" } },
  render: args => <DataTable {...args} pageSizeOptions={[10, 20, 50]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sort = canvas.getByRole("button", { name: "Sort by Available balance" });
    await userEvent.click(sort);
    expect(sort).toHaveAccessibleName("Sort by Available balance, currently descending");
    expect(canvas.getByText("1–10 of 23 accounts")).toBeVisible();
    expect(canvas.queryByRole("button", { name: "Previous page" })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: /Showing 1–10 of 23 accounts. Change rows per page/ }));
    const body = within(canvasElement.ownerDocument.body);
    expect(await body.findByRole("menuitemradio", { name: "Show 10 results per page" })).toHaveAttribute("aria-checked", "true");
    await userEvent.click(body.getByRole("menuitemradio", { name: "Show 20 results per page" }));
    expect(canvas.getByText("1–20 of 23 accounts")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Next page" }));
    expect(canvas.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
    await userEvent.click(sort);
    expect(sort).toHaveAccessibleName("Sort by Available balance, currently ascending");
  },
};

export const CompactZebra: Story = {
  args: { caption: "Compact accounts", rows: accounts.slice(0, 8), columns, getRowId: row => row.id, density: "compact", rowTreatment: "zebra" },
};

export const SearchOnly: Story = {
  args: { caption: "Searchable accounts", rows: accounts, columns, getRowId: row => row.id, search, itemLabel: { singular: "account", plural: "accounts" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search accounts" }), "Operating");
    expect(canvas.getByText("1 matching account from 23 total")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Clear all" }));
    expect(canvas.getByText("1–10 of 23 accounts")).toBeVisible();
  },
};

export const FiltersOnly: Story = {
  args: { caption: "Filterable accounts", rows: accounts, columns, getRowId: row => row.id, filters, itemLabel: { singular: "account", plural: "accounts" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Account type" }));
    await userEvent.click(await body.findByRole("checkbox", { name: "Current" }));
    expect(canvas.getByText("1–10 of 12 matching accounts from 23 total")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await userEvent.click(canvas.getByRole("button", { name: "Clear all" }));
    expect(canvas.getByText("1–10 of 23 accounts")).toBeVisible();
  },
};

export const CombinedSearchAndFilters: Story = {
  args: { caption: "Account directory", rows: accounts, columns, getRowId: row => row.id, search, filters, itemLabel: { singular: "account", plural: "accounts" } },
};

export const MultipleSelectedOptions: Story = {
  args: {
    caption: "Accounts with multiple filters",
    rows: accounts,
    columns,
    getRowId: row => row.id,
    filters,
    defaultState: { filters: { type: ["Current", "Reserve"] } },
    itemLabel: { singular: "account", plural: "accounts" },
  },
};

export const NoMatchingResults: Story = {
  args: {
    caption: "Accounts with no match",
    rows: accounts,
    columns,
    getRowId: row => row.id,
    search,
    filters,
    defaultState: { query: "No such account" },
    itemLabel: { singular: "account", plural: "accounts" },
    noResultsState: { title: "No matching accounts", description: "Try changing your search or filters." },
  },
};

export const EmptyWithToolbar: Story = {
  args: {
    caption: "Empty account directory",
    rows: [],
    columns,
    getRowId: row => row.id,
    search,
    filters,
    emptyState: { title: "No accounts to display", description: "The controls remain available for a consistent directory layout." },
  },
};

export const NarrowToolbar: Story = {
  args: { caption: "Narrow account directory", rows: accounts, columns, getRowId: row => row.id, search, filters },
  decorators: [Story => <div style={{ maxWidth: 360 }}><Story /></div>],
};

export const MultipleTableInstances: Story = {
  args: { caption: "Multiple account tables", rows: accounts, columns, getRowId: row => row.id, filters },
  render: () => <><DataTable caption="Primary accounts" rows={accounts.slice(0, 4)} columns={columns} getRowId={row => row.id} filters={filters} /><DataTable caption="Secondary accounts" rows={accounts.slice(4, 8)} columns={columns} getRowId={row => row.id} filters={filters} /></>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const triggers = canvas.getAllByRole("button", { name: "Account type" });
    await userEvent.click(triggers[0]!);
    const firstContentId = triggers[0]!.getAttribute("aria-controls");
    expect(firstContentId).toBeTruthy();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(triggers[0]).toHaveFocus());
    await userEvent.click(triggers[1]!);
    const secondContentId = triggers[1]!.getAttribute("aria-controls");
    expect(secondContentId).toBeTruthy();
    expect(secondContentId).not.toBe(firstContentId);
  },
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
  args: { caption: "Controlled accounts", rows: accounts, columns, getRowId: row => row.id, search, filters, state: { query: "", filters: {}, pageIndex: 0, pageSize: 10 }, onStateChange: () => undefined },
  render: function ControlledStory() {
    const [state, setState] = useState<DataTableState<AccountFilterId>>({ query: "", filters: {}, pageIndex: 1, pageSize: 10 });
    const [reason, setReason] = useState<DataTableStateChangeReason | "none">("none");
    return <><DataTable caption="Controlled accounts" rows={accounts} columns={columns} getRowId={row => row.id} search={search} filters={filters} itemLabel={{ singular: "account", plural: "accounts" }} state={state} onStateChange={(nextState, meta) => { setState(nextState); setReason(meta.reason); }} /><output aria-label="Last state change">{reason}; page {state.pageIndex + 1}</output></>;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const searchbox = canvas.getByRole("searchbox", { name: "Search accounts" });
    await userEvent.type(searchbox, "Account 02");
    expect(canvas.getByLabelText("Last state change")).toHaveTextContent("query; page 1");
    await userEvent.clear(searchbox);
    await userEvent.click(canvas.getByRole("button", { name: "Account type" }));
    await userEvent.click(await body.findByRole("checkbox", { name: "Current" }));
    await userEvent.click(body.getByRole("checkbox", { name: "Reserve" }));
    expect(canvas.getByRole("button", { name: "Account type (2)" })).toBeVisible();
    expect(canvas.getByLabelText("Last state change")).toHaveTextContent("filter; page 1");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.getByRole("button", { name: "Account type (2)" })).toHaveFocus());
    await userEvent.click(canvas.getByRole("button", { name: "Clear all" }));
    expect(canvas.getByLabelText("Last state change")).toHaveTextContent("clear-filters; page 1");
    expect(searchbox).toHaveValue("");
    expect(canvas.getByRole("button", { name: "Account type" })).toBeVisible();
  },
};

export const ControlledNormalization: Story = {
  args: { caption: "Normalized accounts", rows: accounts, columns, getRowId: row => row.id, filters, state: { query: "", filters: {}, pageIndex: 0, pageSize: 10 }, onStateChange: () => undefined },
  render: function ControlledNormalizationStory() {
    const [state, setState] = useState<DataTableState<AccountFilterId>>({
      query: "",
      filters: { type: ["Current", "Current", "unknown"], legacy: ["value"] } as DataTableState<AccountFilterId>["filters"],
      pageIndex: 9,
      pageSize: 10,
    });
    const [emissions, setEmissions] = useState(0);
    const [reason, setReason] = useState<DataTableStateChangeReason | "none">("none");
    return <><DataTable caption="Normalized accounts" rows={accounts} columns={columns} getRowId={row => row.id} filters={filters} state={state} onStateChange={(nextState, meta) => { setState(nextState); setReason(meta.reason); setEmissions(value => value + 1); }} /><output aria-label="Normalization result">{reason}; {emissions}; page {state.pageIndex + 1}; {JSON.stringify(state.filters)}</output></>;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByLabelText("Normalization result")).toHaveTextContent('data-change; 1; page 2; {"type":["Current"]}'));
  },
};
