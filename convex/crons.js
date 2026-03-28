import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
// Process recurring income entries daily at midnight
export const processRecurringIncome = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = new Date();
        const today = now.toISOString().split("T")[0];
        const dayOfWeek = now.getDay(); // 0 = Sunday
        const dayOfMonth = now.getDate();
        const allRecurring = await ctx.db
            .query("recurringIncome")
            .collect();
        const activeRecurring = allRecurring.filter((r) => r.isActive);
        for (const recurring of activeRecurring) {
            let shouldLog = false;
            if (recurring.frequency === "weekly") {
                shouldLog = recurring.dayOfWeek === dayOfWeek;
            }
            else if (recurring.frequency === "biweekly") {
                // Simple biweekly: check if it's the right day and an even week
                const weekNumber = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) /
                    (7 * 24 * 60 * 60 * 1000));
                shouldLog =
                    recurring.dayOfWeek === dayOfWeek && weekNumber % 2 === 0;
            }
            else if (recurring.frequency === "monthly") {
                shouldLog = recurring.dayOfMonth === dayOfMonth;
            }
            if (shouldLog) {
                // Check we haven't already logged today for this recurring entry
                const existing = await ctx.db
                    .query("incomeEntries")
                    .withIndex("by_userId", (q) => q.eq("userId", recurring.userId))
                    .collect();
                const alreadyLogged = existing.some((e) => e.recurringId === recurring._id && e.date === today);
                if (!alreadyLogged) {
                    await ctx.db.insert("incomeEntries", {
                        userId: recurring.userId,
                        hustleId: recurring.hustleId,
                        amount: recurring.amount,
                        date: today,
                        notes: recurring.notes,
                        isRecurring: true,
                        recurringId: recurring._id,
                        createdAt: Date.now(),
                    });
                }
            }
        }
    },
});
const crons = cronJobs();
crons.daily("process recurring income", { hourUTC: 5, minuteUTC: 0 }, // midnight EST
internal.crons.processRecurringIncome);
crons.daily("check quarterly tax reminders", { hourUTC: 14, minuteUTC: 0 }, // 9am EST
internal.reminders.checkQuarterlyReminders);
export default crons;
