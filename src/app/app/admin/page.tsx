"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { formatCurrency } from "@/lib/utils";

export default function AdminPage() {
  const isAdmin = useQuery(api.admin.isAdmin);
  const stats = useQuery(api.admin.stats);

  if (isAdmin === false) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold text-brand-white mb-2">
          Admin
        </h1>
        <p className="text-red-400">You do not have admin access.</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-brand-card rounded w-32" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-brand-card rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, emoji: "👥" },
    { label: "Total Hustles", value: stats.totalHustles, emoji: "💼" },
    {
      label: "Income Entries",
      value: stats.totalIncomeEntries,
      emoji: "💰",
    },
    {
      label: "Expense Entries",
      value: stats.totalExpenseEntries,
      emoji: "🧾",
    },
    {
      label: "Platform Income",
      value: formatCurrency(stats.platformIncome),
      emoji: "📈",
    },
    {
      label: "Platform Expenses",
      value: formatCurrency(stats.platformExpenses),
      emoji: "📉",
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-brand-white">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-brand-card border border-brand-border rounded-xl p-4"
          >
            <span className="text-2xl">{card.emoji}</span>
            <p className="text-brand-muted text-xs mt-2">{card.label}</p>
            <p className="text-xl font-bold text-brand-white mt-1">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
