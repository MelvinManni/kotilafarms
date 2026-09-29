// Shown in place of rows when search or filters leave nothing, with the way back
import { Button } from "@/components/kotila/button";
import { TableCell, TableRow } from "@/components/ui/table";

type NoMatchesProps = { search: string; onClear: () => void };

export function NoMatches({ search, onClear }: NoMatchesProps) {
  return (
    <div className="px-6 py-8 text-center">
      <p className="m-0 text-body text-ink-2">{search.trim() ? `Nothing matches “${search.trim()}”.` : "Nothing matches these filters."}</p>
      <Button variant="quiet" onClick={onClear} className="mt-2">
        Clear search and filters
      </Button>
    </div>
  );
}

export function NoMatchesRow({ span, ...props }: NoMatchesProps & { span: number }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={span} className="p-0 whitespace-normal">
        <NoMatches {...props} />
      </TableCell>
    </TableRow>
  );
}
