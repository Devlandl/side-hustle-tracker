import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
export const list = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            return [];
        return await ctx.db
            .query("goals")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .collect();
    },
});
export const upsert = mutation({
    args: {
        goalId: v.optional(v.id("goals")),
        hustleId: v.optional(v.id("hustles")),
        targetAmount: v.number(),
        period: v.union(v.literal("monthly"), v.literal("yearly")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            throw new Error("Not authenticated");
        if (args.goalId) {
            const goal = await ctx.db.get(args.goalId);
            if (!goal || goal.userId !== identity.subject)
                throw new Error("Not found");
            await ctx.db.patch(args.goalId, {
                targetAmount: args.targetAmount,
                period: args.period,
                hustleId: args.hustleId,
            });
        }
        else {
            await ctx.db.insert("goals", {
                userId: identity.subject,
                hustleId: args.hustleId,
                targetAmount: args.targetAmount,
                period: args.period,
                createdAt: Date.now(),
            });
        }
    },
});
export const remove = mutation({
    args: { goalId: v.id("goals") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            throw new Error("Not authenticated");
        const goal = await ctx.db.get(args.goalId);
        if (!goal || goal.userId !== identity.subject)
            throw new Error("Not found");
        await ctx.db.delete(args.goalId);
    },
});
