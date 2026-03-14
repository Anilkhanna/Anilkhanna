'use client';

interface FilterBarProps {
  search: string;
  status: string;
  sort: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

const statusOptions = ['all', 'new', 'reviewed', 'saved', 'applied', 'rejected'];
const sortOptions = [
  { value: 'match_score', label: 'Match Score' },
  { value: 'newest', label: 'Newest' },
  { value: 'company', label: 'Company' },
  { value: 'title', label: 'Title' },
];

const selectClass =
  'bg-[#112240] border border-[#1d2d50] rounded-md px-3 py-2 text-sm text-[#ccd6f6] focus:outline-none focus:border-[#64ffda] appearance-none';

export function FilterBar({
  search,
  status,
  sort,
  onSearchChange,
  onStatusChange,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <input
        type="text"
        placeholder="Search jobs..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 min-w-[200px] bg-[#112240] border border-[#1d2d50] rounded-md px-3 py-2 text-sm text-[#ccd6f6] placeholder-[#4a5568] focus:outline-none focus:border-[#64ffda]"
      />
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className={selectClass}
      >
        {statusOptions.map((s) => (
          <option key={s} value={s}>
            {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        className={selectClass}
      >
        {sortOptions.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
