"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@johnshandux/ledger-design-system";
import {
  createDataTableRowModel,
  DataTable,
  type DataTableColumn,
  type DataTableFilterDefinition,
  type DataTableSearchDefinition,
  type DataTableState,
} from "@johnshandux/ledger-design-system/data-table";
import { additionalAccessCatalogue } from "@johnshandux/ledger-synthetic-finance";
import { bankFinanceEnvironment } from "../../../src/finance/environment";
import {
  createBankUserPresentations,
  NO_ADDITIONAL_ACCESS_FILTER_VALUE,
  UNASSIGNED_ROLE_FILTER_VALUE,
  type BankUserPresentation,
} from "../../../src/presentation/users";
import { useEffectiveUsers } from "../../useBankEffectiveState";
import { MobileTableSortControls } from "../../MobileTableSortControls";

export type UsersFilterId = "status" | "bankingRole" | "additionalAccess";

export const usersSearch: DataTableSearchDefinition<BankUserPresentation> = {
  label: "Search users",
  placeholder: "Search by name, email or role",
  values: (row) => row.searchValues,
};

export const usersColumns: readonly DataTableColumn<BankUserPresentation>[] = [
  {
    id: "user",
    label: "User",
    header: "User",
    cell: ({ row }) => <div><div className="people-access-user-name"><Link className="ledger-link" href={row.detailRoute}>{row.fullName}</Link></div><div className="people-access-secondary">{row.email}</div></div>,
    sort: { value: (row) => row.fullName },
  },
  {
    id: "bankingRole",
    label: "Role",
    header: "Role",
    cell: ({ row }) => row.displayRole.label,
    sort: { value: (row) => row.displayRole.label },
  },
  {
    id: "additionalAccess",
    label: "Additional access",
    header: "Additional access",
    cell: ({ row }) => row.additionalAccessLabel,
    sort: { value: (row) => row.additionalAccessSortValue },
  },
  {
    id: "status",
    label: "Status",
    header: "Status",
    cell: ({ row }) => <Badge variant={row.status === "active" ? "success" : "warning"}>{row.statusLabel}</Badge>,
    sort: { value: (row) => row.statusLabel },
  },
];

export function createUsersFilters(): readonly DataTableFilterDefinition<BankUserPresentation, UsersFilterId>[] {
  return [
    {
      id: "status",
      label: "Status",
      options: [{ value: "active", label: "Active" }, { value: "suspended", label: "Suspended" }],
      values: (row) => row.status,
    },
    {
      id: "bankingRole",
      label: "Banking role",
      options: [
        ...bankFinanceEnvironment.roles.map(({ id, name }) => ({ value: id, label: name })),
        { value: UNASSIGNED_ROLE_FILTER_VALUE, label: "Unassigned" },
      ],
      values: (row) => row.bankingRoleFilterValue,
    },
    {
      id: "additionalAccess",
      label: "Additional access",
      options: [
        ...additionalAccessCatalogue.map(({ id, name }) => ({ value: id, label: name })),
        { value: NO_ADDITIONAL_ACCESS_FILTER_VALUE, label: "None" },
      ],
      values: (row) => row.additionalAccessFilterValues,
    },
  ];
}

const pageSizeOptions = [10, 20, 50] as const;
const sortOptions = usersColumns.filter(({ sort }) => sort).map(({ id, label }) => ({ columnId: id, label }));

export function createUsersPresentationRowModel(rows: readonly BankUserPresentation[], state: DataTableState<UsersFilterId>) {
  return createDataTableRowModel({ rows, columns: usersColumns, state, search: usersSearch, filters: createUsersFilters(), pageSizeOptions });
}

function UsersTable({ rows, state, onStateChange }: {
  rows: readonly BankUserPresentation[];
  state: DataTableState<UsersFilterId>;
  onStateChange: (state: DataTableState<UsersFilterId>) => void;
}) {
  return <DataTable
    caption="People with access to Caldermere Ltd banking services"
    rows={rows}
    columns={usersColumns}
    getRowId={(row) => row.id}
    search={usersSearch}
    filters={createUsersFilters()}
    pageSizeOptions={pageSizeOptions}
    itemLabel={{ singular: "user", plural: "users" }}
    density="compact"
    state={state}
    onStateChange={onStateChange}
    emptyState={{ title: "No users", description: "No people currently have access to Caldermere Ltd’s banking services." }}
    noResultsState={{ title: "No matching users", description: "Clear all or change the search and filters to see users." }}
  />;
}

export function UsersExperience() {
  const effectiveUsers = useEffectiveUsers();
  const rows = useMemo(() => createBankUserPresentations(
    effectiveUsers,
    bankFinanceEnvironment.roles,
    additionalAccessCatalogue,
  ), [effectiveUsers]);
  const [state, setState] = useState<DataTableState<UsersFilterId>>({
    query: "",
    filters: {},
    pageIndex: 0,
    pageSize: 10,
    sort: { columnId: "user", direction: "ascending" },
  });
  const rowModel = createUsersPresentationRowModel(rows, state);

  return (
    <section className="people-access-users" aria-labelledby="users-heading">
      <h2 id="users-heading">Users</h2>
      <div className="people-access-desktop"><UsersTable rows={rows} state={state} onStateChange={setState} /></div>
      <div className="people-access-mobile">
        <UsersTable rows={rows} state={state} onStateChange={setState} />
        {rowModel.resultRowCount > 0 && (
          <>
            <MobileTableSortControls iconOnlyDirection label="Sort users by" options={sortOptions} state={state} onStateChange={setState} />
            <ol className="people-access-user-cards">
              {rowModel.visibleRows.map((user) => (
                <li key={user.id} className="people-access-user-card">
                  <div className="people-access-user-card-header">
                    <div><Link className="ledger-link people-access-user-name" href={user.detailRoute}>{user.fullName}</Link><div className="people-access-secondary">{user.email}</div></div>
                    <Badge variant={user.status === "active" ? "success" : "warning"}>{user.statusLabel}</Badge>
                  </div>
                  <dl><div><dt>Role</dt><dd>{user.displayRole.label}</dd></div><div><dt>Additional access</dt><dd>{user.additionalAccessLabel}</dd></div></dl>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </section>
  );
}
