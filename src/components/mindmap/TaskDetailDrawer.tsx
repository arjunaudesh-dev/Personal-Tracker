'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  BrainCircuit,
  Clock3,
  FileStack,
  Link2,
  Paperclip,
  Users,
  Wallet,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { useNexus } from '@/store/nexus-store';
import { cn } from '@/lib/parser/utils';

import { DrawerHeader } from './drawer-tabs/DrawerHeader';
import { OverviewSubtasksTab } from './drawer-tabs/OverviewSubtasksTab';
import { AiInsightsTab } from './drawer-tabs/AiInsightsTab';
import { AlarmsSyncTab } from './drawer-tabs/AlarmsSyncTab';
import { DocsDraftsTab } from './drawer-tabs/DocsDraftsTab';
import { DocsAttachmentsTab } from './drawer-tabs/DocsAttachmentsTab';
import { CostBoqTab } from './drawer-tabs/CostBoqTab';
import { TaskCashflowTab } from './drawer-tabs/TaskCashflowTab';
import { PeopleWhatsAppTab } from './drawer-tabs/PeopleWhatsAppTab';
import { CrossLinksTab } from './drawer-tabs/CrossLinksTab';

type TabId =
  | 'overview'
  | 'ai'
  | 'alarms'
  | 'docs'
  | 'attachments'
  | 'cost'
  | 'cashflow'
  | 'people'
  | 'links';

const TABS: Array<{ id: TabId; label: string; icon: typeof Wallet }> = [
  { id: 'overview', label: 'Overview', icon: FileStack },
  { id: 'ai', label: 'AI Insights', icon: BrainCircuit },
  { id: 'alarms', label: 'Alarms', icon: Clock3 },
  { id: 'docs', label: 'Drafts', icon: FileStack },
  { id: 'attachments', label: 'Files', icon: Paperclip },
  { id: 'cost', label: 'BOQ', icon: Wallet },
  { id: 'cashflow', label: 'Cashflow', icon: Wallet },
  { id: 'people', label: 'People', icon: Users },
  { id: 'links', label: 'Links', icon: Link2 },
];

/** Slide-over inspector drawer with the full tab suite. */
export function TaskDetailDrawer() {
  const { state, dispatch } = useNexus();
  const [tab, setTab] = useState<TabId>('overview');

  const task = state.tasks.find((t) => t.id === state.selectedTaskId) ?? null;

  useEffect(() => {
    if (task) setTab('overview');
  }, [task?.id]);

  return (
    <AnimatePresence>
      {task ? (
        <motion.div
          key={task.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex justify-end"
        >
          <div
            className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
            onClick={() => dispatch({ type: 'select-task', taskId: null })}
            aria-hidden
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 280 }}
            className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-white/[0.08] bg-ink-950/95 shadow-2xl backdrop-blur-xl"
          >
            <DrawerHeader task={task} onClose={() => dispatch({ type: 'select-task', taskId: null })} />

            <div className="scroll-thin flex gap-1 overflow-x-auto border-b border-white/[0.07] px-3 py-2">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      'flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10.5px] font-medium transition-colors',
                      active
                        ? 'bg-nexus-cyan/15 text-nexus-cyan'
                        : 'text-slate-500 hover:bg-white/5 hover:text-slate-200',
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div className="scroll-thin flex-1 overflow-y-auto px-5 py-4">
              {tab === 'overview' ? <OverviewSubtasksTab task={task} /> : null}
              {tab === 'ai' ? <AiInsightsTab task={task} /> : null}
              {tab === 'alarms' ? <AlarmsSyncTab task={task} /> : null}
              {tab === 'docs' ? <DocsDraftsTab task={task} /> : null}
              {tab === 'attachments' ? <DocsAttachmentsTab task={task} /> : null}
              {tab === 'cost' ? <CostBoqTab task={task} /> : null}
              {tab === 'cashflow' ? <TaskCashflowTab task={task} /> : null}
              {tab === 'people' ? <PeopleWhatsAppTab task={task} /> : null}
              {tab === 'links' ? <CrossLinksTab task={task} /> : null}
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
