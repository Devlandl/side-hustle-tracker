"use client";

type Period = "week" | "month" | "year";

interface PeriodToggleProps {
  value: Period;
  onChange: (period: Period) => void;
}

export default function PeriodToggle({ value, onChange }: PeriodToggleProps) {
  const options: { key: Period; label: string }[] = [
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "year", label: "This Year" },
  ];

  return (
    <div className="flex bg-brand-dark rounded-lg p-1 gap-1">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            value === opt.key
              ? "bg-brand-gold text-brand-black"
              : "text-brand-muted hover:text-brand-white"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
