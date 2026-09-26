// /reports — the Set report for now; the weekly review and comparison join it later
import { redirect } from "next/navigation";

export default function ReportsPage() {
  redirect("/reports/set");
}
