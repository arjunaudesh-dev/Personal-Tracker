import { useState, useCallback } from 'react';
import { MindMapTaskNode } from '@/types/mindmap';

export function useCanvasHistory(initialPresent: MindMapTaskNode[]) {
  const [past, setPast] = useState<MindMapTaskNode[][]>([]);
  const [present, setPresent] = useState<MindMapTaskNode[]>(initialPresent);
  const [future, setFuture] = useState<MindMapTaskNode[][]>([]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const undo = useCallback(() => {
    if (!canUndo) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setPast(newPast);
    setFuture([present, ...future]);
    setPresent(previous);
  }, [canUndo, past, present, future]);

  const redo = useCallback(() => {
    if (!canRedo) return;

    const next = future[0];
    const newFuture = future.slice(1);

    setPast([...past, present]);
    setPresent(next);
    setFuture(newFuture);
  }, [canRedo, future, past, present]);

  const set = useCallback(
    (newPresent: MindMapTaskNode[] | ((curr: MindMapTaskNode[]) => MindMapTaskNode[])) => {
      setPresent((current) => {
        const resolved = typeof newPresent === 'function' ? newPresent(current) : newPresent;
        setPast((p) => [...p.slice(-25), current]);
        setFuture([]);
        return resolved;
      });
    },
    []
  );

  return { state: present, set, undo, redo, canUndo, canRedo };
}
