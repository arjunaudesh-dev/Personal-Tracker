'use client';

import { LayoutGrid } from 'lucide-react';

import { BOARDS } from './mock-multi-board';
import { useNexus } from '@/store/nexus-store';
import { cn } from '@/lib/parser/utils';

/** Multi-board selector — Master command shell vs focused sub-boards. */
export function BoardNavigationHeader() {
  const { state, dispatch } = useNexus();

  return (
    <div className="flex items-center gap-2 overflow-x-auto scroll-thin">
      <span className="flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
        <LayoutGrid className="h-3 w-3" />
        Boards
      </span>
      <div className="flex gap-1.5">
        {BOARDS.map((board) => {
          const active = state.activeBoardId === board.id;
          return (
            <button
              key={board.id}
              onClick={() => dispatch({ type: 'set-board', boardId: board.id })}
              className={cn(
                'group relative shrink-0 overflow-hidden rounded-xl border px-3 py-1.5 text-left transition-all duration-250',
                active
                  ? 'border-white/20 bg-white/[0.08] shadow-glass'
                  : 'border-white/[0.07] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]',
              )}
            >
              <span
                className="absolute inset-y-0 left-0 w-[2px] transition-opacity"
                style={{ background: board.color, opacity: active ? 1 : 0.35 }}
              />
              <span
                className={cn(
                  'block text-[11px] font-semibold',
                  active ? 'text-slate-100' : 'text-slate-400 group-hover:text-slate-200',
                )}
              >
                {board.name}
              </span>
              <span className="block whitespace-nowrap text-[9px] text-slate-600">{board.subtitle}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
