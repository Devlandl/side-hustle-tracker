import { query } from "./_generated/server";

const ADMIN_EMAILS = [
  "devland0831@gmail.com",
  // Add Iceman's email
  // Add Doc Maasi's email
];

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    return ADMIN_EMAILS.includes(identity.email || "");
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !ADMIN_EMAILS.includes(identity.email || "")) {
      return null;
    }

    const profiles = await ctx.db.query("userProfiles").collect();
    const hustles = await ctx.db.query("hustles").collect();
    const incomeEntries = await ctx.db.query("incomeEntries").collect();
    const expenses = await ctx.db.query("expenses").collect();

    const totalIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const uniqueUsers = new Set(hustles.map((h) => h.userId)).size;

    return {
      totalUsers: profiles.length || uniqueUsers,
      totalHustles: hustles.length,
      totalIncomeEntries: incomeEntries.length,
      totalExpenseEntries: expenses.length,
      platformIncome: totalIncome,
      platformExpenses: totalExpenses,
    };
  },
});
