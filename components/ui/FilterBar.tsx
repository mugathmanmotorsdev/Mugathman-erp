"use client";

import { ReactNode } from "react";

interface FilterBarProps {
  children: ReactNode;
  className?: string;
}

export default function FilterBar({ children, className = "" }: FilterBarProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 ${className}`}
    >
      <div className="flex flex-col md:flex-row gap-4">{children}</div>
    </div>
  );
}
