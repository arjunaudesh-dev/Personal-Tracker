import type { Task } from '@/types/nexus';

export interface TreeNode extends Task {
  children: string[];
  progress: number;
  depth: number;
}

/** Leaf progress from status; parents aggregate children (bottom-up rollup). */
export function computeRollup(tasks: Task[]): Map<string, { progress: number; depth: number; children: string[] }> {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const children = new Map<string, string[]>();
  for (const t of tasks) {
    if (t.parentId && byId.has(t.parentId)) {
      children.set(t.parentId, [...(children.get(t.parentId) ?? []), t.id]);
    }
  }
  const out = new Map<string, { progress: number; depth: number; children: string[] }>();
  const visit = (id: string, depth: number): number => {
    const kids = children.get(id) ?? [];
    let progress: number;
    if (kids.length === 0) {
      const t = byId.get(id)!;
      progress = t.status === 'done' ? 100 : t.status === 'doing' ? 50 : 0;
    } else {
      progress = Math.round(kids.reduce((s, k) => s + visit(k, depth + 1), 0) / kids.length);
    }
    out.set(id, { progress, depth, children: kids });
    return progress;
  };
  for (const t of tasks) if (!t.parentId || !byId.has(t.parentId)) visit(t.id, 0);
  return out;
}

/** Ids hidden because an ancestor is collapsed. */
export function getHiddenNodeIds(tasks: Task[]): Set<string> {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const hidden = new Set<string>();
  for (const t of tasks) {
    let p = t.parentId;
    while (p && byId.has(p)) {
      const parent = byId.get(p)!;
      if (parent.collapsed) {
        hidden.add(t.id);
        break;
      }
      p = parent.parentId;
    }
  }
  return hidden;
}

export function boqTotal(task: Task): number {
  return task.boq.reduce((s, b) => s + b.qty * b.rate, 0);
}

/** Recursively removes a task and all descendants. */
export function removeSubtree(tasks: Task[], id: string): Task[] {
  const drop = new Set<string>([id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const t of tasks) {
      if (t.parentId && drop.has(t.parentId) && !drop.has(t.id)) {
        drop.add(t.id);
        grew = true;
      }
    }
  }
  return tasks.filter((t) => !drop.has(t.id));
}
