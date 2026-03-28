import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
export const listByUser = query({
    args: {
        startDate: v.optional(v.string()),
        endDate: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            return [];
        const userId = identity.subject;
        let entries = await ctx.db
            .query("expenses")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();
        if (args.startDate) {
            entries = entries.filter((e) => e.date >= args.startDate);
        }
        if (args.endDate) {
            entries = entries.filter((e) => e.date <= args.endDate);
        }
        return entries.sort((a, b) => b.date.localeCompare(a.date));
    },
});
export const listByHustle = query({
    args: { hustleId: v.id("hustles") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            return [];
        const entries = await ctx.db
            .query("expenses")
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
        if (!identity)
            return { total: 0, deductible: 0, byCategory: {} };
        const userId = identity.subject;
        const entries = await ctx.db
            .query("expenses")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();
        const filtered = entries.filter((e) => e.date >= args.startDate && e.date <= args.endDate);
        const total = filtered.reduce((sum, e) => sum + e.amount, 0);
        const deductible = filtered
            .filter((e) => e.isTaxDeductible)
            .reduce((sum, e) => sum + e.amount, 0);
        const byCategory = {};
        for (const entry of filtered) {
            byCategory[entry.category] =
                (byCategory[entry.category] || 0) + entry.amount;
        }
        return { total, deductible, byCategory };
    },
});
export const create = mutation({
    args: {
        hustleId: v.optional(v.id("hustles")),
        amount: v.number(),
        category: v.union(v.literal("gas"), v.literal("supplies"), v.literal("phone"), v.literal("tools"), v.literal("food"), v.literal("insurance"), v.literal("software"), v.literal("other")),
        date: v.string(),
        notes: v.optional(v.string()),
        isTaxDeductible: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            throw new Error("Not authenticated");
        return await ctx.db.insert("expenses", {
            userId: identity.subject,
            hustleId: args.hustleId,
            amount: args.amount,
            category: args.category,
            date: args.date,
            notes: args.notes,
            isTaxDeductible: args.isTaxDeductible,
            createdAt: Date.now(),
        });
    },
});
export const remove = mutation({
    args: { entryId: v.id("expenses") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            throw new Error("Not authenticated");
        const entry = await ctx.db.get(args.entryId);
        if (!entry || entry.userId !== identity.subject)
            throw new Error("Not found");
        await ctx.db.delete(args.entryId);
    },
});
