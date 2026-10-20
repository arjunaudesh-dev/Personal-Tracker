'use client';

import { Layers } from 'lucide-react';

import { TASK_SPACES } from './mock-multi-board';
import { useNexus } from '@/store/nexus-store';
import { cn } from '@/lib/parser/utils';

/** Task-space filter pills — narrows the graph to a single life domain. */
export function TaskSpaceBar() {
  const { state, dispatch } = useNexus();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scroll-thin pb-1">
      <Layers className="mr-1 h-3.5 w-3.5 shrink-0 text-slate-600" />
      {TASK_SPACES.map((space) => {
        const active = state.activeSpaceId === space.id;
        const count = state.tasks.filter((t) => {
          if (space.id === 'all') return true;
          if (space.id === 'career') {
            return t.groupCategory === 'Career' || t.groupCategory === 'Personal';
          }
          return t.groupCategory.toLowerCase() === space.id;
        }).length;

        return (
          <button
            key={space.id}
            onClick={() => dispatch({ type: 'set-space', spaceId: space.id })}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all duration-200',
              active
                ? 'border-nexus-cyan/50 bg-nexus-cyan/15 text-nexus-cyan shadow-glow'
                : 'border-white/10 bg-white/[0.03] text-slate-500 hover:border-white/25 hover:text-slate-300',
            )}
          >
            {space.label}
            <span className="font-mono text-[9px] opacity-60">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
