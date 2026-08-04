"use client";

import { useState } from "react";
import { ChevronDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CollapsibleFilterPanelProps {
  children: React.ReactNode;
  triggerLabel?: string;
  defaultOpen?: boolean;
}

export default function CollapsibleFilterPanel({
  children,
  triggerLabel = "More Filters",
  defaultOpen = false,
}: CollapsibleFilterPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <Button
        variant="outline"
        className="h-10 px-4 gap-2 border-slate-200 text-slate-600 font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-slate-50 bg-white shadow-none transition-all"
        onClick={() => setOpen(!open)}
      >
        <Filter className="h-4 w-4" />
        {triggerLabel}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </Button>
      {open && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap gap-3">{children}</div>
        </div>
      )}
    </div>
  );
}
