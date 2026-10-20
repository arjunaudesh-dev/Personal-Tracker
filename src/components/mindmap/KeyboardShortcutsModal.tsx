'use client';

import { Modal } from '@/components/ui/Modal';

const SHORTCUTS: Array<[string, string]> = [
  ['⌘K / Ctrl+K', 'Open the command palette'],
  ['Ctrl+Z', 'Undo the last canvas action'],
  ['Ctrl+Y / Ctrl+Shift+Z', 'Redo the canvas action'],
  ['Esc', 'Close modal, drawer or palette'],
  ['Tab / ⇧Tab', 'Cycle module tabs'],
  ['/', 'Focus the graph search'],
  ['N', 'New root task on the active board'],
  ['C', 'Collapse the selected branch'],
  ['E', 'Expand the selected branch'],
  ['L', 'Open cross-space linker for the selected node'],
  ['D', 'Toggle the freehand CAD overlay'],
  ['1 – 5', 'Jump directly to Briefing / Mind-map / Finance / Health / Lab'],
];

/** Cheat sheet of the power-user shortcuts. */
export function KeyboardShortcutsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Keyboard shortcuts"
      subtitle="Power keys for the command shell"
      accent="amber"
      width="max-w-lg"
      footer={
        <button onClick={onClose} className="btn btn-primary">
          Got it
        </button>
      }
    >
      <div className="space-y-1.5">
        {SHORTCUTS.map(([keys, description]) => (
          <div
            key={keys}
            className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2"
          >
            <span className="text-[11px] text-slate-300">{description}</span>
            <kbd className="shrink-0 rounded-lg border border-white/12 bg-white/[0.06] px-2 py-1 font-mono text-[10px] text-nexus-cyan">
              {keys}
            </kbd>
          </div>
        ))}
      </div>
    </Modal>
  );
}
