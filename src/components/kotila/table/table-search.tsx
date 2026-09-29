"use client";
// Search box above a table; matches any word shown in a row
import { Tooltip } from "@/components/kotila/tooltip";
import { Icon } from "@/svgs/icon";

type TableSearchProps = { value: string; onChange: (value: string) => void; label: string };

export function TableSearch({ value, onChange, label }: TableSearchProps) {
  return (
    <div className="relative flex min-w-0 grow items-center sm:max-w-80">
      <Icon name="search" size={18} className="pointer-events-none absolute left-3.5 text-ink-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && onChange("")}
        placeholder="Search"
        aria-label={label}
        className="h-11 w-full min-w-0 appearance-none rounded-full border-[1.5px] border-line-strong bg-surface-sunken pr-11 pl-10 font-sans text-[15px] font-medium text-ink outline-none placeholder:text-ink-faint focus-visible:border-green-600 focus-visible:bg-surface focus-visible:shadow-focus [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <Tooltip label="Clear search">
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onChange("")}
            className="absolute right-0 flex size-11 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-ink-muted outline-none hover:text-ink focus-visible:shadow-focus"
          >
            <Icon name="x" size={16} />
          </button>
        </Tooltip>
      ) : null}
    </div>
  );
}
