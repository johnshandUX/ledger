import type { Meta, StoryObj } from "@storybook/react-vite";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "./Table";

const meta = {
  title: "Components/Table",
  component: Table,
  tags: ["autodocs"],
} satisfies Meta<typeof Table>;

export default meta;

type Story = StoryObj<typeof meta>;

const sample = [
  { id: 1, name: "Main Account", number: "12345678", sort: "00-11-22", type: "Business", current: "£12,345.67", available: "£10,000.00" },
  { id: 2, name: "Savings", number: "87654321", sort: "33-44-55", type: "Savings", current: "£2,500.00", available: "£2,500.00" },
  { id: 3, name: "Long Description Account With Lots Of Text", number: "55554444", sort: "66-77-88", type: "Trust", current: "£123.45", available: "£123.45" },
  { id: 4, name: "Payroll", number: "00001111", sort: "11-22-33", type: "Business", current: "£7,890.00", available: "£7,890.00" },
];

export const Basic = () => (
  <Table ariaLabel="Sample ledger table">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Account</TableHeaderCell>
          <TableHeaderCell>Number / Sort</TableHeaderCell>
          <TableHeaderCell>Type</TableHeaderCell>
          <TableHeaderCell align="right">Current</TableHeaderCell>
          <TableHeaderCell align="right">Available</TableHeaderCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {sample.map((s) => (
          <TableRow key={s.id}>
            <TableCell>
              <div style={{ fontWeight: 600 }}>{s.name}</div>
              <div style={{ color: "var(--ledger-color-text-secondary)", fontSize: "var(--ledger-font-size-body-small)" }}>{s.type} • {s.number}</div>
            </TableCell>
            <TableCell>
              <div>{s.number}</div>
              <div style={{ color: "var(--ledger-color-text-secondary)", fontSize: "var(--ledger-font-size-body-small)" }}>{s.sort}</div>
            </TableCell>
            <TableCell>{s.type}</TableCell>
            <TableCell align="right">{s.current}</TableCell>
            <TableCell align="right">{s.available}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
);


