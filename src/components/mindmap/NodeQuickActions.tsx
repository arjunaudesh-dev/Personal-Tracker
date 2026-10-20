'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlarmClock, Check, Link2, Plus, Wallet } from 'lucide-react';
import { useState } from 'react';

import type { MindMapTaskNode } from '@/lib/types/mindmap';
import { cn } from '@/lib/parser/utils';

/**
 * Hover action dock rendered over a task node.
 * Actions: add child, link to another task, set alarm, open cost ledger.
 */
export function NodeQuickActions({
  task,
  onAddChild,
  onLink,
  onAlarm,
  onCost,
  onToggleDone,
}: {
  task: MindMapTaskNode;
  onAddChild: (id: string) => void;
  onLink: (id: string) => void;
  onAlarm: (id: string) => void;
  onCost: (id: string) => void;
  onToggleDone: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const actions = [
    { id: 'add', label: 'Add subtask', icon: Plus, onClick: () => onAddChild(task.id), tone: 'text-nexus-cyan' },
    { id: 'link', label: 'Cross-link', icon: Link2, onClick: () => onLink(task.id), tone: 'text-nexus-violet' },
    { id: 'alarm', label: 'Set alarm', icon: AlarmClock, onClick: () => onAlarm(task.id), tone: 'text-nexus-amber' },
    { id: 'cost', label: 'Cost ledger', icon: Wallet, onClick: () => onCost(task.id), tone: 'text-nexus-emerald' },
    {
      id: 'done',
      label: task.status === 'done' ? 'Reopen' : 'Mark done',
      icon: Check,
      onClick: () => onToggleDone(task.id),
      tone: 'text-nexus-emerald',
    },
  ];

  return (
    <div
      className="absolute -top-3 right-2 z-20 flex items-center gap-1"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/15 bg-ink-900/95 text-slate-400 shadow-lg transition-colors hover:border-nexus-cyan/50 hover:text-nexus-cyan"
        aria-label="Node actions"
      >
        <Plus className="h-3 w-3" />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, x: 8, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.94 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-0.5 rounded-xl border border-white/12 bg-ink-900/95 p-1 shadow-xl backdrop-blur"
          >
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  title={action.label}
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-lg transition-colors hover:bg-white/10',
                    action.tone,
                  )}
                >
                  <Icon className="h-3 w-3" />
                </button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** Footer micro-pills for a task node: docs, BOQ, contacts, due date. */
export function NodeFooterBadges({ task }: { task: MindMapTaskNode }) {
  const pills = [
    task.attachments.length ? `Docs ${task.attachments.length}` : null,
    task.cashflow?.boq.length ? `BOQ ${task.cashflow.boq.length}` : null,
    task.contacts.length ? `WA ${task.contacts.length}` : null,
    task.dueDate ? `Due ${task.dueDate.slice(5)}` : null,
  ].filter(Boolean) as string[];

  if (!pills.length) return null;

  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {pills.map((pill) => (
        <span key={pill} className="chip px-1.5 py-0 text-[8px]">
          {pill}
        </span>
      ))}
    </div>
  );
}
