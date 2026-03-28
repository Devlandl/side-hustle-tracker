"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import Link from "next/link";
import PeriodToggle from "@/components/ui/period-toggle";
import ProgressBar from "@/components/ui/progress-bar";
import EmptyState from "@/components/ui/empty-state";
import {
  formatCurrency,
  getDateRangeForPeriod,
} from "@/lib/utils";

export default function DashboardPage() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");
  const { start, end } = getDateRangeForPeriod(period);

  const hustles = useQuery(api.hustles.list);
  const incomeTotals = useQuery(api.incomeEntries.totalByPeriod, {
    startDate: start,
    endDate: end,
  });
  const expenseTotals = useQuery(api.expenses.totalByPeriod, {
    startDate: start,
    endDate: end,
  });
  const taxSettings = useQuery(api.taxSettings.get);
  const goals = useQuery(api.goals.list);

  if (!hustles || !incomeTotals || !expenseTotals) {
    return (
      <div className="p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-brand-card rounded w-48" />
          <div className="h-32 bg-brand-card rounded" />
          <div className="h-32 bg-brand-card rounded" />
        </div>
      </div>
    );
  }

  const activeHustles = hustles.filter((h) => h.isActive);
  const netProfit = incomeTotals.total - expenseTotals.total;
  const taxRate = taxSettings?.taxRate || 0;
  const taxableIncome = incomeTotals.total - expenseTotals.deductible;
  const taxOwed = taxableIncome > 0 ? taxableIncome * (taxRate / 100) : 0;

  // Find overall goal for current period
  const overallGoal = goals?.find(
    (g) => !g.hustleId && g.period === (period === "year" ? "yearly" : "monthly")
  );

  if (activeHustles.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold text-brand-white mb-6">Dashboard</h1>
        <EmptyState
          emoji="💸"
          title="No hustles yet"
          description="Add your first side hustle to start tracking your income."
          action={{ label: "Add a Hustle", href: "/app/settings" }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-brand-white">Dashboard</h1>
        <PeriodToggle value={period} onChange={setPeriod} />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-brand-card border border-brand-border rounded-xl p-4">
          <p className="text-brand-muted text-xs mb-1">Income</p>
          <p className="text-xl font-bold text-green-400">
            {formatCurrency(incomeTotals.total)}
          </p>
        </div>
        <div className="bg-brand-card border border-brand-border rounded-xl p-4">
          <p className="text-brand-muted text-xs mb-1">Expenses</p>
          <p className="text-xl font-bold text-red-400">
            {formatCurrency(expenseTotals.total)}
          </p>
        </div>
        <div className="bg-brand-card border border-brand-border rounded-xl p-4">
          <p className="text-brand-muted text-xs mb-1">Net Profit</p>
          <p
            className={`text-xl font-bold ${netProfit >= 0 ? "text-brand-gold" : "text-red-400"}`}
          >
            {formatCurrency(netProfit)}
          </p>
        </div>
        <div className="bg-brand-card border border-brand-border rounded-xl p-4">
          <p className="text-brand-muted text-xs mb-1">Tax Jar Target</p>
          <p className="text-xl font-bold text-brand-white">
            {formatCurrency(taxOwed)}
          </p>
        </div>
      </div>

      {/* Goal progress */}
      {overallGoal && (
        <div className="bg-brand-card border border-brand-border rounded-xl p-4">
          <ProgressBar
            value={incomeTotals.total}
            max={overallGoal.targetAmount}
            label={`${period === "year" ? "Yearly" : "Monthly"} Goal`}
          />
        </div>
      )}

      {/* Hustle list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-brand-white">
            Your Hustles
          </h2>
          <Link
            href="/app/settings"
            className="text-brand-gold text-sm hover:text-brand-gold-light"
          >
            Manage
          </Link>
        </div>
        <div className="space-y-2">
          {activeHustles.map((hustle) => {
            const hustleIncome =
              incomeTotals.byHustle[hustle._id] || 0;
            return (
              <Link
                key={hustle._id}
                href={`/app/hustles/${hustle._id}`}
                className="flex items-center justify-between bg-brand-card border border-brand-border rounded-xl p-4 hover:border-brand-gold/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: hustle.color + "20" }}
                  >
                    {hustle.emoji}
                  </span>
                  <div>
                    <p className="font-medium text-brand-white">
                      {hustle.name}
                    </p>
                    <p className="text-xs text-brand-muted">
                      {hustle.category.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-brand-white">
                  {formatCurrency(hustleIncome)}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
