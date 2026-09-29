// Plain words in a ledger cell: every word for search, the main label for filters
import { isValidElement, type ReactNode } from "react";
import { SET_STATUS_LABEL } from "@/constants/set-status-labels";
import type { Cell, CellObject } from "@/types/ledger";

export function isCellObject(cell: Cell): cell is CellObject {
  return typeof cell === "object" && cell !== null && !isValidElement(cell) && !Array.isArray(cell);
}

// Only strings and numbers count; icons and other elements have no words to match
const words = (node: ReactNode) => (typeof node === "string" || typeof node === "number" ? String(node) : "");

export function cellLabel(cell: Cell): string {
  if (!isCellObject(cell)) return words(cell as ReactNode);
  if (cell.status) return SET_STATUS_LABEL[cell.status];
  if (cell.tag) return cell.tag.label;
  return words(cell.value);
}

export function cellText(cell: Cell): string {
  if (!isCellObject(cell)) return words(cell as ReactNode);
  return [cellLabel(cell), words(cell.sub), cell.delta?.label ?? ""].filter(Boolean).join(" ");
}
