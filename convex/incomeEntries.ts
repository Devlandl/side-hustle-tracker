import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByUser = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    let entries = await ctx.db
      .query("incomeEntries")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    if (args.startDate) {
      entries = entries.filter((e) => e.date >= args.startDate!);
    }
    if (args.endDate) {
      entries = entries.filter((e) => e.date <= args.endDate!);
    }
    return entries.sort((a, b) => b.date.localeCompare(a.date));
  },
});

export const listByHustle = query({
  args: { hustleId: v.id("hustles") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const entries = await ctx.db
      .query("incomeEntries")
      .withIndex("by_hustleId", (q) => q.eq("hustleId", args.hustleId))
      .collect();
    return entries
      .filter((e) => e.userId === identity.subject)
      .sort((a, b) => b.date.localeCompare(a.date));
  },
});

export const totalByPeriod = query({
  args: { startDate: v.string(), endDate: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { total: 0, byHustle: {} };
    const userId = identity.subject;
    const entries = await ctx.db
      .query("incomeEntries")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    const filtered = entries.filter(
      (e) => e.date >= args.startDate && e.date <= args.endDate
    );
    const total = filtered.reduce((sum, e) => sum + e.amount, 0);
    const byHustle: Record<string, number> = {};
    for (const entry of filtered) {
      const key = entry.hustleId;
      byHustle[key] = (byHustle[key] || 0) + entry.amount;
    }
    return { total, byHustle };
  },
});

export const create = mutation({
  args: {
    hustleId: v.id("hustles"),
    amount: v.number(),
    date: v.string(),
    notes: v.optional(v.string()),
    isRecurring: v.boolean(),
    recurringId: v.optional(v.id("recurringIncome")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("incomeEntries", {
      userId: identity.subject,
      hustleId: args.hustleId,
      amount: args.amount,
      date: args.date,
      notes: args.notes,
      isRecurring: args.isRecurring,
      recurringId: args.recurringId,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { entryId: v.id("incomeEntries") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const entry = await ctx.db.get(args.entryId);
    if (!entry || entry.userId !== identity.subject)
      throw new Error("Not found");
    await ctx.db.delete(args.entryId);
  },
});
