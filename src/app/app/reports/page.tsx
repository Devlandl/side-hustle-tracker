"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  formatCurrency,
  getStartOfMonth,
  getStartOfYear,
  getTodayString,
  EXPENSE_CATEGORIES,
} from "@/lib/utils";
import { generatePDF } from "@/lib/pdf-export";
import { exportCSV } from "@/lib/csv-export";

export default function ReportsPage() {
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");

  const today = getTodayString();
  const year = new Date().getFullYear();

  let startDate: string;
  let periodLabel: string;
  switch (period) {
    case "month":
      startDate = getStartOfMonth();
      periodLabel = new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      break;
    case "quarter": {
      const month = new Date().getMonth();
      const qStart = Math.floor(month / 3) * 3;
      startDate = `${year}-${String(qStart + 1).padStart(2, "0")}-01`;
      periodLabel = `Q${Math.floor(month / 3) + 1} ${year}`;
      break;
    }
    case "year":
      startDate = getStartOfYear();
      periodLabel = String(year);
      break;
  }

  const hustles = useQuery(api.hustles.list);
  const incomeData = useQuery(api.incomeEntries.totalByPeriod, {
    startDate,
    endDate: today,
  });
  const expenseData = useQuery(api.expenses.totalByPeriod, {
    startDate,
    endDate: today,
  });
  const incomeEntries = useQuery(api.incomeEntries.listByUser, {
    startDate,
    endDate: today,
  });
  const expenseEntries = useQuery(api.expenses.listByUser, {
    startDate,
    endDate: today,
  });
  const taxSettings = useQuery(api.taxSettings.get);

  if (!hustles || !incomeData || !expenseData) {
    return (
      <div className="p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-brand-card rounded w-48" />
          <div className="h-64 bg-brand-card rounded" />
        </div>
      </div>
    );
  }

  const netProfit = incomeData.total - expenseData.total;
  const taxRate = taxSettings?.taxRate || 0;
  const taxableIncome = Math.max(incomeData.total - expenseData.deductible, 0);
  const estimatedTax = taxableIncome * (taxRate / 100);

  const hustleBreakdown = hustles
    .filter((h) => incomeData.byHustle[h._id])
    .map((h) => ({
      name: `${h.emoji} ${h.name}`,
      income: incomeData.byHustle[h._id] || 0,
    }))
    .sort((a, b) => b.income - a.income);

  const expenseBreakdown = Object.entries(expenseData.byCategory)
    .map(([category, amount]) => ({
      category:
        EXPENSE_CATEGORIES.find((c) => c.value === category)?.label ||
        category,
      amount: amount as number,
    }))
    .sort((a, b) => b.amount - a.amount);

  function handlePDF() {
    generatePDF({
      period: periodLabel,
      totalIncome: incomeData!.total,
      totalExpenses: expenseData!.total,
      netProfit,
      deductibleExpenses: expenseData!.deductible,
      taxableIncome,
      estimatedTax,
      hustleBreakdown,
      expenseBreakdown,
    });
  }

  function handleCSV() {
    if (!incomeEntries || !expenseEntries) return;
    const transactions = [
      ...incomeEntries.map((e) => ({
        date: e.date,
        type: "income" as const,
        hustleName:
          hustles!.find((h) => h._id === e.hustleId)?.name || "Unknown",
        amount: e.amount,
        notes: e.notes,
      })),
      ...expenseEntries.map((e) => ({
        date: e.date,
        type: "expense" as const,
        hustleName: e.hustleId
          ? hustles!.find((h) => h._id === e.hustleId)?.name || "Unknown"
          : "General",
        amount: e.amount,
        category: e.category,
        taxDeductible: e.isTaxDeductible,
        notes: e.notes,
      })),
    ].sort((a, b) => b.date.localeCompare(a.date));

    exportCSV(
      transactions,
      `hustle-transactions-${periodLabel.toLowerCase().replace(/\s/g, "-")}.csv`
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-brand-white">Reports</h1>

      {/* Period selector */}
      <div className="flex bg-brand-dark rounded-lg p-1 gap-1">
        {(["month", "quarter", "year"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              period === p
                ? "bg-brand-gold text-brand-black"
                : "text-brand-muted hover:text-brand-white"
            }`}
          >
            {p === "month" ? "Month" : p === "quarter" ? "Quarter" : "Year"}
          </button>
        ))}
      </div>

      <p className="text-brand-muted text-sm">{periodLabel}</p>

      {/* Summary */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-brand-white">Summary</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-brand-muted">Income</p>
            <p className="text-green-400 font-bold">
              {formatCurrency(incomeData.total)}
            </p>
          </div>
          <div>
            <p className="text-brand-muted">Expenses</p>
            <p className="text-red-400 font-bold">
              {formatCurrency(expenseData.total)}
            </p>
          </div>
          <div>
            <p className="text-brand-muted">Net Profit</p>
            <p
              className={`font-bold ${netProfit >= 0 ? "text-brand-gold" : "text-red-400"}`}
            >
              {formatCurrency(netProfit)}
            </p>
          </div>
          <div>
            <p className="text-brand-muted">Est. Tax</p>
            <p className="text-brand-white font-bold">
              {formatCurrency(estimatedTax)}
            </p>
          </div>
        </div>
      </div>

      {/* Income by hustle */}
      {hustleBreakdown.length > 0 && (
        <div className="bg-brand-card border border-brand-border rounded-xl p-4">
          <h2 className="font-semibold text-brand-white mb-3">
            Income by Hustle
          </h2>
          <div className="space-y-2">
            {hustleBreakdown.map((h) => (
              <div key={h.name} className="flex justify-between text-sm">
                <span className="text-brand-muted">{h.name}</span>
                <span className="text-brand-white font-medium">
                  {formatCurrency(h.income)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses by category */}
      {expenseBreakdown.length > 0 && (
        <div className="bg-brand-card border border-brand-border rounded-xl p-4">
          <h2 className="font-semibold text-brand-white mb-3">
            Expenses by Category
          </h2>
          <div className="space-y-2">
            {expenseBreakdown.map((e) => (
              <div key={e.category} className="flex justify-between text-sm">
                <span className="text-brand-muted">{e.category}</span>
                <span className="text-brand-white font-medium">
                  {formatCurrency(e.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export buttons */}
      <div className="flex gap-3">
        <button
          onClick={handlePDF}
          className="flex-1 py-3 bg-brand-gold text-brand-black font-semibold rounded-lg hover:bg-brand-gold-light transition-colors"
        >
          Download PDF
        </button>
        <button
          onClick={handleCSV}
          className="flex-1 py-3 bg-brand-card border border-brand-border text-brand-white font-semibold rounded-lg hover:border-brand-gold/30 transition-colors"
        >
          Export CSV
        </button>
      </div>
    </div>
  );
}
