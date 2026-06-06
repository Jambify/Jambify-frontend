import React from "react";
import { cn } from "../../lib/utils/utils";
import type { Filters } from "../../Pages/PastQuestions";

interface FilterBarProps {
  filters: Filters;
  subjects: string[];
  years: string[];
  topics: string[];
  onChange: (next: Partial<Filters>) => void;
}

const SelectFilter: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  active: boolean;
}> = ({ label, value, options, onChange, active }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "rounded-brand cursor-pointer appearance-none border py-2 pr-8 pl-3 text-xs font-medium transition-all",
        "bg-bgSurface focus:outline-none",
        active
          ? "border-brand text-brand-light bg-brand/10"
          : "border-borderMuted text-textMuted hover:text-textMain hover:border-white/15",
      )}
    >
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-bgCard text-textMain">
          {opt === "All" ? `${label}: All` : opt}
        </option>
      ))}
    </select>
    <div className="text-textDim pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[10px]">
      ▼
    </div>
  </div>
);

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  subjects,
  years,
  topics,
  onChange,
}) => {
  const hasActiveFilters =
    filters.subject !== "All" ||
    filters.year !== "All" ||
    filters.topic !== "All" ||
    filters.difficulty !== "All" ||
    filters.search !== "";

  return (
    <div className="mb-4">
      {/* <Search input */}
      <div className="relative mb-3">
        <svg
          className="text-textDim absolute top-1/2 left-3 -translate-y-1/2"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search questions or topics..."
          className="bg-bgSurface border-borderMuted rounded-brand text-textMain placeholder:text-textDim focus:border-brand/40 w-full border py-2.5 pr-4 pl-9 text-sm transition-colors focus:outline-none"
        />
        {filters.search && (
          <button
            className="text-textDim hover:text-textMain absolute top-1/2 right-3 -translate-y-1/2 text-xs"
            onClick={() => onChange({ search: "" })}
          >
            ✕
          </button>
        )}
      </div>

      {/* <Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        <SelectFilter
          label="Subject"
          value={filters.subject}
          options={subjects}
          active={filters.subject !== "All"}
          onChange={(v) => onChange({ subject: v })}
        />
        <SelectFilter
          label="Year"
          value={filters.year}
          options={years}
          active={filters.year !== "All"}
          onChange={(v) => onChange({ year: v })}
        />
        <SelectFilter
          label="Topic"
          value={filters.topic}
          options={topics}
          active={filters.topic !== "All"}
          onChange={(v) => onChange({ topic: v })}
        />
        <SelectFilter
          label="Difficulty"
          value={filters.difficulty}
          options={["All", "Easy", "Medium", "Hard"]}
          active={filters.difficulty !== "All"}
          onChange={(v) => onChange({ difficulty: v })}
        />
        {hasActiveFilters && (
          <button
            className="text-brand-light px-2 py-2 text-xs hover:underline"
            onClick={() =>
              onChange({
                subject: "All",
                year: "All",
                topic: "All",
                difficulty: "All",
                search: "",
              })
            }
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
