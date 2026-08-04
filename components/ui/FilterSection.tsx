"use client";

import { ReactNode } from "react";
import SearchInput from "./SearchInput";
import FilterBar from "./FilterBar";

interface FilterSectionProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterControls?: ReactNode;
  debounceMs?: number;
}

export default function FilterSection({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filterControls,
  debounceMs = 300,
}: FilterSectionProps) {
  return (
    <FilterBar>
      <SearchInput
        value={searchValue}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        debounceMs={debounceMs}
      />
      {filterControls && <div className="flex items-center gap-2">{filterControls}</div>}
    </FilterBar>
  );
}
