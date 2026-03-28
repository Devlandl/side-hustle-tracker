export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function getTodayString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

export function getStartOfWeek(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day;
  const start = new Date(now.setDate(diff));
  return start.toISOString().split("T")[0];
}

export function getStartOfMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

export function getStartOfYear(): string {
  return `${new Date().getFullYear()}-01-01`;
}

export function getDateRangeForPeriod(
  period: "week" | "month" | "year"
): { start: string; end: string } {
  const end = getTodayString();
  let start: string;
  switch (period) {
    case "week":
      start = getStartOfWeek();
      break;
    case "month":
      start = getStartOfMonth();
      break;
    case "year":
      start = getStartOfYear();
      break;
  }
  return { start, end };
}

export const HUSTLE_CATEGORIES = [
  { value: "gig_work", label: "Gig Work" },
  { value: "freelance", label: "Freelance" },
  { value: "service_business", label: "Service Business" },
  { value: "sales", label: "Sales" },
  { value: "rental", label: "Rental" },
  { value: "other", label: "Other" },
] as const;

export const EXPENSE_CATEGORIES = [
  { value: "gas", label: "Gas" },
  { value: "supplies", label: "Supplies" },
  { value: "phone", label: "Phone" },
  { value: "tools", label: "Tools" },
  { value: "food", label: "Food" },
  { value: "insurance", label: "Insurance" },
  { value: "software", label: "Software" },
  { value: "other", label: "Other" },
] as const;

export const ADMIN_EMAILS = [
  "devland0831@gmail.com",
  // Add Iceman's email
  // Add Doc Maasi's email
];
