import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
    hustles: defineTable({
        userId: v.string(),
        name: v.string(),
        emoji: v.string(),
        color: v.string(),
        category: v.union(v.literal("gig_work"), v.literal("freelance"), v.literal("service_business"), v.literal("sales"), v.literal("rental"), v.literal("other")),
        isActive: v.boolean(),
        createdAt: v.number(),
    }).index("by_userId", ["userId"]),
    incomeEntries: defineTable({
        userId: v.string(),
        hustleId: v.id("hustles"),
        amount: v.number(),
        date: v.string(),
        notes: v.optional(v.string()),
        isRecurring: v.boolean(),
        recurringId: v.optional(v.id("recurringIncome")),
        createdAt: v.number(),
    })
        .index("by_userId", ["userId"])
        .index("by_hustleId", ["hustleId"])
        .index("by_userId_date", ["userId", "date"]),
    recurringIncome: defineTable({
        userId: v.string(),
        hustleId: v.id("hustles"),
        amount: v.number(),
        frequency: v.union(v.literal("weekly"), v.literal("biweekly"), v.literal("monthly")),
        dayOfWeek: v.optional(v.number()),
        dayOfMonth: v.optional(v.number()),
        notes: v.optional(v.string()),
        isActive: v.boolean(),
        createdAt: v.number(),
    }).index("by_userId", ["userId"]),
    expenses: defineTable({
        userId: v.string(),
        hustleId: v.optional(v.id("hustles")),
        amount: v.number(),
        category: v.union(v.literal("gas"), v.literal("supplies"), v.literal("phone"), v.literal("tools"), v.literal("food"), v.literal("insurance"), v.literal("software"), v.literal("other")),
        date: v.string(),
        notes: v.optional(v.string()),
        isTaxDeductible: v.boolean(),
        createdAt: v.number(),
    })
        .index("by_userId", ["userId"])
        .index("by_hustleId", ["hustleId"])
        .index("by_userId_date", ["userId", "date"]),
    taxSettings: defineTable({
        userId: v.string(),
        taxRate: v.number(),
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index("by_userId", ["userId"]),
    goals: defineTable({
        userId: v.string(),
        hustleId: v.optional(v.id("hustles")),
        targetAmount: v.number(),
        period: v.union(v.literal("monthly"), v.literal("yearly")),
        createdAt: v.number(),
    }).index("by_userId", ["userId"]),
    userProfiles: defineTable({
        userId: v.string(),
        name: v.string(),
        email: v.string(),
        reminderDay: v.optional(v.number()),
        taxRemindersEnabled: v.optional(v.boolean()),
        createdAt: v.number(),
    }).index("by_userId", ["userId"]),
});
