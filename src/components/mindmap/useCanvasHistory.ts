'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { MindMapTaskNode } from '@/lib/types/mindmap';

/**
 * Canvas history state — captures the mutable graph fields so that undo/redo
 * restores task status, progress, collapse state and node positions.
 */
export interface CanvasSnapshot {
  tasks: Record<
    string,
    {
      status: MindMapTaskNode['status'];
      progress: number;
      isCollapsed: boolean;
      posX: number;
      posY: number;
    }
  >;
}

export function snapshotTasks(tasks: MindMapTaskNode[]): CanvasSnapshot {
  const map: CanvasSnapshot['tasks'] = {};
  for (const task of tasks) {
    map[task.id] = {
      status: task.status,
      progress: task.progress,
      isCollapsed: task.isCollapsed,
      posX: task.posX,
      posY: task.posY,
    };
  }
  return { tasks: map };
}

export interface HistoryControls {
  value: CanvasSnapshot;
  set: (next: CanvasSnapshot) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useCanvasHistory(initial: CanvasSnapshot, limit = 50): HistoryControls {
  const [history, setHistory] = useState<{
    past: CanvasSnapshot[];
    present: CanvasSnapshot;
    future: CanvasSnapshot[];
  }>({ past: [], present: initial, future: [] });

  const set = useCallback(
    (next: CanvasSnapshot) => {
      setHistory((h) => {
        if (h.present === next) return h;
        return {
          past: [...h.past, h.present].slice(-limit),
          present: next,
          future: [],
        };
      });
    },
    [limit],
  );

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.past.length === 0) return h;
      const previous = h.past[h.past.length - 1];
      return { past: h.past.slice(0, -1), present: previous, future: [h.present, ...h.future] };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const [next, ...rest] = h.future;
      return { past: [...h.past, h.present], present: next, future: rest };
    });
  }, []);

  const boundRef = useRef(false);
  useEffect(() => {
    if (boundRef.current) return;
    boundRef.current = true;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (typing) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  return {
    value: history.present,
    set,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
