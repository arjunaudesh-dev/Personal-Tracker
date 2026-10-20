import React, { useState } from 'react';
import {
  ListTodo,
  FileCode,
  Calculator,
  MessageSquare,
  Network,
  Sparkles,
  Bell,
  Paperclip,
} from 'lucide-react';
import { MindMapTaskNode, CrossGroupLink } from '@/types/mindmap';
import { DrawerHeader } from './drawer-tabs/DrawerHeader';
import { OverviewSubtasksTab } from './drawer-tabs/OverviewSubtasksTab';
import { DocsDraftsTab } from './drawer-tabs/DocsDraftsTab';
import { CostBoqTab } from './drawer-tabs/CostBoqTab';
import { PeopleWhatsAppTab } from './drawer-tabs/PeopleWhatsAppTab';
import { CrossLinksTab } from './drawer-tabs/CrossLinksTab';
import { TaskCashflowTab } from './drawer-tabs/TaskCashflowTab';
import { AiInsightsTab } from './drawer-tabs/AiInsightsTab';
import { AlarmsSyncTab } from './drawer-tabs/AlarmsSyncTab';

interface TaskDetailDrawerProps {
  task: MindMapTaskNode | null;
  allTasks: MindMapTaskNode[];
  crossLinks: CrossGroupLink[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (task: MindMapTaskNode) => void;
  onAddLink: (link: CrossGroupLink) => void;
  onRemoveLink: (linkId: string) => void;
}

type TabKey = 'overview' | 'docs' | 'boq' | 'contacts' | 'links' | 'cashflow' | 'ai' | 'alarms';

export function TaskDetailDrawer({
  task,
  allTasks,
  crossLinks,
  isOpen,
  onClose,
  onUpdateTask,
  onAddLink,
  onRemoveLink,
}: TaskDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  if (!isOpen || !task) return null;

  const handleUpdate = (patch: Partial<MindMapTaskNode>) => {
    onUpdateTask({ ...task, ...patch });
  };

  const navTabs = [
    { key: 'overview', label: 'Tasks', icon: ListTodo },
    { key: 'boq', label: 'BOQ', icon: Calculator },
    { key: 'contacts', label: 'WhatsApp', icon: MessageSquare },
    { key: 'links', label: 'Links', icon: Network },
    { key: 'docs', label: 'Specs', icon: FileCode },
    { key: 'alarms', label: 'Alarms', icon: Bell },
    { key: 'ai', label: 'AI', icon: Sparkles },
  ] as const;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-300">
      <DrawerHeader task={task} onClose={onClose} onUpdate={handleUpdate} />

      {/* Tabs bar */}
      <div className="flex border-b border-white/10 bg-slate-950/60 overflow-x-auto px-2 py-1 scrollbar-none">
        {navTabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1 px-3 py-2 text-xs font-semibold whitespace-nowrap rounded-lg transition-colors ${
                isActive
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'overview' && (
          <OverviewSubtasksTab task={task} onUpdate={handleUpdate} />
        )}
        {activeTab === 'boq' && (
          <CostBoqTab task={task} onUpdate={handleUpdate} />
        )}
        {activeTab === 'contacts' && (
          <PeopleWhatsAppTab task={task} onUpdate={handleUpdate} />
        )}
        {activeTab === 'links' && (
          <CrossLinksTab
            task={task}
            allTasks={allTasks}
            crossLinks={crossLinks}
            onAddLink={onAddLink}
            onRemoveLink={onRemoveLink}
          />
        )}
        {activeTab === 'docs' && (
          <DocsDraftsTab task={task} onUpdate={handleUpdate} />
        )}
        {activeTab === 'alarms' && (
          <AlarmsSyncTab task={task} onUpdate={handleUpdate} />
        )}
        {activeTab === 'ai' && (
          <AiInsightsTab task={task} onUpdate={handleUpdate} />
        )}
      </div>
    </div>
  );
}
