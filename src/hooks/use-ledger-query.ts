"use client";
// Search and filters for a LedgerTable on TanStack Table: the rows that match and each filter's choices
import { useDeferredValue, useMemo, useState } from "react";
import {
  columnFacetingFeature,
  columnFilteringFeature,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  filterFn_arrHas,
  filterFn_includesString,
  globalFilteringFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type { LedgerColumn, LedgerFilter, LedgerRow } from "@/types/ledger";
import { cellLabel, cellText } from "@/utils/table/cell-text";

const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  columnFacetingFeature,
  filteredRowModel: createFilteredRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  filterFns: { includesString: filterFn_includesString, arrHas: filterFn_arrHas },
});

// Filter columns sit beside the shown ones so a filter can use a field that isn't a column
const FILTER_PREFIX = "filter:";
const NO_CHOICE = new Set(["", "—"]);

export type FilterChoice = { value: string; count: number };
export type FilterState = LedgerFilter & { choices: FilterChoice[]; picked: string[] };

export function useLedgerQuery<R extends LedgerRow>(rows: R[], columns: LedgerColumn[], filters: LedgerFilter[] = []) {
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<Record<string, string[]>>({});
  const query = useDeferredValue(search.trim());
  const shape = [...columns.map((c) => c.key), "|", ...filters.map((f) => f.key)].join(",");

  const defs = useMemo<ColumnDef<typeof features, R>[]>(
    () => [
      ...columns.map((c) => ({ id: c.key, accessorFn: (r: R) => cellText(r[c.key]) })),
      ...filters.map((f) => ({ id: FILTER_PREFIX + f.key, accessorFn: (r: R) => cellLabel(r[f.key]), filterFn: "arrHas" as const })),
    ],
    // Callers build new column arrays each render; the keys are what matter
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shape],
  );

  const columnFilters = useMemo(
    () => Object.entries(picked).filter(([, values]) => values.length).map(([key, values]) => ({ id: FILTER_PREFIX + key, value: values })),
    [picked],
  );

  const table = useTable({
    features,
    columns: defs,
    data: rows,
    getRowId: (row, index) => row.id ?? String(index),
    globalFilterFn: "includesString",
    getColumnCanGlobalFilter: (column) => !column.id.startsWith(FILTER_PREFIX),
    state: { globalFilter: query, columnFilters },
  });

  const shown = table.getRowModel().rows.map((r) => r.original);
  const filterStates: FilterState[] = filters
    .map((f) => {
      const counts = table.getColumn(FILTER_PREFIX + f.key)?.getFacetedUniqueValues() ?? new Map<unknown, number>();
      const choices = [...counts].filter(([value]) => !NO_CHOICE.has(String(value))).map(([value, count]) => ({ value: String(value), count }));
      return { ...f, choices, picked: picked[f.key] ?? [] };
    })
    // A filter with one choice can't narrow anything, unless it is already picked
    .filter((f) => f.choices.length > 1 || f.picked.length > 0);

  const toggle = (key: string, value: string) =>
    setPicked((now) => {
      const current = now[key] ?? [];
      return { ...now, [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] };
    });
  const pickedCount = Object.values(picked).reduce((n, values) => n + values.length, 0);
  const clear = () => {
    setSearch("");
    setPicked({});
  };

  return { rows: shown, search, setSearch, filters: filterStates, toggle, clearFilters: () => setPicked({}), clear, pickedCount, active: query !== "" || pickedCount > 0 };
}

export type LedgerQuery = ReturnType<typeof useLedgerQuery>;
