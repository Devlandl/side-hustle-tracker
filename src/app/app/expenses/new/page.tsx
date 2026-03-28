"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import CurrencyInput from "@/components/ui/currency-input";
import { getTodayString, EXPENSE_CATEGORIES } from "@/lib/utils";
import { Id } from "../../../../../convex/_generated/dataModel";

type ExpenseCategory =
  | "gas"
  | "supplies"
  | "phone"
  | "tools"
  | "food"
  | "insurance"
  | "software"
  | "other";

export default function AddExpensePage() {
  const router = useRouter();
  const hustles = useQuery(api.hustles.list);
  const createExpense = useMutation(api.expenses.create);

  const [hustleId, setHustleId] = useState<string>("general");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState<ExpenseCategory>("other");
  const [date, setDate] = useState(getTodayString());
  const [notes, setNotes] = useState("");
  const [isTaxDeductible, setIsTaxDeductible] = useState(true);
  const [saving, setSaving] = useState(false);

  const activeHustles = hustles?.filter((h) => h.isActive) || [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (amount <= 0) return;
    setSaving(true);
    try {
      await createExpense({
        hustleId:
          hustleId === "general"
            ? undefined
            : (hustleId as Id<"hustles">),
        amount,
        category,
        date,
        notes: notes || undefined,
        isTaxDeductible,
      });
      router.push("/app");
    } catch (error) {
      console.error("Failed to save expense:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-brand-white mb-6">Add Expense</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Hustle or general */}
        <div>
          <label className="block text-sm text-brand-muted mb-1">
            Tied to a hustle?
          </label>
          <select
            value={hustleId}
            onChange={(e) => setHustleId(e.target.value)}
            className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-lg text-brand-white focus:outline-none focus:border-brand-gold"
          >
            <option value="general">General (shared across all)</option>
            {activeHustles.map((h) => (
              <option key={h._id} value={h._id}>
                {h.emoji} {h.name}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm text-brand-muted mb-1">Amount</label>
          <CurrencyInput value={amount} onChange={setAmount} />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm text-brand-muted mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-lg text-brand-white focus:outline-none focus:border-brand-gold"
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm text-brand-muted mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-lg text-brand-white focus:outline-none focus:border-brand-gold"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm text-brand-muted mb-1">
            Notes (optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. gas for deliveries"
            className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-lg text-brand-white placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-gold"
          />
        </div>

        {/* Tax deductible toggle */}
        <div className="flex items-center justify-between bg-brand-card border border-brand-border rounded-lg p-4">
          <div>
            <p className="text-brand-white font-medium">Tax deductible</p>
            <p className="text-xs text-brand-muted">
              Count this against your taxable income
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsTaxDeductible(!isTaxDeductible)}
            className={`w-12 h-7 rounded-full transition-colors ${
              isTaxDeductible ? "bg-brand-gold" : "bg-brand-border"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                isTaxDeductible ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving || amount <= 0}
          className="w-full py-3 bg-brand-gold text-brand-black font-semibold rounded-lg hover:bg-brand-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Add Expense"}
        </button>
      </form>
    </div>
  );
}
