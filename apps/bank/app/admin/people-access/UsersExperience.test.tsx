import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { additionalAccessCatalogue } from "@johnshandux/ledger-synthetic-finance";
import { bankFinanceEnvironment } from "../../../src/finance/environment";
import { createBankUserPresentations } from "../../../src/presentation/users";
import { BankStateProvider } from "../../BankStateProvider";
import {
  createUsersFilters,
  createUsersPresentationRowModel,
  UsersExperience,
  type UsersFilterId,
} from "./UsersExperience";
import type { DataTableState } from "@johnshandux/ledger-design-system/data-table";

const rows = createBankUserPresentations(
  bankFinanceEnvironment.users,
  bankFinanceEnvironment.roles,
  additionalAccessCatalogue,
);

function state(overrides: Partial<DataTableState<UsersFilterId>> = {}): DataTableState<UsersFilterId> {
  return {
    query: "",
    filters: {},
    pageIndex: 0,
    pageSize: 10,
    sort: { columnId: "user", direction: "ascending" },
    ...overrides,
  };
}

describe("Users experience", () => {
  it("configures catalogue-backed stable filter values", () => {
    const filters = createUsersFilters();
    expect(filters.find(({ id }) => id === "bankingRole")?.options).toEqual([
      ...bankFinanceEnvironment.roles.map(({ id, name }) => ({ value: id, label: name })),
      { value: "unassigned", label: "Unassigned" },
    ]);
    expect(filters.find(({ id }) => id === "additionalAccess")?.options).toEqual([
      ...additionalAccessCatalogue.map(({ id, name }) => ({ value: id, label: name })),
      { value: "none", label: "None" },
    ]);
  });

  it("searches names and email addresses with shared normalization", () => {
    expect(createUsersPresentationRowModel(rows, state({ query: "amelia hart" })).filteredRows.map(({ id }) => id))
      .toEqual(["user-amelia-hart"]);
    expect(createUsersPresentationRowModel(rows, state({ query: "OKAFOR@CALDERMERE" })).filteredRows.map(({ id }) => id))
      .toEqual(["user-daniel-okafor"]);
  });

  it("uses OR within filters and AND across search and filters", () => {
    const multipleStatuses = createUsersPresentationRowModel(rows, state({ filters: { status: ["active", "suspended"] } }));
    expect(multipleStatuses.resultRowCount).toBe(rows.length);

    const combined = createUsersPresentationRowModel(rows, state({
      query: "caldermere.example",
      filters: {
        status: ["active"],
        bankingRole: ["role-administrator", "unassigned"],
        additionalAccess: ["developer"],
      },
    }));
    expect(combined.filteredRows.map(({ id }) => id).sort()).toEqual(["user-amelia-hart", "user-noah-wilson"]);
  });

  it("filters suspended, role and additional-access assignments independently", () => {
    expect(createUsersPresentationRowModel(rows, state({ filters: { status: ["suspended"] } })).filteredRows)
      .toHaveLength(1);
    expect(createUsersPresentationRowModel(rows, state({ filters: { bankingRole: ["unassigned"] } })).filteredRows)
      .toHaveLength(1);
    expect(createUsersPresentationRowModel(rows, state({ filters: { additionalAccess: ["developer"] } })).filteredRows)
      .toHaveLength(3);
    expect(createUsersPresentationRowModel(rows, state({ filters: { additionalAccess: ["none"] } })).filteredRows)
      .toHaveLength(15);
  });

  it("supports multiple role and additional-access values within their filters", () => {
    const roles = createUsersPresentationRowModel(rows, state({
      filters: { bankingRole: ["role-administrator", "role-viewer"] },
    }));
    expect(roles.resultRowCount).toBe(8);

    const access = createUsersPresentationRowModel(rows, state({
      filters: { additionalAccess: ["developer", "none"] },
    }));
    expect(access.resultRowCount).toBe(rows.length);
  });

  it("defaults to name order and keeps unassigned roles last in both directions", () => {
    const byName = createUsersPresentationRowModel(rows, state());
    expect(byName.sortedRows[0]?.fullName).toBe("Aisha Khan");

    for (const direction of ["ascending", "descending"] as const) {
      const byRole = createUsersPresentationRowModel(rows, state({ sort: { columnId: "bankingRole", direction } }));
      expect(byRole.sortedRows.at(-1)?.bankingRoleLabel).toBe("Unassigned");
    }
    const byStatus = createUsersPresentationRowModel(rows, state({ sort: { columnId: "status", direction: "descending" } }));
    expect(byStatus.sortedRows[0]?.statusLabel).toBe("Suspended");
  });

  it("paginates the same ordered records used by responsive cards and clamps stale pages", () => {
    const secondPage = createUsersPresentationRowModel(rows, state({ pageIndex: 1 }));
    expect(secondPage.visibleRows).toEqual(secondPage.sortedRows.slice(10, 20));
    expect(secondPage.visibleRows).toHaveLength(8);
    expect(secondPage.totalRowCount).toBe(18);
    expect(secondPage.resultRowCount).toBe(18);

    const resized = createUsersPresentationRowModel(rows, state({ pageIndex: 1, pageSize: 20 }));
    expect(resized.state.pageIndex).toBe(0);
    expect(resized.visibleRows).toHaveLength(18);
  });

  it("provides one shared filtered, sorted and paginated row model for table rows and cards", () => {
    const presentation = createUsersPresentationRowModel(rows, state({
      query: "caldermere.example",
      filters: { bankingRole: ["role-viewer"] },
      sort: { columnId: "status", direction: "descending" },
      pageSize: 10,
    }));

    expect(presentation.visibleRows).toEqual(presentation.sortedRows.slice(0, 10));
    expect(presentation.visibleRows.every(({ bankingRoleLabel }) => bankingRoleLabel === "Viewer")).toBe(true);
  });

  it("renders labelled controls, status text, details links and CSS-exclusive presentations", () => {
    const html = renderToStaticMarkup(<BankStateProvider><UsersExperience /></BankStateProvider>);
    expect(html).toContain("Search by name or email");
    expect(html).toMatch(/<label[^>]*for="[^"]+-search"[^>]*>Search users<\/label>/);
    expect(html).toContain("Banking role");
    expect(html).toContain("Additional access");
    expect(html).toContain("Active");
    expect(html).toContain("Suspended");
    expect(html).toContain('href="/admin/people-access/users/user-amelia-hart"');
    expect(html).toContain('class="people-access-desktop"');
    expect(html).toContain('class="people-access-mobile"');
    expect(html).toContain("Sort users by");
  });
});
