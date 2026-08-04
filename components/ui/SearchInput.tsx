"use client";

import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  icon?: React.ReactNode;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  debounceMs = 300,
  icon,
  className = "",
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, debounceMs);

  // Sync external value changes (e.g. reset from parent)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Push debounced value to parent
  useEffect(() => {
    if (localValue === value) return;
    onChange(debouncedValue);
  }, [debouncedValue, localValue, value, onChange]);

  return (
    <div className={`relative flex-1 ${className}`}>
      {icon ?? (
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      )}
      <Input
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="h-12 pl-12 bg-slate-50/50 border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
      />
    </div>
  );
}
