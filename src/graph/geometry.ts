import type { EdgeStyle, Rect } from '../types';

export interface Pt {
  x: number;
  y: number;
}

export const centerOf = (r: Rect): Pt => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

/** point on the rectangle border in the direction of `towards` */
export const anchorOf = (r: Rect, towards: Pt): Pt => {
  const c = centerOf(r);
  const dx = towards.x - c.x;
  const dy = towards.y - c.y;
  if (dx === 0 && dy === 0) return c;
  const sx = dx === 0 ? Infinity : r.w / 2 / Math.abs(dx);
  const sy = dy === 0 ? Infinity : r.h / 2 / Math.abs(dy);
  const s = Math.min(sx, sy);
  return { x: c.x + dx * s, y: c.y + dy * s };
};

/** LTR mind-map anchor pair (parent right edge → child left edge) */
export const pairAnchors = (
  from: Rect,
  to: Rect,
  mode: 'tree' | 'link',
): { a: Pt; b: Pt } => {
  const fa = centerOf(from);
  const tb = centerOf(to);
  if (mode === 'tree' && to.x > from.x + from.w) {
    return {
      a: { x: from.x + from.w, y: fa.y },
      b: { x: to.x, y: tb.y },
    };
  }
  return { a: anchorOf(from, tb), b: anchorOf(to, fa) };
};

export type EdgeAxis = 'h' | 'v' | 'auto';

/** edge path between two anchor points */
export const edgePath = (
  a: Pt,
  b: Pt,
  style: EdgeStyle,
  axis: EdgeAxis = 'auto',
): string => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const horizontal =
    axis === 'h' ? true : axis === 'v' ? false : Math.abs(dx) >= Math.abs(dy);

  if (style === 'straight') {
    return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  }

  if (style === 'elbow') {
    const r = Math.min(18, Math.abs(horizontal ? dx : dy) / 2, Math.abs(horizontal ? dy : dx) / 2 + 18);
    if (horizontal) {
      const midX = a.x + dx / 2;
      return `M ${a.x} ${a.y} L ${midX - r} ${a.y} Q ${midX} ${a.y} ${midX} ${a.y + Math.sign(dy) * r} L ${midX} ${b.y - Math.sign(dy) * r} Q ${midX} ${b.y} ${midX + r} ${b.y} L ${b.x} ${b.y}`;
    }
    const midY = a.y + dy / 2;
    return `M ${a.x} ${a.y} L ${a.x} ${midY - r} Q ${a.x} ${midY} ${a.x + Math.sign(dx) * r} ${midY} L ${b.x - Math.sign(dx) * r} ${midY} Q ${b.x} ${midY} ${b.x} ${midY + r} L ${b.x} ${b.y}`;
  }

  if (style === 'arc') {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const len = Math.hypot(dx, dy) || 1;
    const bend = Math.min(70, len * 0.24);
    const nx = -(dy / len) * bend;
    const ny = (dx / len) * bend;
    return `M ${a.x} ${a.y} Q ${mx + nx} ${my + ny} ${b.x} ${b.y}`;
  }

  // curve: horizontal mind-map bezier — always flows out of the right edge
  if (horizontal) {
    const c = Math.max(36, Math.abs(dx) * 0.55);
    const dir = Math.sign(dx) || 1;
    return `M ${a.x} ${a.y} C ${a.x + c * dir} ${a.y}, ${b.x - c * dir} ${b.y}, ${b.x} ${b.y}`;
  }
  const c = Math.max(28, Math.abs(dy) * 0.5);
  return `M ${a.x} ${a.y} C ${a.x} ${a.y + c}, ${b.x} ${b.y - c}, ${b.x} ${b.y}`;
};

/** label anchor for an edge (bezier midpoint) */
export const edgeMid = (a: Pt, b: Pt, style: EdgeStyle): Pt => {
  if (style === 'elbow') return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  if (style === 'arc') {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const bend = Math.min(70, len * 0.24);
    return {
      x: (a.x + b.x) / 2 - (dy / len) * bend * 0.5,
      y: (a.y + b.y) / 2 + (dx / len) * bend * 0.5,
    };
  }
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
};

export const arrowPath = (tip: Pt, from: Pt): string => {
  const ang = Math.atan2(tip.y - from.y, tip.x - from.x);
  const size = 7;
  const a1 = ang + Math.PI - 0.42;
  const a2 = ang + Math.PI + 0.42;
  return `M ${tip.x} ${tip.y} L ${tip.x + Math.cos(a1) * size} ${tip.y + Math.sin(a1) * size} L ${tip.x + Math.cos(a2) * size} ${tip.y + Math.sin(a2) * size} Z`;
};

/** move tip slightly back so the arrowhead sits on the border */
export const pullBack = (tip: Pt, from: Pt, by: number): Pt => {
  const ang = Math.atan2(tip.y - from.y, tip.x - from.x);
  return { x: tip.x - Math.cos(ang) * by, y: tip.y - Math.sin(ang) * by };
};

export const roundedRectPath = (r: Rect, radius: number): string => {
  const rad = Math.min(radius, r.w / 2, r.h / 2);
  return [
    `M ${r.x + rad} ${r.y}`,
    `H ${r.x + r.w - rad}`,
    `Q ${r.x + r.w} ${r.y} ${r.x + r.w} ${r.y + rad}`,
    `V ${r.y + r.h - rad}`,
    `Q ${r.x + r.w} ${r.y + r.h} ${r.x + r.w - rad} ${r.y + r.h}`,
    `H ${r.x + rad}`,
    `Q ${r.x} ${r.y + r.h} ${r.x} ${r.y + r.h - rad}`,
    `V ${r.y + rad}`,
    `Q ${r.x} ${r.y} ${r.x + rad} ${r.y}`,
    'Z',
  ].join(' ');
};

export const rectsIntersect = (a: Rect, b: Rect): boolean =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export const pointInRect = (p: Pt, r: Rect): boolean =>
  p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
