"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import EmptyState from "@/components/ui/empty-state";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function HustleDetailPage() {
  const params = useParams();
  const hustleId = params.id as Id<"hustles">;

  const hustle = useQuery(api.hustles.getById, { hustleId });
  const incomeEntries = useQuery(api.incomeEntries.listByHustle, { hustleId });
  const expenseEntries = useQuery(api.expenses.listByHustle, { hustleId });

  if (hustle === undefined) {
    return (
      <div className="p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-brand-card rounded w-48" />
          <div className="h-32 bg-brand-card rounded" />
        </div>
      </div>
    );
  }

  if (hustle === null) {
    return (
      <div className="p-4 md:p-6">
        <EmptyState
          emoji="❓"
          title="Hustle not found"
          description="This hustle doesn't exist or you don't have access."
          action={{ label: "Back to Dashboard", href: "/app" }}
        />
      </div>
    );
  }

  const totalIncome = (incomeEntries || []).reduce(
    (sum, e) => sum + e.amount,
    0
  );
  const totalExpenses = (expenseEntries || []).reduce(
    (sum, e) => sum + e.amount,
    0
  );
  const profit = totalIncome - totalExpenses;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
          style={{ backgroundColor: hustle.color + "20" }}
        >
          {hustle.emoji}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-brand-white">{hustle.name}</h1>
          <p className="text-sm text-brand-muted">
            {hustle.category.replace("_", " ")}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 text-center">
          <p className="text-brand-muted text-xs mb-1">Income</p>
          <p className="text-lg font-bold text-green-400">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 text-center">
          <p className="text-brand-muted text-xs mb-1">Expenses</p>
          <p className="text-lg font-bold text-red-400">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 text-center">
          <p className="text-brand-muted text-xs mb-1">Profit</p>
          <p
            className={`text-lg font-bold ${profit >= 0 ? "text-brand-gold" : "text-red-400"}`}
          >
            {formatCurrency(profit)}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <Link
          href="/app/income/new"
          className="flex-1 py-3 bg-green-600/20 text-green-400 font-medium rounded-lg text-center hover:bg-green-600/30 transition-colors"
        >
          + Income
        </Link>
        <Link
          href="/app/expenses/new"
          className="flex-1 py-3 bg-red-600/20 text-red-400 font-medium rounded-lg text-center hover:bg-red-600/30 transition-colors"
        >
          + Expense
        </Link>
      </div>

      {/* Recent income */}
      <div>
        <h2 className="text-lg font-semibold text-brand-white mb-3">
          Recent Income
        </h2>
        {(!incomeEntries || incomeEntries.length === 0) ? (
          <p className="text-brand-muted text-sm">No income entries yet.</p>
        ) : (
          <div className="space-y-2">
            {incomeEntries.slice(0, 10).map((entry) => (
              <div
                key={entry._id}
                className="flex items-center justify-between bg-brand-card border border-brand-border rounded-lg p-3"
              >
                <div>
                  <p className="text-brand-white text-sm">
                    {formatDate(entry.date)}
                  </p>
                  {entry.notes && (
                    <p className="text-brand-muted text-xs">{entry.notes}</p>
                  )}
                  {entry.isRecurring && (
                    <span className="text-xs text-brand-gold">Recurring</span>
                  )}
                </div>
                <p className="font-semibold text-green-400">
                  +{formatCurrency(entry.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent expenses */}
      <div>
        <h2 className="text-lg font-semibold text-brand-white mb-3">
          Recent Expenses
        </h2>
        {(!expenseEntries || expenseEntries.length === 0) ? (
          <p className="text-brand-muted text-sm">No expenses yet.</p>
        ) : (
          <div className="space-y-2">
            {expenseEntries.slice(0, 10).map((entry) => (
              <div
                key={entry._id}
                className="flex items-center justify-between bg-brand-card border border-brand-border rounded-lg p-3"
              >
                <div>
                  <p className="text-brand-white text-sm">
                    {formatDate(entry.date)}
                  </p>
                  <p className="text-brand-muted text-xs">
                    {entry.category}
                    {entry.isTaxDeductible && " - tax deductible"}
                  </p>
                  {entry.notes && (
                    <p className="text-brand-muted text-xs">{entry.notes}</p>
                  )}
                </div>
                <p className="font-semibold text-red-400">
                  -{formatCurrency(entry.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
