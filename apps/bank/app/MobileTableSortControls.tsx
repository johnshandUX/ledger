"use client";

import { Button, Select } from "@johnshandux/ledger-design-system";
import type { DataTableSortDirection, DataTableState } from "@johnshandux/ledger-design-system/data-table";

type MobileSortOption = {
  columnId: string;
  label: string;
  initialDirection?: DataTableSortDirection;
};

type MobileTableSortControlsProps = {
  label: string;
  options: readonly MobileSortOption[];
  state: DataTableState;
  onStateChange: (state: DataTableState) => void;
};

export function MobileTableSortControls({ label, options, state, onStateChange }: MobileTableSortControlsProps) {
  const activeOption = options.find(option => option.columnId === state.sort?.columnId);

  return (
    <div className="mobile-table-controls">
      <Select
        label={label}
        value={activeOption?.columnId ?? "source"}
        options={[
          { label: "Default order", value: "source" },
          ...options.map(option => ({ label: option.label, value: option.columnId })),
        ]}
        onChange={event => {
          const option = options.find(candidate => candidate.columnId === event.currentTarget.value);
          onStateChange({
            ...state,
            sort: option ? { columnId: option.columnId, direction: option.initialDirection ?? "ascending" } : undefined,
            pageIndex: 0,
          });
        }}
      />
      {state.sort && (
        <Button
          type="button"
          variant="secondary"
          className="mobile-table-direction"
          aria-label={`Sort direction: ${state.sort.direction}; change to ${state.sort.direction === "ascending" ? "descending" : "ascending"}`}
          onClick={() => onStateChange({
            ...state,
            sort: { ...state.sort!, direction: state.sort!.direction === "ascending" ? "descending" : "ascending" },
            pageIndex: 0,
          })}
        >
          {state.sort.direction === "ascending" ? "Ascending" : "Descending"}
        </Button>
      )}
    </div>
  );
}
