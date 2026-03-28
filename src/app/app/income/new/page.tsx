"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import CurrencyInput from "@/components/ui/currency-input";
import { getTodayString } from "@/lib/utils";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function AddIncomePage() {
  const router = useRouter();
  const hustles = useQuery(api.hustles.list);
  const createIncome = useMutation(api.incomeEntries.create);
  const createRecurring = useMutation(api.recurringIncome.create);

  const [hustleId, setHustleId] = useState<string>("");
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(getTodayString());
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<
    "weekly" | "biweekly" | "monthly"
  >("weekly");
  const [dayOfWeek, setDayOfWeek] = useState(5); // Friday
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [saving, setSaving] = useState(false);

  const activeHustles = hustles?.filter((h) => h.isActive) || [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hustleId || amount <= 0) return;
    setSaving(true);
    try {
      let recurringId: Id<"recurringIncome"> | undefined;

      if (isRecurring) {
        recurringId = await createRecurring({
          hustleId: hustleId as Id<"hustles">,
          amount,
          frequency,
          dayOfWeek: frequency !== "monthly" ? dayOfWeek : undefined,
          dayOfMonth: frequency === "monthly" ? dayOfMonth : undefined,
          notes: notes || undefined,
        });
      }

      await createIncome({
        hustleId: hustleId as Id<"hustles">,
        amount,
        date,
        notes: notes || undefined,
        isRecurring,
        recurringId,
      });

      router.push("/app");
    } catch (error) {
      console.error("Failed to save income:", error);
    } finally {
      setSaving(false);
    }
  }

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-brand-white mb-6">Add Income</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Hustle picker */}
        <div>
          <label className="block text-sm text-brand-muted mb-1">Hustle</label>
          <select
            value={hustleId}
            onChange={(e) => setHustleId(e.target.value)}
            required
            className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-lg text-brand-white focus:outline-none focus:border-brand-gold"
          >
            <option value="">Select a hustle</option>
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
            placeholder="e.g. 3 deliveries tonight"
            className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-lg text-brand-white placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-gold"
          />
        </div>

        {/* Recurring toggle */}
        <div className="flex items-center justify-between bg-brand-card border border-brand-border rounded-lg p-4">
          <div>
            <p className="text-brand-white font-medium">Make recurring</p>
            <p className="text-xs text-brand-muted">Auto-log this amount on a schedule</p>
          </div>
          <button
            type="button"
            onClick={() => setIsRecurring(!isRecurring)}
            className={`w-12 h-7 rounded-full transition-colors ${
              isRecurring ? "bg-brand-gold" : "bg-brand-border"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                isRecurring ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Recurring options */}
        {isRecurring && (
          <div className="space-y-3 pl-4 border-l-2 border-brand-gold/30">
            <div>
              <label className="block text-sm text-brand-muted mb-1">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) =>
                  setFrequency(
                    e.target.value as "weekly" | "biweekly" | "monthly"
                  )
                }
                className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-lg text-brand-white focus:outline-none focus:border-brand-gold"
              >
                <option value="weekly">Every week</option>
                <option value="biweekly">Every 2 weeks</option>
                <option value="monthly">Every month</option>
              </select>
            </div>

            {frequency !== "monthly" ? (
              <div>
                <label className="block text-sm text-brand-muted mb-1">
                  Day of week
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-lg text-brand-white focus:outline-none focus:border-brand-gold"
                >
                  {daysOfWeek.map((day, i) => (
                    <option key={i} value={i}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm text-brand-muted mb-1">
                  Day of month
                </label>
                <select
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-lg text-brand-white focus:outline-none focus:border-brand-gold"
                >
                  {Array.from({ length: 28 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={saving || !hustleId || amount <= 0}
          className="w-full py-3 bg-brand-gold text-brand-black font-semibold rounded-lg hover:bg-brand-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Add Income"}
        </button>
      </form>
    </div>
  );
}
