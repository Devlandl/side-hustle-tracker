"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import ProgressBar from "@/components/ui/progress-bar";
import {
  formatCurrency,
  getStartOfYear,
  getTodayString,
} from "@/lib/utils";

const QUARTERLY_DATES = [
  { label: "Q1 - April 15", due: "-04-15", quarter: "Q1" },
  { label: "Q2 - June 15", due: "-06-15", quarter: "Q2" },
  { label: "Q3 - September 15", due: "-09-15", quarter: "Q3" },
  { label: "Q4 - January 15 (next year)", due: "-01-15", quarter: "Q4" },
];

export default function TaxCenterPage() {
  const taxSettings = useQuery(api.taxSettings.get);
  const upsertTax = useMutation(api.taxSettings.upsert);

  const yearStart = getStartOfYear();
  const today = getTodayString();
  const year = new Date().getFullYear();

  const incomeTotals = useQuery(api.incomeEntries.totalByPeriod, {
    startDate: yearStart,
    endDate: today,
  });
  const expenseTotals = useQuery(api.expenses.totalByPeriod, {
    startDate: yearStart,
    endDate: today,
  });

  const [editingRate, setEditingRate] = useState(false);
  const [newRate, setNewRate] = useState("");

  const taxRate = taxSettings?.taxRate || 0;
  const totalIncome = incomeTotals?.total || 0;
  const deductibleExpenses = expenseTotals?.deductible || 0;
  const taxableIncome = Math.max(totalIncome - deductibleExpenses, 0);
  const estimatedTax = taxableIncome * (taxRate / 100);
  const quarterlyPayment = estimatedTax / 4;

  async function saveTaxRate() {
    const rate = parseFloat(newRate);
    if (isNaN(rate) || rate < 0 || rate > 100) return;
    await upsertTax({ taxRate: rate });
    setEditingRate(false);
  }

  function getQuarterlyDueDate(quarter: typeof QUARTERLY_DATES[number]) {
    if (quarter.quarter === "Q4") {
      return `${year + 1}${quarter.due}`;
    }
    return `${year}${quarter.due}`;
  }

  function isUpcoming(dueDate: string) {
    return dueDate >= today && dueDate <= addDays(today, 30);
  }

  function isPast(dueDate: string) {
    return dueDate < today;
  }

  function addDays(dateStr: string, days: number) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-brand-white">Tax Center</h1>

      {/* Tax rate */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-brand-muted text-sm">Your Tax Rate</p>
          <button
            onClick={() => {
              setNewRate(String(taxRate));
              setEditingRate(true);
            }}
            className="text-brand-gold text-sm hover:text-brand-gold-light"
          >
            {taxRate > 0 ? "Edit" : "Set Rate"}
          </button>
        </div>
        {editingRate ? (
          <div className="flex gap-2">
            <input
              type="number"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              min="0"
              max="100"
              className="flex-1 px-3 py-2 bg-brand-dark border border-brand-border rounded-lg text-brand-white focus:outline-none focus:border-brand-gold"
              placeholder="e.g. 25"
            />
            <button
              onClick={saveTaxRate}
              className="px-4 py-2 bg-brand-gold text-brand-black font-medium rounded-lg"
            >
              Save
            </button>
          </div>
        ) : (
          <p className="text-3xl font-bold text-brand-white">{taxRate}%</p>
        )}
      </div>

      {/* Tax jar */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-4 space-y-4">
        <h2 className="text-lg font-semibold text-brand-white">
          Tax Jar - {year}
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-brand-muted text-xs">YTD Income</p>
            <p className="text-lg font-bold text-green-400">
              {formatCurrency(totalIncome)}
            </p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Deductions</p>
            <p className="text-lg font-bold text-red-400">
              {formatCurrency(deductibleExpenses)}
            </p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Taxable Income</p>
            <p className="text-lg font-bold text-brand-white">
              {formatCurrency(taxableIncome)}
            </p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Estimated Tax</p>
            <p className="text-lg font-bold text-brand-gold">
              {formatCurrency(estimatedTax)}
            </p>
          </div>
        </div>

        <ProgressBar
          value={0}
          max={estimatedTax}
          label="Tax Savings Target"
        />
        <p className="text-xs text-brand-muted">
          You should have {formatCurrency(estimatedTax)} saved for taxes this
          year. Set aside {formatCurrency(quarterlyPayment)} per quarter.
        </p>
      </div>

      {/* Quarterly schedule */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-4">
        <h2 className="text-lg font-semibold text-brand-white mb-3">
          Quarterly Due Dates
        </h2>
        <div className="space-y-3">
          {QUARTERLY_DATES.map((q) => {
            const dueDate = getQuarterlyDueDate(q);
            const past = isPast(dueDate);
            const upcoming = isUpcoming(dueDate);
            return (
              <div
                key={q.quarter}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  upcoming
                    ? "border-brand-gold bg-brand-gold/5"
                    : past
                      ? "border-brand-border bg-brand-dark/50 opacity-60"
                      : "border-brand-border"
                }`}
              >
                <div>
                  <p className="text-brand-white text-sm font-medium">
                    {q.label}
                  </p>
                  {upcoming && (
                    <p className="text-brand-gold text-xs">Coming up!</p>
                  )}
                  {past && (
                    <p className="text-brand-muted text-xs">Past</p>
                  )}
                </div>
                <p className="text-brand-white font-semibold">
                  {formatCurrency(quarterlyPayment)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
