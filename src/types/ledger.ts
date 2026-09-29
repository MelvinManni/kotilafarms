// Shapes for LedgerTable: cells, columns, rows and the filters above them
import type { ReactNode } from "react";
import type { TagTone } from "@/components/kotila/tag";
import type { SetStatus } from "@/types/set-status";

export type CellObject = {
  value?: ReactNode;
  sub?: ReactNode;
  tone?: "alert" | "owed" | "muted";
  figure?: boolean;
  tag?: { tone: TagTone; label: string };
  status?: SetStatus;
  day?: number;
  delta?: { direction: "up" | "down"; label: string; tone?: "good" | "bad" };
};

export type Cell = ReactNode | CellObject;

export type LedgerColumn = { key: string; label: string; align?: "left" | "right" | "center"; width?: number | string };

export type LedgerRow = Record<string, Cell> & { id?: string };

// One filter: the choices are the words found under `key`, a column or a field kept only for filtering
export type LedgerFilter = { key: string; label: string };
