import React from 'react';
import { GroupCategory } from '@/types/mindmap';

interface TaskSpaceBarProps {
  selectedGroup: GroupCategory | 'All';
  onSelectGroup: (group: GroupCategory | 'All') => void;
  counts: Record<string, number>;
}

export function TaskSpaceBar({
  selectedGroup,
  onSelectGroup,
  counts,
}: TaskSpaceBarProps) {
  const groups: Array<{ key: GroupCategory | 'All'; label: string; color: string }> = [
    { key: 'All', label: 'All Domains', color: 'hover:text-white' },
    { key: 'Civil', label: 'Civil Works', color: 'text-amber-400' },
    { key: 'Health', label: 'Health & Phys', color: 'text-emerald-400' },
    { key: 'Finance', label: 'Financial Ops', color: 'text-cyan-400' },
    { key: 'Work', label: 'Command & Admin', color: 'text-indigo-400' },
  ];

  return (
    <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg text-xs">
      {groups.map((g) => {
        const isSelected = selectedGroup === g.key;
        const count = counts[g.key] || 0;

        return (
          <button
            key={g.key}
            type="button"
            onClick={() => onSelectGroup(g.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              isSelected
                ? 'bg-white/10 text-white shadow border border-white/20 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <span>{g.label}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
