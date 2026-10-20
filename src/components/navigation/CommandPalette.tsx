import React, { useState, useEffect } from 'react';
import { Search, Compass, GitGraph, DollarSign, HeartPulse, Plus, X, ArrowRight } from 'lucide-react';
import { SystemModule } from '@/types/nexus';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (module: SystemModule) => void;
}

export function CommandPalette({ isOpen, onClose, onSelectModule }: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = [
    { label: 'Go to Executive Briefing', module: 'briefing' as const, icon: Compass, cat: 'Navigation' },
    { label: 'Go to Mind-Map & BOQ Canvas', module: 'mindmap' as const, icon: GitGraph, cat: 'Navigation' },
    { label: 'Go to Financial Velocity & Budget', module: 'finance' as const, icon: DollarSign, cat: 'Navigation' },
    { label: 'Go to Health, Athletics & Lab Hub', module: 'health' as const, icon: HeartPulse, cat: 'Navigation' },
    { label: 'Admin Building 1st Floor Slab Concrete (Tree)', module: 'mindmap' as const, icon: GitGraph, cat: 'Civil Works' },
    { label: 'Harbor Floating Dock Mooring Overhaul (Tree)', module: 'mindmap' as const, icon: GitGraph, cat: 'Civil Works' },
    { label: 'Sea Wall Tidal Armoring Sector Charlie (Tree)', module: 'mindmap' as const, icon: GitGraph, cat: 'Civil Works' },
  ];

  const filtered = items.filter((it) =>
    it.label.toLowerCase().includes(query.toLowerCase()) ||
    it.cat.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-white/10 bg-slate-950/60">
          <Search className="w-4 h-4 text-sky-400 mr-2.5" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, civil node, or jump to module..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white text-sm focus:outline-none"
          />
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onSelectModule(item.module);
                  onClose();
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 flex items-center justify-between text-xs text-slate-200 group transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-800 text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{item.label}</div>
                    <div className="text-[10px] text-slate-400">{item.cat}</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-500">
              No matching commands or task nodes found for &apos;{query}&apos;.
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 bg-slate-950/90 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Navigate with arrows</span>
          <span>Esc to exit</span>
        </div>
      </div>
    </div>
  );
}
