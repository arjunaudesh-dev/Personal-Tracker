import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Tab', desc: 'Create child subtask under selected node' },
    { key: 'Enter', desc: 'Create sibling task at same depth' },
    { key: 'Space', desc: 'Toggle task collapse / expand subtree' },
    { key: 'Delete / Backspace', desc: 'Delete selected node' },
    { key: 'Ctrl / ⌘ + K', desc: 'Global Command Palette' },
    { key: 'Ctrl / ⌘ + Z', desc: 'Undo last canvas modification' },
    { key: 'Ctrl / ⌘ + Y', desc: 'Redo previously undone action' },
    { key: 'D', desc: 'Toggle CAD blueprint markup pen' },
    { key: 'V / H', desc: 'Toggle Select / Hand Pan modes' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Keyboard className="w-5 h-5 text-sky-400" />
          <h3 className="text-base font-bold text-white">Keyboard Power Shortcuts</h3>
        </div>

        <div className="divide-y divide-white/5 bg-slate-950/60 rounded-xl border border-white/5 p-2">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 px-3 text-xs">
              <span className="text-slate-300">{s.desc}</span>
              <kbd className="px-2 py-1 rounded bg-slate-800 text-sky-300 font-mono text-[11px] border border-white/10 shadow">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 rounded-xl text-xs"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
