"use client";

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showAmount?: boolean;
  formatValue?: (n: number) => string;
}

export default function ProgressBar({
  value,
  max,
  label,
  showAmount = true,
  formatValue = (n) => `$${n.toLocaleString()}`,
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className="w-full">
      {(label || showAmount) && (
        <div className="flex justify-between text-sm mb-1">
          {label && <span className="text-brand-muted">{label}</span>}
          {showAmount && (
            <span className="text-brand-white">
              {formatValue(value)} / {formatValue(max)}
            </span>
          )}
        </div>
      )}
      <div className="w-full h-3 bg-brand-border rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-gold rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
