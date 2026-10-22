import React from 'react';
import type { Currency, GraphLayers, PlannedNode, SystemType } from '../types';
import { fmtMoney, cx, hexToRgba } from '../lib/utils';

interface Props {
  p: PlannedNode;
  system: SystemType;
  layers: GraphLayers;
  currency: Currency;
  selected: boolean;
  dimmed: boolean;
  match: boolean;
  hovered: boolean;
  linkSource: boolean;
  onSelect: (id: string, additive: boolean) => void;
  onToggle: (id: string) => void;
  onHover: (id: string | null) => void;
  onOpenMenu: (id: string) => void;
}

const progressColor = (status: string) =>
  status === 'done'
    ? ['#34d399', '#4ade80']
    : status === 'doing'
      ? ['#f5c451', '#fbbf24']
      : ['#7c8698', '#9aa4b6'];

export const NodeCard = React.memo(function NodeCard({
  p,
  system,
  layers,
  currency,
  selected,
  dimmed,
  match,
  hovered,
  linkSource,
  onSelect,
  onToggle,
  onHover,
  onOpenMenu,
}: Props) {
  const { node, meta, universe } = p;
  const [c1, c2] = progressColor(node.status);
  const variant =
    system === 'network'
      ? 'v-network'
      : system === 'concept'
        ? 'v-concept'
        : system === 'hybrid'
          ? layers.network && !layers.hierarchy
            ? 'v-network'
            : layers.concept && !layers.hierarchy && !layers.network
              ? 'v-concept'
              : 'v-hybrid'
          : '';
  const showDegree = system === 'network' || (system === 'hybrid' && layers.network);
  const showBoq = meta.boq > 0.4;
  const collapsedWithKids = !!node.collapsed && meta.children > 0;

  return (
    <div
      data-interactive="node"
      data-node-id={node.id}
      role="button"
      tabIndex={0}
      aria-label={`${node.title}, ${Math.round(meta.progress)} percent complete`}
      className={cx(
        'node',
        node.kind,
        variant,
        selected && 'selected',
        dimmed && 'dimmed',
        match && 'match',
        hovered && 'hovered',
        linkSource && 'link-source',
      )}
      style={{
        left: p.x,
        top: p.y,
        width: p.w,
        minHeight: p.h,
        ['--n-acc' as string]: universe.accent,
        ['--n-acc2' as string]: universe.accent2,
        ['--n-line' as string]: hexToRgba(universe.accent, node.kind === 'task' ? 0.16 : 0.4),
        ['--n-line-hover' as string]: hexToRgba(universe.accent, 0.7),
        ['--bar-c1' as string]: c1,
        ['--bar-c2' as string]: c2,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id, e.shiftKey || e.metaKey || e.ctrlKey);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (meta.children > 0) onToggle(node.id);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        onOpenMenu(node.id);
      }}
      onPointerEnter={() => onHover(node.id)}
      onPointerLeave={() => onHover(null)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(node.id, false);
        }
      }}
    >
      <div className="node-head">
        <span className={cx('status-dot', node.status)} />
        <span className="node-title" title={node.title}>
          {node.title || 'Untitled'}
        </span>
      </div>

      <div className="node-meta">
        <span className="mini-bar" aria-hidden="true">
          <i style={{ width: `${Math.max(2, meta.progress)}%` }} />
        </span>
        <span className="mini-pct">{Math.round(meta.progress)}%</span>
        {showBoq && (
          <span className="mini-boq">{fmtMoney(meta.boq, currency, { compact: true })}</span>
        )}
      </div>

      {collapsedWithKids && <span className="node-count">+{meta.descendants}</span>}

      {showDegree && meta.degree > 0 && (
        <span className="node-degree" title={`${meta.degree} bridges`}>
          ⤴ {meta.degree}
        </span>
      )}

      {meta.children > 0 && (
        <button
          className={cx('chev', node.collapsed && 'closed')}
          data-interactive="chev"
          aria-label={node.collapsed ? 'Expand branch' : 'Collapse branch'}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(node.id);
          }}
        >
          {node.collapsed ? '▸' : '▾'}
        </button>
      )}
    </div>
  );
});
