"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterSelectOption {
  label: string;
  value: string;
}

interface FilterSelectProps {
  options: FilterSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  triggerClassName?: string;
  placeholder?: string;
}

export default function FilterSelect({
  options,
  value,
  onValueChange,
  triggerClassName = "w-[160px] h-10 border-slate-200 rounded-xl text-sm font-medium bg-white shadow-none",
  placeholder = "Filter",
}: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="font-medium text-sm">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
