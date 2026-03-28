import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    return await ctx.db
      .query("hustles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getById = query({
  args: { hustleId: v.id("hustles") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const hustle = await ctx.db.get(args.hustleId);
    if (!hustle || hustle.userId !== identity.subject) return null;
    return hustle;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    emoji: v.string(),
    color: v.string(),
    category: v.union(
      v.literal("gig_work"),
      v.literal("freelance"),
      v.literal("service_business"),
      v.literal("sales"),
      v.literal("rental"),
      v.literal("other")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("hustles", {
      userId: identity.subject,
      name: args.name,
      emoji: args.emoji,
      color: args.color,
      category: args.category,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    hustleId: v.id("hustles"),
    name: v.optional(v.string()),
    emoji: v.optional(v.string()),
    color: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("gig_work"),
        v.literal("freelance"),
        v.literal("service_business"),
        v.literal("sales"),
        v.literal("rental"),
        v.literal("other")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const hustle = await ctx.db.get(args.hustleId);
    if (!hustle || hustle.userId !== identity.subject)
      throw new Error("Not found");
    const { hustleId, ...updates } = args;
    await ctx.db.patch(hustleId, updates);
  },
});

export const toggleActive = mutation({
  args: { hustleId: v.id("hustles") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const hustle = await ctx.db.get(args.hustleId);
    if (!hustle || hustle.userId !== identity.subject)
      throw new Error("Not found");
    await ctx.db.patch(args.hustleId, { isActive: !hustle.isActive });
  },
});
