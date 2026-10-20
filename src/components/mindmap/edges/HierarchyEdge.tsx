'use client';

import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react';

const REL_STYLE: Record<string, { color: string; dash: string; label: string }> = {
  relates_to: { color: '#a78bfa', dash: '6 4', label: 'relates' },
  blocks: { color: '#fb7185', dash: '2 5', label: 'blocks' },
  depends_on: { color: '#fbbf24', dash: '8 3', label: 'depends' },
};

/** Dashed glowing edge for cross-group dependency links. */
export function CrossLinkEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const relationship = String((data as { relationshipType?: string })?.relationshipType ?? 'relates_to');
  const style = REL_STYLE[relationship] ?? REL_STYLE.relates_to;

  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.42,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: style.color,
          strokeWidth: selected ? 2.4 : 1.6,
          strokeDasharray: style.dash,
          filter: `drop-shadow(0 0 4px ${style.color}88)`,
        }}
        markerEnd="arrowclosed"
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'none',
            color: style.color,
          }}
          className="rounded-full border border-white/12 bg-ink-900/90 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider"
        >
          {style.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

/** Smooth animated bezier edge for parent → child hierarchy. */
export function HierarchyEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
}: EdgeProps) {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.28,
  });

  return (
    <BaseEdge
      id={id}
      path={path}
      style={{
        stroke: selected ? 'rgba(34,211,238,0.85)' : 'rgba(148,163,184,0.30)',
        strokeWidth: selected ? 2 : 1.4,
        filter: selected ? 'drop-shadow(0 0 5px rgba(34,211,238,0.6))' : undefined,
      }}
    />
  );
}
