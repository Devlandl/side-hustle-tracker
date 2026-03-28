import { internalAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
// Gather users who need quarterly tax reminders
export const checkQuarterlyReminders = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = new Date();
        const today = now.toISOString().split("T")[0];
        const year = now.getFullYear();
        // Due dates and their 7-day-before windows
        const dueDates = [
            `${year}-04-08`, // 7 days before April 15
            `${year}-06-08`, // 7 days before June 15
            `${year}-09-08`, // 7 days before Sept 15
            `${year + 1}-01-08`, // 7 days before Jan 15
        ];
        if (!dueDates.includes(today))
            return;
        const allTaxSettings = await ctx.db.query("taxSettings").collect();
        const allProfiles = await ctx.db.query("userProfiles").collect();
        for (const settings of allTaxSettings) {
            const profile = allProfiles.find((p) => p.userId === settings.userId);
            if (!profile)
                continue;
            if (profile.taxRemindersEnabled === false)
                continue;
            // Calculate their estimated tax
            const incomeEntries = await ctx.db
                .query("incomeEntries")
                .withIndex("by_userId", (q) => q.eq("userId", settings.userId))
                .collect();
            const expenses = await ctx.db
                .query("expenses")
                .withIndex("by_userId", (q) => q.eq("userId", settings.userId))
                .collect();
            const yearStart = `${year}-01-01`;
            const yearIncome = incomeEntries
                .filter((e) => e.date >= yearStart)
                .reduce((sum, e) => sum + e.amount, 0);
            const yearDeductions = expenses
                .filter((e) => e.date >= yearStart && e.isTaxDeductible)
                .reduce((sum, e) => sum + e.amount, 0);
            const taxableIncome = Math.max(yearIncome - yearDeductions, 0);
            const quarterlyAmount = (taxableIncome * (settings.taxRate / 100)) / 4;
            // Schedule the email send
            await ctx.scheduler.runAfter(0, internal.reminders.sendTaxReminder, {
                email: profile.email,
                name: profile.name,
                quarterlyAmount,
                taxRate: settings.taxRate,
            });
        }
    },
});
export const sendTaxReminder = internalAction({
    args: {
        email: v.string(),
        name: v.string(),
        quarterlyAmount: v.number(),
        taxRate: v.number(),
    },
    handler: async (ctx, args) => {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: "Side Hustle Tracker <noreply@hustletracker.fun>",
                to: args.email,
                subject: "Quarterly Tax Reminder - Side Hustle Tracker",
                html: `
          <div style="background:#0A0A0A;color:#F5F5F5;padding:32px;font-family:sans-serif;max-width:500px;">
            <h1 style="color:#C9A84C;margin-bottom:8px;">Tax Payment Due Soon</h1>
            <p>Hey ${args.name},</p>
            <p>Your quarterly estimated tax payment is due in 7 days.</p>
            <div style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:12px;padding:20px;margin:20px 0;">
              <p style="color:#888;font-size:12px;margin:0;">Estimated Payment</p>
              <p style="color:#C9A84C;font-size:28px;font-weight:bold;margin:4px 0;">$${args.quarterlyAmount.toFixed(2)}</p>
              <p style="color:#888;font-size:12px;margin:0;">Based on your ${args.taxRate}% tax rate</p>
            </div>
            <p>Log in to review your full tax summary.</p>
            <p style="color:#888;font-size:12px;margin-top:24px;">Side Hustle Tracker - A TVR App Store Product</p>
          </div>
        `,
            }),
        });
        if (!res.ok) {
            console.error("Failed to send tax reminder:", await res.text());
        }
    },
});
