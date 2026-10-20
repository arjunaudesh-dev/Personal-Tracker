import React from 'react';
import { MindMapTaskNode, CrossGroupLink } from '@/types/mindmap';
import { OverviewSubtasksTab } from './OverviewSubtasksTab';
import { CrossLinksTab } from './CrossLinksTab';

interface SubtasksCrossLinksTabProps {
  task: MindMapTaskNode;
  allTasks: MindMapTaskNode[];
  crossLinks: CrossGroupLink[];
  onUpdate: (updated: Partial<MindMapTaskNode>) => void;
  onAddLink: (link: CrossGroupLink) => void;
  onRemoveLink: (linkId: string) => void;
}

export function SubtasksCrossLinksTab({
  task,
  allTasks,
  crossLinks,
  onUpdate,
  onAddLink,
  onRemoveLink,
}: SubtasksCrossLinksTabProps) {
  return (
    <div className="space-y-6">
      <OverviewSubtasksTab task={task} onUpdate={onUpdate} />
      <hr className="border-white/10" />
      <CrossLinksTab
        task={task}
        allTasks={allTasks}
        crossLinks={crossLinks}
        onAddLink={onAddLink}
        onRemoveLink={onRemoveLink}
      />
    </div>
  );
}
