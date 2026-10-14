"use client";

import { Button, Select } from "@johnshandux/ledger-design-system";
import type { DataTableSortDirection, DataTableState } from "@johnshandux/ledger-design-system/data-table";
import { Icon } from "@johnshandux/ledger-design-system/icons";
import "./MobileTableSortControls.css";

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
  iconOnlyDirection?: boolean;
};

export function MobileTableSortControls({ label, options, state, onStateChange, iconOnlyDirection = false }: MobileTableSortControlsProps) {
  const activeOption = options.find(option => option.columnId === state.sort?.columnId);
  const direction = state.sort?.direction;
  const oppositeDirection = direction === "ascending" ? "descending" : "ascending";

  return (
    <div className="mobile-table-controls">
      <div className="mobile-table-sort-field">
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
      </div>
      {state.sort && (
        <Button
          type="button"
          variant="secondary"
          size={iconOnlyDirection ? "small" : "default"}
          className={`mobile-table-direction${iconOnlyDirection ? " mobile-table-direction--icon" : ""}`}
          aria-label={`Sort ${direction}; change to ${oppositeDirection}`}
          onClick={() => onStateChange({
            ...state,
            sort: { ...state.sort!, direction: oppositeDirection },
            pageIndex: 0,
          })}
        >
          {iconOnlyDirection ? (
            <Icon
              name={direction === "ascending" ? "arrow-up" : "arrow-down"}
              size="small"
              className={`mobile-table-direction-icon mobile-table-direction-icon--${direction}`}
              aria-hidden="true"
            />
          ) : direction === "ascending" ? "Ascending" : "Descending"}
        </Button>
      )}
    </div>
  );
}
