import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
export const list = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            return [];
        return await ctx.db
            .query("recurringIncome")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .collect();
    },
});
export const create = mutation({
    args: {
        hustleId: v.id("hustles"),
        amount: v.number(),
        frequency: v.union(v.literal("weekly"), v.literal("biweekly"), v.literal("monthly")),
        dayOfWeek: v.optional(v.number()),
        dayOfMonth: v.optional(v.number()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            throw new Error("Not authenticated");
        return await ctx.db.insert("recurringIncome", {
            userId: identity.subject,
            hustleId: args.hustleId,
            amount: args.amount,
            frequency: args.frequency,
            dayOfWeek: args.dayOfWeek,
            dayOfMonth: args.dayOfMonth,
            notes: args.notes,
            isActive: true,
            createdAt: Date.now(),
        });
    },
});
export const toggleActive = mutation({
    args: { recurringId: v.id("recurringIncome") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            throw new Error("Not authenticated");
        const entry = await ctx.db.get(args.recurringId);
        if (!entry || entry.userId !== identity.subject)
            throw new Error("Not found");
        await ctx.db.patch(args.recurringId, { isActive: !entry.isActive });
    },
});
export const remove = mutation({
    args: { recurringId: v.id("recurringIncome") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            throw new Error("Not authenticated");
        const entry = await ctx.db.get(args.recurringId);
        if (!entry || entry.userId !== identity.subject)
            throw new Error("Not found");
        await ctx.db.delete(args.recurringId);
    },
});
