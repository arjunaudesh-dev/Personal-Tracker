import React from 'react';
import { BoardNavigationHeader } from './BoardNavigationHeader';
import { TaskSpaceBar } from './TaskSpaceBar';
import { CanvasToolbar } from './CanvasToolbar';
import { MindMapToolbar } from './MindMapToolbar';
import { BoardDefinition, GroupCategory, MindMapTaskNode } from '@/types/mindmap';

interface CanvasHeaderHudProps {
  currentBoardId: string;
  onSelectBoard: (board: BoardDefinition) => void;
  selectedGroup: GroupCategory | 'All';
  onSelectGroup: (group: GroupCategory | 'All') => void;
  counts: Record<string, number>;
  tasks: MindMapTaskNode[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRelayout: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onAddTask: () => void;
}

export function CanvasHeaderHud({
  currentBoardId,
  onSelectBoard,
  selectedGroup,
  onSelectGroup,
  counts,
  tasks,
  searchQuery,
  onSearchChange,
  onRelayout,
  onExpandAll,
  onCollapseAll,
  onAddTask,
}: CanvasHeaderHudProps) {
  const completedCount = tasks.filter((t) => t.status === 'done').length;

  const handleExportJson = () => {
    const dataUri = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(tasks, null, 2))}`;
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `nexus-tasks-${Date.now()}.json`);
    link.click();
  };

  return (
    <div className="absolute top-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
      <div className="flex items-center gap-2 pointer-events-auto">
        <BoardNavigationHeader
          currentBoardId={currentBoardId}
          onSelectBoard={onSelectBoard}
        />
        <TaskSpaceBar
          selectedGroup={selectedGroup}
          onSelectGroup={onSelectGroup}
          counts={counts}
        />
      </div>

      <div className="flex items-center gap-2 pointer-events-auto">
        <MindMapToolbar
          taskCount={tasks.length}
          completedCount={completedCount}
          onExportJson={handleExportJson}
        />
        <CanvasToolbar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onRelayout={onRelayout}
          onExpandAll={onExpandAll}
          onCollapseAll={onCollapseAll}
          onAddTask={onAddTask}
        />
      </div>
    </div>
  );
}
