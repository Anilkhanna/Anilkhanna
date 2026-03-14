'use client';

interface StatsBarProps {
  stats: {
    total: number;
    new: number;
    saved: number;
    applied: number;
    rejected: number;
  };
}

const statCards = [
  { key: 'total', label: 'Total', color: 'text-[#ccd6f6]', bg: 'bg-[#ccd6f6]/10' },
  { key: 'new', label: 'New', color: 'text-[#64ffda]', bg: 'bg-[#64ffda]/10' },
  { key: 'saved', label: 'Saved', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { key: 'applied', label: 'Applied', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { key: 'rejected', label: 'Rejected', color: 'text-[#4a5568]', bg: 'bg-[#4a5568]/10' },
] as const;

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {statCards.map(({ key, label, color, bg }) => (
        <div
          key={key}
          className={`${bg} rounded-lg p-3 text-center border border-[#1d2d50]`}
        >
          <div className={`text-2xl font-bold ${color}`}>
            {stats[key as keyof typeof stats]}
          </div>
          <div className="text-xs text-[#8892b0] mt-1">{label}</div>
        </div>
      ))}
    </div>
  );
}
