import { MindMapTaskNode } from '@/types/mindmap';

export function calculateBottomUpProgress(tasks: MindMapTaskNode[]): MindMapTaskNode[] {
  const taskMap = new Map<string, MindMapTaskNode>();
  const childrenMap = new Map<string, string[]>();

  // Clone tasks into map
  tasks.forEach((task) => {
    taskMap.set(task.id, { ...task });
    if (task.parentId) {
      const arr = childrenMap.get(task.parentId) || [];
      arr.push(task.id);
      childrenMap.set(task.parentId, arr);
    }
  });

  // Helper to compute node progress recursively
  function computeProgress(id: string): number {
    const node = taskMap.get(id);
    if (!node) return 0;

    const childIds = childrenMap.get(id);
    if (!childIds || childIds.length === 0) {
      // Leaf node: return status-based or explicit progress
      if (node.status === 'done') return 100;
      if (node.status === 'todo') return 0;
      return node.progress || 0;
    }

    // Branch node: average of child branches
    const totalChildProgress = childIds.reduce(
      (sum, cId) => sum + computeProgress(cId),
      0
    );
    const avgProgress = Math.round(totalChildProgress / childIds.length);
    node.progress = avgProgress;
    
    // Auto sync status based on progress
    if (avgProgress === 100) node.status = 'done';
    else if (avgProgress > 0 && node.status === 'todo') node.status = 'in_progress';
    else if (avgProgress === 0 && node.status === 'done') node.status = 'todo';

    return avgProgress;
  }

  // Find all root nodes (parentId is null or parent doesn't exist)
  const rootIds = tasks
    .filter((t) => !t.parentId || !taskMap.has(t.parentId))
    .map((t) => t.id);

  rootIds.forEach((rId) => computeProgress(rId));

  return Array.from(taskMap.values());
}
