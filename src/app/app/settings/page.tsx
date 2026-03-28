"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { HUSTLE_CATEGORIES } from "@/lib/utils";

const EMOJI_OPTIONS = [
  "💰", "🚗", "🛒", "💻", "🔧", "✂️", "📦", "🎨", "📸", "🍕",
  "🏠", "🐕", "🧹", "📱", "🎵", "✍️", "🛠️", "🎯", "🌱", "💪",
];

const COLOR_OPTIONS = [
  "#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#6366f1",
];

export default function SettingsPage() {
  const hustles = useQuery(api.hustles.list);
  const createHustle = useMutation(api.hustles.create);
  const toggleActive = useMutation(api.hustles.toggleActive);
  const recurringEntries = useQuery(api.recurringIncome.list);
  const toggleRecurring = useMutation(api.recurringIncome.toggleActive);
  const removeRecurring = useMutation(api.recurringIncome.remove);

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("💰");
  const [color, setColor] = useState("#22c55e");
  const [category, setCategory] = useState<string>("other");
  const [saving, setSaving] = useState(false);

  async function handleAddHustle(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createHustle({
        name: name.trim(),
        emoji,
        color,
        category: category as "gig_work" | "freelance" | "service_business" | "sales" | "rental" | "other",
      });
      setName("");
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to create hustle:", error);
    } finally {
      setSaving(false);
    }
  }

  const daysOfWeek = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-brand-white">Settings</h1>

      {/* Manage hustles */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-brand-white">
            Your Hustles
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-brand-gold text-brand-black font-medium rounded-lg hover:bg-brand-gold-light transition-colors text-sm"
          >
            + Add Hustle
          </button>
        </div>

        {/* Add form */}
        {showAddForm && (
          <form
            onSubmit={handleAddHustle}
            className="bg-brand-card border border-brand-border rounded-xl p-4 mb-4 space-y-4"
          >
            <div>
              <label className="block text-sm text-brand-muted mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. DoorDash, Lawn Care, Etsy Shop"
                required
                className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-lg text-brand-white placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm text-brand-muted mb-2">
                Emoji
              </label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                      emoji === e
                        ? "bg-brand-gold/20 border-2 border-brand-gold"
                        : "bg-brand-dark border border-brand-border"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-brand-muted mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-10 h-10 rounded-full ${
                      color === c ? "ring-2 ring-brand-gold ring-offset-2 ring-offset-brand-black" : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-brand-muted mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-lg text-brand-white focus:outline-none focus:border-brand-gold"
              >
                {HUSTLE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="w-full py-3 bg-brand-gold text-brand-black font-semibold rounded-lg disabled:opacity-50"
            >
              {saving ? "Saving..." : "Add Hustle"}
            </button>
          </form>
        )}

        {/* Hustle list */}
        <div className="space-y-2">
          {hustles?.map((hustle) => (
            <div
              key={hustle._id}
              className={`flex items-center justify-between bg-brand-card border border-brand-border rounded-xl p-4 ${
                !hustle.isActive ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: hustle.color + "20" }}
                >
                  {hustle.emoji}
                </span>
                <div>
                  <p className="font-medium text-brand-white">{hustle.name}</p>
                  <p className="text-xs text-brand-muted">
                    {hustle.category.replace("_", " ")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleActive({ hustleId: hustle._id })}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  hustle.isActive
                    ? "bg-green-600/20 text-green-400"
                    : "bg-brand-border text-brand-muted"
                }`}
              >
                {hustle.isActive ? "Active" : "Inactive"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recurring income */}
      <div>
        <h2 className="text-lg font-semibold text-brand-white mb-3">
          Recurring Income
        </h2>
        {!recurringEntries || recurringEntries.length === 0 ? (
          <p className="text-brand-muted text-sm">
            No recurring income set up. Add one when logging income.
          </p>
        ) : (
          <div className="space-y-2">
            {recurringEntries.map((entry) => {
              const hustle = hustles?.find((h) => h._id === entry.hustleId);
              return (
                <div
                  key={entry._id}
                  className="flex items-center justify-between bg-brand-card border border-brand-border rounded-xl p-4"
                >
                  <div>
                    <p className="text-brand-white font-medium">
                      ${entry.amount.toFixed(2)} - {hustle?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-brand-muted">
                      {entry.frequency === "monthly"
                        ? `Monthly on the ${entry.dayOfMonth}`
                        : `${entry.frequency === "biweekly" ? "Every 2 weeks" : "Weekly"} on ${daysOfWeek[entry.dayOfWeek || 0]}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        toggleRecurring({ recurringId: entry._id })
                      }
                      className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        entry.isActive
                          ? "bg-green-600/20 text-green-400"
                          : "bg-brand-border text-brand-muted"
                      }`}
                    >
                      {entry.isActive ? "On" : "Off"}
                    </button>
                    <button
                      onClick={() => removeRecurring({ recurringId: entry._id })}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-red-600/20 text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
