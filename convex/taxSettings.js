import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
export const get = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            return null;
        return await ctx.db
            .query("taxSettings")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .first();
    },
});
export const upsert = mutation({
    args: { taxRate: v.number() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            throw new Error("Not authenticated");
        const userId = identity.subject;
        const existing = await ctx.db
            .query("taxSettings")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first();
        if (existing) {
            await ctx.db.patch(existing._id, {
                taxRate: args.taxRate,
                updatedAt: Date.now(),
            });
        }
        else {
            await ctx.db.insert("taxSettings", {
                userId,
                taxRate: args.taxRate,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
        }
    },
});
