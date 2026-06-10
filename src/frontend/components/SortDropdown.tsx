import React from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

export type SortOption = "Popular" | "Newest" | "Alphabetical";

interface SortDropdownProps {
  currentSort: SortOption;
  onChange: (option: SortOption) => void;
}

export default function SortDropdown({ currentSort, onChange }: SortDropdownProps) {
  return (
    <div className="relative inline-flex items-center">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
        <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
      </div>
      <select
        id="project-sort-select"
        value={currentSort}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="px-3.5 py-2.5 bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-indigo-500/20 text-slate-350 hover:text-white rounded-xl transition-all duration-300 cursor-pointer text-xs font-semibold font-mono focus:outline-none appearance-none pr-9 pl-9 select-none"
      >
        <option value="Popular" className="bg-[#0b0b14] text-white">Popularity / Order</option>
        <option value="Newest" className="bg-[#0b0b14] text-white">Newest Release</option>
        <option value="Alphabetical" className="bg-[#0b0b14] text-white">Alphabetical</option>
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
      </div>
    </div>
  );
}
