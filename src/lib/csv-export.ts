import Papa from "papaparse";

interface Transaction {
  date: string;
  type: "income" | "expense";
  hustleName: string;
  amount: number;
  category?: string;
  taxDeductible?: boolean;
  notes?: string;
}

export function exportCSV(transactions: Transaction[], filename: string) {
  const data = transactions.map((t) => ({
    Date: t.date,
    Type: t.type === "income" ? "Income" : "Expense",
    Hustle: t.hustleName,
    Amount: t.type === "income" ? t.amount : -t.amount,
    Category: t.category || "",
    "Tax Deductible": t.taxDeductible ? "Yes" : "No",
    Notes: t.notes || "",
  }));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
