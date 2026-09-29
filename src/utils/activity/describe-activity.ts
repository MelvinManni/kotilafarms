// One activity row in plain words, without the person (the list shows who separately)
import { TABLE_NOUN } from "@/constants/activity-kinds";
import { auditFieldLabel, auditValue } from "@/utils/format/audit-value";

export type ActivitySource =
  | { source: "auth"; kind: "sign_in" | "sign_in_failed" | "sign_out" | "password_changed"; email: string; known: boolean }
  | { source: "audit"; action: "create" | "update" | "delete" | "resolve"; table: string; field: string | null; oldValue: unknown; newValue: unknown };

const AUTH_WORDS = { sign_in: "signed in", sign_out: "signed out", password_changed: "changed their password", sign_in_failed: "tried to sign in with the wrong password" };

// `context` names the record ("Set 4's log for 26 Sep"); without it the table's noun is used
export function describeActivity(row: ActivitySource, context?: string): string {
  if (row.source === "auth") {
    if (row.kind === "sign_in_failed" && !row.known) return `Someone tried to sign in as ${row.email}`;
    return AUTH_WORDS[row.kind];
  }
  const thing = context ?? TABLE_NOUN[row.table] ?? row.table.replaceAll("_", " ");
  if (row.action === "create") return `added ${thing}`;
  if (row.action === "delete") return `removed ${thing}`;
  if (row.action === "resolve") return `settled a clash on ${thing}`;
  const field = row.field ?? "";
  if (field === "password") return `reset the password for ${thing}`;
  if (field === "removedAt") return row.newValue ? `removed ${thing} from the share register` : `restored ${thing} to the share register`;
  if (field === "deletedAt") return row.newValue ? `removed ${thing}` : `brought back ${thing}`;
  // Ids mean nothing to people: say what changed, not the values
  if (field.endsWith("Id")) return `changed the ${auditFieldLabel(field)} on ${thing}`;
  return `changed ${auditFieldLabel(field)} on ${thing} from ${auditValue(field, row.oldValue)} to ${auditValue(field, row.newValue)}`;
}
