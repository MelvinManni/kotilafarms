// /expenses
import type { Metadata } from "next";
import { Suspense } from "react";
import { ExpensesScreen } from "@/components/expenses/expenses-screen";

export const metadata: Metadata = { title: "Expenses · Kotila Farm" };

export default function ExpensesPage() {
  return (
    <Suspense>
      <ExpensesScreen />
    </Suspense>
  );
}
