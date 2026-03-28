"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import ProgressBar from "@/components/ui/progress-bar";
import CurrencyInput from "@/components/ui/currency-input";
import EmptyState from "@/components/ui/empty-state";
import {
  formatCurrency,
  getStartOfMonth,
  getStartOfYear,
  getTodayString,
} from "@/lib/utils";
import { Id } from "../../../../convex/_generated/dataModel";

export default function GoalsPage() {
  const goals = useQuery(api.goals.list);
  const hustles = useQuery(api.hustles.list);
  const upsertGoal = useMutation(api.goals.upsert);
  const removeGoal = useMutation(api.goals.remove);

  const today = getTodayString();
  const monthlyIncome = useQuery(api.incomeEntries.totalByPeriod, {
    startDate: getStartOfMonth(),
    endDate: today,
  });
  const yearlyIncome = useQuery(api.incomeEntries.totalByPeriod, {
    startDate: getStartOfYear(),
    endDate: today,
  });

  const [showForm, setShowForm] = useState(false);
  const [editGoalId, setEditGoalId] = useState<Id<"goals"> | null>(null);
  const [targetAmount, setTargetAmount] = useState(0);
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [hustleId, setHustleId] = useState<string>("overall");
  const [saving, setSaving] = useState(false);

  const activeHustles = hustles?.filter((h) => h.isActive) || [];

  function openAddForm() {
    setEditGoalId(null);
    setTargetAmount(0);
    setPeriod("monthly");
    setHustleId("overall");
    setShowForm(true);
  }

  function openEditForm(goal: NonNullable<typeof goals>[number]) {
    setEditGoalId(goal._id);
    setTargetAmount(goal.targetAmount);
    setPeriod(goal.period);
    setHustleId(goal.hustleId || "overall");
    setShowForm(true);
  }

  async function handleSave() {
    if (targetAmount <= 0) return;
    setSaving(true);
    try {
      await upsertGoal({
        goalId: editGoalId || undefined,
        hustleId:
          hustleId === "overall"
            ? undefined
            : (hustleId as Id<"hustles">),
        targetAmount,
        period,
      });
      setShowForm(false);
    } catch (error) {
      console.error("Failed to save goal:", error);
    } finally {
      setSaving(false);
    }
  }

  function getProgress(goal: NonNullable<typeof goals>[number]) {
    if (goal.period === "monthly") {
      if (goal.hustleId) {
        return monthlyIncome?.byHustle[goal.hustleId] || 0;
      }
      return monthlyIncome?.total || 0;
    }
    if (goal.hustleId) {
      return yearlyIncome?.byHustle[goal.hustleId] || 0;
    }
    return yearlyIncome?.total || 0;
  }

  function getHustleName(id: Id<"hustles"> | undefined) {
    if (!id) return "All Hustles";
    const hustle = hustles?.find((h) => h._id === id);
    return hustle ? `${hustle.emoji} ${hustle.name}` : "Unknown";
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-white">Goals</h1>
        <button
          onClick={openAddForm}
          className="px-4 py-2 bg-brand-gold text-brand-black font-medium rounded-lg hover:bg-brand-gold-light transition-colors"
        >
          + New Goal
        </button>
      </div>

      {/* Goal form */}
      {showForm && (
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 space-y-4">
          <h2 className="font-semibold text-brand-white">
            {editGoalId ? "Edit Goal" : "New Goal"}
          </h2>

          <div>
            <label className="block text-sm text-brand-muted mb-1">
              Target Amount
            </label>
            <CurrencyInput value={targetAmount} onChange={setTargetAmount} />
          </div>

          <div>
            <label className="block text-sm text-brand-muted mb-1">
              Period
            </label>
            <select
              value={period}
              onChange={(e) =>
                setPeriod(e.target.value as "monthly" | "yearly")
              }
              className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-lg text-brand-white focus:outline-none focus:border-brand-gold"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-brand-muted mb-1">
              For which hustle?
            </label>
            <select
              value={hustleId}
              onChange={(e) => setHustleId(e.target.value)}
              className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-lg text-brand-white focus:outline-none focus:border-brand-gold"
            >
              <option value="overall">All hustles combined</option>
              {activeHustles.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.emoji} {h.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || targetAmount <= 0}
              className="flex-1 py-3 bg-brand-gold text-brand-black font-semibold rounded-lg disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Goal"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-3 text-brand-muted hover:text-brand-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Goals list */}
      {!goals || goals.length === 0 ? (
        !showForm && (
          <EmptyState
            emoji="🎯"
            title="No goals yet"
            description="Set an earnings target to stay motivated and track your progress."
          />
        )
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = getProgress(goal);
            const percent =
              goal.targetAmount > 0
                ? Math.min((progress / goal.targetAmount) * 100, 100)
                : 0;
            return (
              <div
                key={goal._id}
                className="bg-brand-card border border-brand-border rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-brand-white font-medium">
                      {getHustleName(goal.hustleId)}
                    </p>
                    <p className="text-xs text-brand-muted">
                      {goal.period === "monthly" ? "Monthly" : "Yearly"} goal
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditForm(goal)}
                      className="text-brand-muted hover:text-brand-gold text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeGoal({ goalId: goal._id })}
                      className="text-brand-muted hover:text-red-400 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <ProgressBar
                  value={progress}
                  max={goal.targetAmount}
                />
                {percent >= 100 && (
                  <p className="text-brand-gold text-sm mt-2 font-medium">
                    Goal reached!
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
