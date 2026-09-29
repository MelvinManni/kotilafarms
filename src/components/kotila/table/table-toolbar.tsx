"use client";
// Search and filters above a table; left out of print
import { TableFilterPopover } from "@/components/kotila/table/table-filter-popover";
import { TableSearch } from "@/components/kotila/table/table-search";
import type { LedgerQuery } from "@/hooks/use-ledger-query";

export function TableToolbar({ query, label }: { query: LedgerQuery; label: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-line-soft px-6 py-3 max-lg:px-4 print:hidden">
      <TableSearch value={query.search} onChange={query.setSearch} label={`Search: ${label}`} />
      {query.filters.length ? <TableFilterPopover filters={query.filters} pickedCount={query.pickedCount} onToggle={query.toggle} onClear={query.clearFilters} /> : null}
    </div>
  );
}
