import React from 'react';
import { cn } from '../../lib/utils';
import type { Filters } from '../../Pages/PastQuestions';

interface FilterBarProps {
  filters:   Filters;
  subjects:  string[];
  years:     string[];
  topics:    string[];
  onChange:  (next: Partial<Filters>) => void;
}

const SelectFilter: React.FC<{
  label:   string;
  value:   string;
  options: string[];
  onChange:(v: string) => void;
  active:  boolean;
}> = ({ label, value, options, onChange, active }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'appearance-none pl-3 pr-8 py-2 rounded-brand border text-xs font-medium transition-all cursor-pointer',
        'bg-bgSurface focus:outline-none',
        active
          ? 'border-brand text-brand-light bg-brand/10'
          : 'border-borderMuted text-textMuted hover:border-white/15 hover:text-textMain',
      )}
    >
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-bgCard text-textMain">
          {opt === 'All' ? `${label}: All` : opt}
        </option>
      ))}
    </select>
    <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-textDim text-[10px]">▼</div>
  </div>
);

const FilterBar: React.FC<FilterBarProps> = ({ filters, subjects, years, topics, onChange }) => {
  const hasActiveFilters =
    filters.subject !== 'All' ||
    filters.year    !== 'All' ||
    filters.topic   !== 'All' ||
    filters.difficulty !== 'All' ||
    filters.search  !== '';

  return (
    <div className="mb-4">
      {/* <Search input */}
      <div className="relative mb-3">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-textDim"
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search questions or topics..."
          className="w-full pl-9 pr-4 py-2.5 bg-bgSurface border border-borderMuted rounded-brand text-sm text-textMain placeholder:text-textDim focus:outline-none focus:border-brand/40 transition-colors"
        />
        {filters.search && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-textDim hover:text-textMain text-xs"
            onClick={() => onChange({ search: '' })}
          >✕</button>
        )}
      </div>

      {/* <Filter row */}
      <div className="flex flex-wrap gap-2 items-center">
        <SelectFilter
          label="Subject" value={filters.subject} options={subjects} active={filters.subject !== 'All'}
          onChange={(v) => onChange({ subject: v })}
        />
        <SelectFilter
          label="Year" value={filters.year} options={years} active={filters.year !== 'All'}
          onChange={(v) => onChange({ year: v })}
        />
        <SelectFilter
          label="Topic" value={filters.topic} options={topics} active={filters.topic !== 'All'}
          onChange={(v) => onChange({ topic: v })}
        />
        <SelectFilter
          label="Difficulty" value={filters.difficulty}
          options={['All', 'Easy', 'Medium', 'Hard']}
          active={filters.difficulty !== 'All'}
          onChange={(v) => onChange({ difficulty: v })}
        />
        {hasActiveFilters && (
          <button
            className="text-xs text-brand-light hover:underline px-2 py-2"
            onClick={() => onChange({ subject: 'All', year: 'All', topic: 'All', difficulty: 'All', search: '' })}
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;