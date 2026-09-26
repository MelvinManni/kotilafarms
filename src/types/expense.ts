// Expenses as the API returns them
export type ExpenseRow = {
  id: string;
  clientId: string;
  version: number;
  date: string;
  category: { id: string; key: string; name: string };
  description: string;
  amount: number;
  setId: string | null;
  setNumber: number | null;
  overhead: boolean;
  paidBy: { id: string; name: string } | null;
  receiptKey: string | null;
  capitalItem: boolean;
  possibleDuplicateOf: string | null;
  createdBy: string;
  createdAt: string;
};

export type ExpenseSummary = {
  running: number;
  capital: { total: number; count: number };
  onSets: { total: number; bySet: { number: number; total: number }[] };
  overhead: number;
  byCategory: { label: string; value: number }[];
};

export type ExpenseList = { rows: ExpenseRow[]; summary: ExpenseSummary };

export type ExpenseCategory = { id: string; key: string; name: string; isCapitalEligible: boolean };
