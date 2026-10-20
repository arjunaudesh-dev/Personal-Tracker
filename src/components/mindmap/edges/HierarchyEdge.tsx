import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';

export function HierarchyEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: '#38bdf8',
          strokeWidth: 2,
          opacity: 0.85,
        }}
      />
    </>
  );
}
