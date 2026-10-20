import React from 'react';
import { Layers, Building2, Anchor, Shield, Activity, DollarSign, ChevronDown } from 'lucide-react';
import { mockBoards } from './mock-multi-board';
import { BoardDefinition } from '@/types/mindmap';

interface BoardNavigationHeaderProps {
  currentBoardId: string;
  onSelectBoard: (board: BoardDefinition) => void;
}

export function BoardNavigationHeader({
  currentBoardId,
  onSelectBoard,
}: BoardNavigationHeaderProps) {
  const currentBoard = mockBoards.find((b) => b.id === currentBoardId) || mockBoards[0];

  const getIcon = (name?: string) => {
    switch (name) {
      case 'Building2': return <Building2 className="w-4 h-4 text-emerald-400" />;
      case 'Anchor': return <Anchor className="w-4 h-4 text-sky-400" />;
      case 'Shield': return <Shield className="w-4 h-4 text-amber-400" />;
      case 'Activity': return <Activity className="w-4 h-4 text-rose-400" />;
      case 'DollarSign': return <DollarSign className="w-4 h-4 text-yellow-400" />;
      default: return <Layers className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-lg">
      <div className="flex items-center gap-2">
        {getIcon(currentBoard.icon)}
        <div className="flex flex-col">
          <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
            Active Workspace Board
          </div>
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            {currentBoard.name}
          </div>
        </div>
      </div>

      <div className="relative group ml-1">
        <button
          type="button"
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 flex items-center"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1.5 hidden group-hover:block z-50">
          <div className="text-[10px] text-slate-400 px-2 py-1 font-mono uppercase">
            Switch Sub-Boards & Trees
          </div>
          {mockBoards.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => onSelectBoard(b)}
              className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
                b.id === currentBoardId
                  ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              {getIcon(b.icon)}
              <div>
                <div className="text-xs">{b.name}</div>
                <div className="text-[10px] text-slate-400 line-clamp-1">{b.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
