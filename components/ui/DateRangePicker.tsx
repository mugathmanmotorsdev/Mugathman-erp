"use client";

import * as React from "react";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  value?: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Reusable shadcn date-range picker (calendar popover, not browser input).
 * Used to filter the sales list and drive both PDF exports.
 */
export function DateRangePicker({
  value,
  onChange,
  placeholder = "Filter by date range",
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const label = value?.from
    ? value.to
      ? `${format(value.from, "dd MMM yyyy")} — ${format(value.to, "dd MMM yyyy")}`
      : format(value.from, "dd MMM yyyy")
    : placeholder;

  const applyPreset = (preset: "today" | "7d" | "30d" | "quarter") => {
    const now = new Date();
    if (preset === "today") {
      onChange({ from: startOfDay(now), to: endOfDay(now) });
    } else if (preset === "7d") {
      onChange({ from: startOfDay(subDays(now, 6)), to: endOfDay(now) });
    } else if (preset === "30d") {
      onChange({ from: startOfDay(subDays(now, 29)), to: endOfDay(now) });
    } else {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      onChange({
        from: startOfDay(new Date(now.getFullYear(), quarterStartMonth, 1)),
        to: endOfDay(now),
      });
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-12 justify-start gap-2 rounded-xl border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-none",
              !value?.from && "text-slate-400"
            )}
          >
            <CalendarIcon className="h-4 w-4 text-slate-400" />
            <span className="truncate">{label}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-wrap gap-1 border-b border-slate-100 p-2">
            <Button variant="ghost" size="sm" onClick={() => applyPreset("today")}>
              Today
            </Button>
            <Button variant="ghost" size="sm" onClick={() => applyPreset("7d")}>
              Last 7 days
            </Button>
            <Button variant="ghost" size="sm" onClick={() => applyPreset("30d")}>
              Last 30 days
            </Button>
            <Button variant="ghost" size="sm" onClick={() => applyPreset("quarter")}>
              This quarter
            </Button>
          </div>
          <Calendar
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
          />
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 p-2">
            <Button variant="ghost" size="sm" onClick={() => onChange(undefined)}>
              Clear
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {value?.from && (
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 shrink-0 rounded-xl"
          onClick={() => onChange(undefined)}
          aria-label="Clear date range"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
