"use client";

import { useState } from "react";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
}

export default function CurrencyInput({
  value,
  onChange,
  placeholder = "0.00",
}: CurrencyInputProps) {
  const [display, setDisplay] = useState(value > 0 ? value.toFixed(2) : "");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    setDisplay(raw);
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      onChange(parsed);
    } else {
      onChange(0);
    }
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-lg">
        $
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-8 pr-4 py-3 bg-brand-dark border border-brand-border rounded-lg text-brand-white text-lg focus:outline-none focus:border-brand-gold"
      />
    </div>
  );
}
