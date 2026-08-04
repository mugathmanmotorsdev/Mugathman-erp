"use client";

import { Button } from "@/components/ui/button";

interface StatusFilterOption {
  label: string;
  value: string;
}

interface StatusFilterProps {
  options: StatusFilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function StatusFilter({
  options,
  value,
  onChange,
  className = "",
}: StatusFilterProps) {
  return (
    <div className={`flex gap-2 flex-wrap ${className}`}>
      {options.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? "default" : "outline"}
          className={`h-10 px-4 rounded-xl font-bold text-sm transition-all ${
            value === option.value
              ? "bg-[#150150] hover:bg-[#150150]/90 text-white"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
