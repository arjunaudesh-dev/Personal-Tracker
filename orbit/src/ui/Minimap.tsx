import React, { useRef } from 'react';
import type { PlannedGraph } from '../lib/layout';
import type { Transform } from '../graph/useViewport';
import { cx } from '../lib/utils';
import { IconClose } from './icons';

interface Props {
  plan: PlannedGraph;
  transform: Transform;
  size: { w: number; h: number };
  onCenter: (x: number, y: number) => void;
  onClose: () => void;
}

const MM_W = 168;

export const Minimap: React.FC<Props> = ({ plan, transform, size, onCenter, onClose }) => {
  const ref = useRef<SVGSVGElement>(null);
  const b = plan.bounds;
  const ratio = Math.min(1.6, Math.max(0.4, b.h / Math.max(1, b.w)));
  const MM_H = Math.round(MM_W * ratio);

  const toWorld = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * b.w;
    const y = ((clientY - r.top) / r.height) * b.h;
    return { x, y };
  };

  const viewWorld = {
    x: -transform.x / transform.k,
    y: -transform.y / transform.k,
    w: size.w / transform.k,
    h: size.h / transform.k,
  };

  return (
    <div className="minimap" data-interactive="minimap">
      <div className="minimap-head">
        <span>Map</span>
        <button className="minimap-close" onClick={onClose} aria-label="Hide minimap">
          <IconClose size={9} />
        </button>
      </div>
      <svg
        ref={ref}
        width={MM_W}
        height={MM_H}
        viewBox={`0 0 ${Math.max(1, b.w)} ${Math.max(1, b.h)}`}
        preserveAspectRatio="xMidYMid meet"
        className="minimap-svg"
        onPointerDown={(e) => {
          const p = toWorld(e.clientX, e.clientY);
          if (p) onCenter(p.x, p.y);
          const move = (ev: PointerEvent) => {
            const q = toWorld(ev.clientX, ev.clientY);
            if (q) onCenter(q.x, q.y);
          };
          const up = () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
          };
          window.addEventListener('pointermove', move);
          window.addEventListener('pointerup', up);
        }}
      >
        {plan.groups.map((g) => (
          <rect
            key={`g-${g.universe.id}`}
            x={g.x}
            y={g.y}
            width={g.w}
            height={g.h}
            rx={18}
            fill={`${g.universe.accent}12`}
            stroke={`${g.universe.accent}55`}
            strokeWidth={Math.max(1.5, b.w / 400)}
          />
        ))}
        {plan.nodes.map((p) => (
          <rect
            key={p.node.id}
            x={p.x}
            y={p.y}
            width={p.w}
            height={p.h}
            rx={4}
            fill={p.universe.accent}
            opacity={p.node.kind === 'task' ? 0.45 : 0.85}
          />
        ))}
        {plan.portals.map((portal) => (
          <circle
            key={portal.id}
            cx={portal.x + portal.w / 2}
            cy={portal.y + portal.h / 2}
            r={Math.max(4, b.w / 120)}
            fill={portal.universe.accent}
            opacity={0.7}
          />
        ))}
        <rect
          className={cx('minimap-view')}
          x={viewWorld.x}
          y={viewWorld.y}
          width={viewWorld.w}
          height={viewWorld.h}
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.75)"
          strokeWidth={Math.max(2, b.w / 260)}
          rx={6}
        />
      </svg>
    </div>
  );
};
