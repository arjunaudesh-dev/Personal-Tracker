import React, { useEffect, useMemo, useRef, useState } from 'react';
import type {
  Currency,
  LinkKind,
  NodeLink,
  NodeMeta,
  ViewSettings,
} from '../types';
import type { PlannedGraph, PortalNode } from '../lib/layout';
import type { PlannedNode, Rect } from '../types';
import { linkKindMeta } from '../data/seed';
import { buildForest } from '../lib/rollup';
import { cx, hexToRgba } from '../lib/utils';
import {
  anchorOf,
  arrowPath,
  centerOf,
  edgeMid,
  edgePath,
  pairAnchors,
  pullBack,
  type Pt,
} from '../graph/geometry';
import { useViewport } from '../graph/useViewport';
import { NodeCard } from './NodeCard';
import { Minimap } from './Minimap';
import { layerPreset } from '../lib/layers';
import {
  IconClose,
  IconCompress,
  IconExpand,
  IconFit,
  IconGrid,
  IconLink,
  IconMinus,
  IconPlus,
} from './icons';
import type { TrackerState } from '../store/store';

interface EdgeSpec {
  id: string;
  linkId?: string;
  a: Pt;
  b: Pt;
  style: ViewSettings['edgeStyle'];
  color: string;
  width: number;
  dash?: string;
  label?: string;
  arrow: boolean;
  dimKey?: [string, string];
  kind: 'tree' | 'link' | 'portal';
}

interface Props {
  plan: PlannedGraph;
  view: ViewSettings;
  meta: Map<string, NodeMeta>;
  state: TrackerState;
  dispatch: React.Dispatch<any>;
  currency: Currency;
  selectedLinkId: string | null;
  onSelectLink: (id: string | null) => void;
  onOpenUniverse: (id: string) => void;
  onOpenRail: () => void;
  onOpenBridge: (universeId: string, nodeId: string) => void;
  onSelectNode: (id: string) => void;
  onToast: (text: string, tone?: 'ok' | 'info' | 'warn') => void;
  focusTarget: { id: string; nonce: number } | null;
}

const HIDDEN_LINK_KINDS: LinkKind[] = [];

const bridgesLabel = (plan: PlannedGraph) =>
  `${plan.nodes.length} tasks across ${plan.groups.length} profiles`;

export const Canvas: React.FC<Props> = ({
  plan,
  view,
  meta,
  state,
  dispatch,
  currency,
  selectedLinkId,
  onSelectLink,
  onOpenUniverse,
  onOpenRail,
  onOpenBridge,
  onSelectNode,
  onToast,
  focusTarget,
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1200, h: 700 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [linkSource, setLinkSource] = useState<string | null>(null);
  const [linkKind, setLinkKind] = useState<LinkKind>('relation');
  const [showLegend, setShowLegend] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [panning, setPanning] = useState(false);

  const vp = useViewport(plan.bounds, size.w, size.h);
  const { transform, setTransform } = vp;

  const pan = useRef({ active: false, x: 0, y: 0, tx: 0, ty: 0, moved: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; k: number; tx: number; ty: number; mid: Pt } | null>(null);

  /* ---------------- measure ---------------- */
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  /* ---------------- zoom with wheel (non-passive) ---------------- */
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const factor = Math.exp(-e.deltaY * (e.ctrlKey ? 0.008 : 0.0016));
      vp.zoomBy(factor, { x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [vp.zoomBy]);

  /* ---------------- link mode source ---------------- */
  const prevLinkMode = useRef(view.linkMode);
  useEffect(() => {
    if (!view.linkMode) {
      setLinkSource(null);
    } else if (!prevLinkMode.current && !linkSource && view.selectedId) {
      setLinkSource(view.selectedId);
    }
    prevLinkMode.current = view.linkMode;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.linkMode, view.selectedId]);

  useEffect(() => {
    const onFit = () => vp.fit(80, 1.05);
    window.addEventListener('orbit:fit', onFit);
    return () => window.removeEventListener('orbit:fit', onFit);
  }, [vp.fit]);

  /* ---------------- focus request ---------------- */
  const lastFocus = useRef(0);
  useEffect(() => {
    if (!focusTarget || focusTarget.nonce === lastFocus.current) return;
    lastFocus.current = focusTarget.nonce;
    const p = plan.nodes.find((n) => n.node.id === focusTarget.id);
    if (!p) return;
    vp.focusOn(
      { x: p.x - 60, y: p.y - 60, w: p.w + 120, h: p.h + 120 },
      Math.max(0.75, vp.transform.k),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusTarget?.nonce]);

  /* ---------------- framing: readable zoom on load, fit for overview scopes ---------------- */
  const framed = useRef('');
  useEffect(() => {
    if (!size.w || !size.h || !plan.nodes.length) return;
    const key = [
      view.scope,
      view.universeId ?? '',
      view.layout,
      view.visibleUniverseIds.join('-'),
      size.w,
      size.h,
    ].join('|');
    if (framed.current === key) return;
    framed.current = key;
    const pad = 58;
    if (view.scope === 'universe') {
      const raw = Math.min(
        (size.w - pad * 2) / Math.max(1, plan.bounds.w),
        (size.h - pad * 2) / Math.max(1, plan.bounds.h),
      );
      const cxw = plan.bounds.x + plan.bounds.w / 2;
      const cyw = plan.bounds.y + plan.bounds.h / 2;
      if (raw >= 0.4) {
        // whole universe visible — readable unless the tree is enormous
        const k = Math.min(raw, 1.06);
        vp.animateTo({ k, x: size.w / 2 - cxw * k, y: size.h / 2 - cyw * k });
      } else {
        // very dense: open on a readable slice centred on the root
        const k = 0.6;
        const root = plan.nodes.find((p) => !p.node.parentId) ?? plan.nodes[0];
        if (view.layout === 'tree') {
          vp.animateTo({
            k,
            x: size.w * 0.28 - (root.x + root.w / 2) * k,
            y: size.h * 0.5 - (root.y + root.h / 2) * k,
          });
        } else {
          vp.animateTo({ k, x: size.w / 2 - cxw * k, y: size.h / 2 - cyw * k });
        }
      }
    } else {
      // keep world labels readable; the chips + minimap cover the macro picture
      const pad = 56;
      const raw = Math.min(
        (size.w - pad * 2) / Math.max(1, plan.bounds.w),
        (size.h - pad * 2) / Math.max(1, plan.bounds.h),
        0.95,
      );
      const k = Math.max(0.45, raw);
      vp.animateTo({
        k,
        x: size.w / 2 - (plan.bounds.x + plan.bounds.w / 2) * k,
        y: size.h / 2 - (plan.bounds.y + plan.bounds.h / 2) * k,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.w, size.h, view.scope, view.universeId, view.layout, view.visibleUniverseIds]);

  const overview = view.scope !== 'universe';
  // the projected fit for this scope — used to pick sensible detail thresholds
  const fitK = Math.min(
    (size.w - 112) / Math.max(1, plan.bounds.w),
    (size.h - 112) / Math.max(1, plan.bounds.h),
    0.95,
  );
  // below ~0.45 the world-space type is unreadable; cards become shapes and the
  // screen-space universe chips (fixed size) carry the information instead
  const lodMin = transform.k < 0.45;
  const overviewLod = overview && lodMin;
  const showChips = overview && transform.k < (view.mixedSystems ? 0.9 : 0.72);

  const effLayers = useMemo(() => {
    if (view.system === 'hybrid') return view.layers;
    return {
      hierarchy: true,
      network: view.system === 'network',
      concept: view.system === 'concept',
    };
  }, [view.system, view.layers]);

  /** in multi-universe scopes each profile can keep its own drawing system */
  const mixed = view.mixedSystems && view.scope !== 'universe';
  const systemFor = (universeId: string) =>
    mixed
      ? state.universes.find((u) => u.id === universeId)?.system ?? view.system
      : view.system;
  const layersFor = (universeId: string) =>
    mixed
      ? layerPreset(state.universes.find((u) => u.id === universeId)?.system ?? view.system)
      : effLayers;

  /* ---------------- edges ---------------- */
  const forest = useMemo(() => buildForest(state.nodes), [state.nodes]);

  const groupOf = useMemo(
    () => new Map(plan.groups.map((g) => [g.universe.id, g])),
    [plan.groups],
  );

  const edges = useMemo<EdgeSpec[]>(() => {
    const byId = new Map(plan.nodes.map((n) => [n.node.id, n]));
    const out: EdgeSpec[] = [];
    const treeStyle: ViewSettings['edgeStyle'] = view.edgeStyle;
    const overviewMode = view.scope !== 'universe' && overviewLod;

    if (view.showTreeEdges && effLayers.hierarchy && !overviewMode) {
      for (const p of plan.nodes) {
        const parentId = p.node.parentId;
        if (!parentId) continue;
        const parent = byId.get(parentId);
        if (!parent) continue;
        const { a, b } = pairAnchors(parent, p, 'tree');
        const accent = parent.universe.accent;
        const layers = layersFor(p.universe.id);
        // in mixed mode only one universe is 'focused' — one set of proposition labels is enough
        const concept =
          layers.concept && (!mixed || p.universe.id === plan.groups[0]?.universe.id);
        out.push({
          id: `tree-${p.node.id}`,
          a,
          b,
          style: treeStyle,
          color: concept
            ? 'rgba(190,200,220,0.42)'
            : p.depth === 1
              ? hexToRgba(accent, 0.55)
              : hexToRgba(accent, 0.32),
          width: p.depth === 1 ? 1.6 : 1.15,
          label: concept && view.showLinkLabels ? (p.depth === 1 ? 'comprises' : 'includes') : undefined,
          arrow: concept,
          dimKey: [parentId, p.node.id],
          kind: 'tree',
        });
      }
    }

    const isTreePair = (a: string, b: string) => {
      const na = forest.byId.get(a);
      const nb = forest.byId.get(b);
      if (!na || !nb) return false;
      return na.parentId === b || nb.parentId === a;
    };

    const portalByLink = new Map(plan.portals.map((p) => [p.link.id, p]));
    const portalRects = new Map(plan.portals.map((p) => [p.id, p]));

    for (const link of state.links) {
      if (HIDDEN_LINK_KINDS.includes(link.kind)) continue;
      const A = byId.get(link.from);
      const B = byId.get(link.to);

      if (overviewMode && A && B) {
        // zoomed-out overview: bridges run frame to frame, not card to card
        const gA = groupOf.get(A.universe.id);
        const gB = groupOf.get(B.universe.id);
        if (!gA || !gB) continue;
        if (gA === gB) continue;
        const k = linkKindMeta[link.kind] ?? linkKindMeta.relation;
        const a = anchorOf(
          { x: gA.x, y: gA.y, w: gA.w, h: gA.h },
          { x: gB.cx, y: gB.cy },
        );
        const b = anchorOf(
          { x: gB.x, y: gB.y, w: gB.w, h: gB.h },
          { x: gA.cx, y: gA.cy },
        );
        out.push({
          id: `glink-${link.id}`,
          linkId: link.id,
          a,
          b,
          style: 'arc',
          color: k.color,
          width: 1 + link.strength * 0.28,
          dash: link.kind === 'reference' ? '6 5' : undefined,
          label: link.label || k.verb,
          arrow: !!link.directed,
          dimKey: [link.from, link.to],
          kind: 'link',
        });
        continue;
      }

      if (A && B && isTreePair(link.from, link.to)) continue;
      const k = linkKindMeta[link.kind] ?? linkKindMeta.relation;
      const dash =
        link.kind === 'reference' ? '7 5' : link.kind === 'contrast' ? '2 5' : undefined;
      const width = 1 + link.strength * 0.36;

      if (A && B) {
        const a = anchorOf(A, centerOf(B));
        const b = anchorOf(B, centerOf(A));
        out.push({
          id: `link-${link.id}`,
          linkId: link.id,
          a,
          b,
          style: view.edgeStyle,
          color: k.color,
          width: width + 0.3,
          dash,
          label: view.showLinkLabels ? link.label || k.verb : undefined,
          arrow: !!link.directed,
          dimKey: [link.from, link.to],
          kind: 'link',
        });
      } else if (A || B) {
        const portal = portalByLink.get(link.id);
        if (!portal) continue;
        const inner = (A ?? B)!;
        const innerRect = byId.get(inner.node.id);
        if (!innerRect) continue;
        const portalRect: Rect = portalRects.get(portal.id) ?? portal;
        const a = anchorOf(innerRect, centerOf(portalRect));
        const b = anchorOf(portalRect, centerOf(innerRect));
        out.push({
          id: `portal-edge-${link.id}`,
          linkId: link.id,
          a,
          b,
          style: view.edgeStyle,
          color: k.color,
          width,
          dash: '5 4',
          label: view.showLinkLabels ? portal.universe.code : undefined,
          arrow: true,
          dimKey: [inner.node.id, inner.node.id],
          kind: 'portal',
        });
      }
    }
    return out;
  }, [
    plan.nodes,
    plan.portals,
    state.links,
    view.edgeStyle,
    view.showTreeEdges,
    view.showLinkLabels,
    view.scope,
    overviewLod,
    effLayers,
    forest,
    groupOf,
  ]);

  /* ---------------- hover / selection context ---------------- */
  const activeId = hovered ?? view.selectedId ?? null;
  const connected = useMemo(() => {
    if (!activeId) return null;
    const set = new Set<string>([activeId]);
    const node = forest.byId.get(activeId);
    if (node?.parentId) set.add(node.parentId);
    for (const k of forest.childrenOf.get(activeId) ?? []) set.add(k.id);
    for (const l of state.links) {
      if (l.from === activeId) set.add(l.to);
      if (l.to === activeId) set.add(l.from);
    }
    return set;
  }, [activeId, forest, state.links]);

  const matches = useMemo(() => {
    const q = view.search.trim().toLowerCase();
    if (!q) return null;
    return new Set(
      plan.nodes
        .filter(
          (p) =>
            p.node.title.toLowerCase().includes(q) ||
            (p.node.notes ?? '').toLowerCase().includes(q),
        )
        .map((p) => p.node.id),
    );
  }, [view.search, plan.nodes]);

  const selectedNodeId = view.selectedId;

  /* ---------------- drag / pan ---------------- */
  const onPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-interactive]')) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [p1, p2] = [...pointers.current.values()];
      const rect = hostRef.current!.getBoundingClientRect();
      pinch.current = {
        dist: Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1,
        k: transform.k,
        tx: transform.x,
        ty: transform.y,
        mid: {
          x: (p1.x + p2.x) / 2 - rect.left,
          y: (p1.y + p2.y) / 2 - rect.top,
        },
      };
      pan.current.active = false;
      return;
    }
    pan.current = {
      active: true,
      x: e.clientX,
      y: e.clientY,
      tx: transform.x,
      ty: transform.y,
      moved: 0,
    };
    setPanning(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (pointers.current.has(e.pointerId)) {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    if (pinch.current && pointers.current.size >= 2) {
      const [p1, p2] = [...pointers.current.values()];
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
      const rect = hostRef.current!.getBoundingClientRect();
      const mid = {
        x: (p1.x + p2.x) / 2 - rect.left,
        y: (p1.y + p2.y) / 2 - rect.top,
      };
      const factor = dist / pinch.current.dist;
      const k = Math.min(2.6, Math.max(0.1, pinch.current.k * factor));
      // keep the world point under the initial midpoint pinned
      const wx = (pinch.current.mid.x - pinch.current.tx) / pinch.current.k;
      const wy = (pinch.current.mid.y - pinch.current.ty) / pinch.current.k;
      setTransform({ k, x: mid.x - wx * k, y: mid.y - wy * k });
      return;
    }
    if (!pan.current.active) return;
    const dx = e.clientX - pan.current.x;
    const dy = e.clientY - pan.current.y;
    pan.current.moved = Math.max(pan.current.moved, Math.hypot(dx, dy));
    setTransform({
      ...transform,
      x: pan.current.tx + dx,
      y: pan.current.ty + dy,
    });
  };

  const finishPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pan.current.active) {
      pan.current.active = false;
      setPanning(false);
      if (pan.current.moved < 5) {
        // background click
        dispatch({ type: 'SELECT', id: null });
        onSelectLink(null);
        setLinkSource(null);
      }
    }
  };

  /* ---------------- link creation ---------------- */
  const handleNodeClick = (id: string, additive: boolean) => {
    if (view.linkMode || additive || linkSource) {
      if (!linkSource) {
        setLinkSource(id);
        if (!view.linkMode) dispatch({ type: 'VIEW', patch: { linkMode: true } });
        return;
      }
      if (linkSource === id) {
        setLinkSource(null);
        return;
      }
      const from = forest.byId.get(linkSource);
      const to = forest.byId.get(id);
      dispatch({ type: 'ADD_LINK', from: linkSource, to: id, kind: linkKind });
      if (from && to && from.universeId !== to.universeId) {
        onToast('Cross-universe bridge created ⤴', 'ok');
      } else {
        onToast('Link created', 'ok');
      }
      setLinkSource(null);
      dispatch({ type: 'VIEW', patch: { linkMode: false } });
      return;
    }
    onSelectLink(null);
    onSelectNode(id);
  };

  const openNodeFromPortal = (portal: PortalNode) => {
    onOpenBridge(portal.universe.id, portal.node.id);
  };

  const selectedLink = state.links.find((l) => l.id === selectedLinkId) ?? null;

  /* ---------------- render ---------------- */
  const isEmpty = plan.nodes.length === 0;

  return (
    <div
      ref={hostRef}
      className={cx('canvas', panning && 'panning', view.linkMode && 'linkmode')}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={finishPointer}
      onDoubleClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('[data-interactive]')) {
          // zoom in on empty space
          vp.zoomBy(1.25);
        }
      }}
    >
      <div
        ref={worldRef}
        className={cx('world', vp.animating && 'animating', lodMin && 'lod-min')}
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
          width: plan.bounds.w,
          height: plan.bounds.h,
        }}
      >
        {/* decorative orbit rings */}
        {plan.hub && (
          <svg className="world-bg" width={plan.bounds.w} height={plan.bounds.h}>
            {(() => {
              const rings = plan.groups
                .map((g) => Math.hypot(g.cx - plan.hub!.x, g.cy - plan.hub!.y))
                .filter((r) => r > 60);
              if (!rings.length) return null;
              const r = rings.reduce((a, b) => a + b, 0) / rings.length;
              return (
                <g>
                  <circle
                    cx={plan.hub.x}
                    cy={plan.hub.y}
                    r={r}
                    fill="none"
                    stroke="rgba(255,255,255,0.07)"
                    strokeDasharray="2 8"
                  />
                  <circle
                    cx={plan.hub.x}
                    cy={plan.hub.y}
                    r={r * 0.62}
                    fill="none"
                    stroke="rgba(255,255,255,0.04)"
                    strokeDasharray="1 10"
                  />
                  {plan.groups.map((g) => (
                    <line
                      key={g.universe.id}
                      x1={plan.hub!.x}
                      y1={plan.hub!.y}
                      x2={g.cx}
                      y2={g.cy}
                      stroke="rgba(255,255,255,0.035)"
                      strokeDasharray="3 9"
                    />
                  ))}
                </g>
              );
            })()}
          </svg>
        )}

        <svg
          className="edge-layer"
          width={plan.bounds.w}
          height={plan.bounds.h}
          style={{ zIndex: 1 }}
        >
          <defs>
            <filter id="edge-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {edges.map((e) => {
            const dim =
              (activeId && e.dimKey && !e.dimKey.includes(activeId)) ||
              (selectedLink && e.linkId && e.linkId !== selectedLink.id);
            const isSelected = selectedLink && e.linkId === selectedLink.id;
            const d = edgePath(e.a, e.b, e.style, e.kind === 'tree' ? 'h' : 'auto');
            const tip = pullBack(e.b, e.a, 1);
            return (
              <g
                key={e.id}
                className={cx('edge', dim && 'dim', isSelected && 'hot')}
                data-kind={e.kind}
                data-link-id={e.linkId}
              >
                <path
                  d={d}
                  stroke={e.color}
                  strokeWidth={(isSelected ? e.width + 1 : e.width) * (e.kind === 'tree' ? 1 : 1.1)}
                  strokeDasharray={e.dash}
                  fill="none"
                  strokeLinecap="round"
                  opacity={e.kind === 'tree' ? 0.95 : 0.9}
                />
                {e.arrow && (
                  <path d={arrowPath(tip, e.a)} fill={e.color} opacity={0.95} />
                )}
                <path
                  className="edge-hit"
                  data-interactive="edge"
                  data-kind={e.kind}
                  d={d}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    if (!e.linkId) return;
                    onSelectLink(e.linkId);
                    dispatch({ type: 'SELECT', id: null });
                  }}
                />
                {e.label && !lodMin && transform.k > (overview ? 0.62 : 0.42) && (
                  <text
                    className="edge-label"
                    x={edgeMid(e.a, e.b, e.style).x}
                    y={edgeMid(e.a, e.b, e.style).y - 5 / Math.max(transform.k, 0.5)}
                    textAnchor="middle"
                    // counter-scale so labels stay legible when zoomed out
                    fontSize={Math.min(19, 9.5 / Math.max(transform.k, 0.52))}
                  >
                    {e.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* universe groups */}
        {plan.groups.map((g) => {
          const active = view.scope === 'universe' || view.visibleUniverseIds.includes(g.universe.id);
          return (
            <div
              key={g.universe.id}
              className={cx('group', view.scope !== 'universe' && 'interactive')}
              style={{
                left: g.x,
                top: g.y,
                width: g.w,
                height: g.h,
                ['--g-acc' as string]: g.universe.accent,
                ['--g-acc2' as string]: g.universe.accent2,
                opacity: active ? 1 : 0.4,
              }}
            >
              <button
                className="group-orb"
                title={view.scope === 'universe' ? `Switch universe (${g.universe.name})` : `Open ${g.universe.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (view.scope === 'universe') {
                    onOpenRail();
                    return;
                  }
                  onOpenUniverse(g.universe.id);
                }}
              >
                {g.universe.glyph}
              </button>
              <div className="group-head">
                <span className="gh-code">{g.universe.code}</span>
                <span className="gh-name">{g.universe.name}</span>
                <span className="gh-meta">
                  {mixed
                    ? `${
                        g.universe.system === 'mind'
                          ? 'mind'
                          : g.universe.system === 'network'
                            ? 'network'
                            : g.universe.system === 'concept'
                              ? 'concept'
                              : 'hybrid'
                      } · `
                    : ''}
                  {g.stats.nodes} tasks · {Math.round(g.stats.progress)}%
                </span>
              </div>
              {view.scope !== 'universe' && (
                <div className="group-badge">
                  <span className="dot" style={{ background: g.universe.accent, boxShadow: 'none' }} />
                  {Math.round(g.stats.progress)}% · {g.stats.done}/{g.stats.nodes}
                </div>
              )}
            </div>
          );
        })}

        {/* hub */}
        {plan.hub && (
          <div
            className="hub"
            style={{
              left: plan.hub.x - 96,
              top: plan.hub.y - 96,
              width: 192,
              height: 192,
              ['--acc' as string]: '#c7d2fe',
            }}
          >
            <div>
              <div className="hub-glyph">Core</div>
              <div className="hub-value">
                {plan.groups.length}
                <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>universes</span>
              </div>
              <div className="hub-sub">
                {plan.nodes.length} nodes linked
              </div>
            </div>
          </div>
        )}

        {/* nodes */}
        {plan.nodes.map((p) => (
          <NodeCard
            key={p.node.id}
            p={p}
            system={systemFor(p.universe.id)}
            layers={layersFor(p.universe.id)}
            currency={currency}
            selected={selectedNodeId === p.node.id}
            dimmed={!!activeId && !connected?.has(p.node.id)}
            match={!!matches?.has(p.node.id)}
            hovered={hovered === p.node.id}
            linkSource={linkSource === p.node.id}
            onSelect={handleNodeClick}
            onToggle={(id) => {
              dispatch({ type: 'TOGGLE_COLLAPSE', id });
            }}
            onHover={setHovered}
            onOpenMenu={(id) => {
              dispatch({ type: 'SELECT', id });
            }}
          />
        ))}

        {/* portals */}
        {plan.portals.map((portal) => (
          <button
            key={portal.id}
            className="portal"
            data-interactive="portal"
            style={{
              left: portal.x,
              top: portal.y,
              width: portal.w,
              height: portal.h,
              ['--p-acc' as string]: portal.universe.accent,
            }}
            title={`${portal.direction === 'out' ? 'Links to' : 'Linked from'} ${portal.node.title} · ${portal.universe.name}`}
            onClick={(e) => {
              e.stopPropagation();
              openNodeFromPortal(portal);
            }}
          >
            <span className="portal-code">{portal.universe.code}</span>
            <span className="portal-body">
              <span className="portal-name">{portal.node.title}</span>
              <span className="portal-kind">
                {portal.direction === 'out' ? 'bridge →' : '← bridge'} · {linkKindMeta[portal.link.kind].label}
              </span>
            </span>
          </button>
        ))}
      </div>

      {showChips && (
        <div className="lodlayer" data-interactive="lod">
          {plan.groups.map((g) => (
            <button
              key={g.universe.id}
              className="lodchip"
              style={{
                left: g.x * transform.k + transform.x + 4,
                // sit just above the cluster frame, like the full-detail header pill
                top: g.y * transform.k + transform.y - 31,
                ['--p-acc' as string]: g.universe.accent,
                ['--p-acc2' as string]: g.universe.accent2,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onOpenUniverse(g.universe.id);
              }}
            >
              <span className="lodorb">{g.universe.glyph}</span>
              <span className="lodtxt">
                <b>{g.universe.name}</b>
                <i>
                  {g.stats.nodes} tasks · {Math.round(g.stats.progress)}% · {g.stats.done} done
                </i>
              </span>
            </button>
          ))}
          {plan.hub && (
            <div
              className="lodhub"
              style={{
                left: plan.hub.x * transform.k + transform.x,
                top: plan.hub.y * transform.k + transform.y,
              }}
            >
              <b>◉ Orbit core</b>
              <i>{plan.groups.length} universes · {bridgesLabel(plan)}</i>
            </div>
          )}
        </div>
      )}

      {/* ---- overlays ---- */}
      <div className="overlay tl" data-interactive="overlay">
        <span className="scopebadge">
          <span className="dot" style={{ background: 'var(--acc)', boxShadow: '0 0 10px var(--acc)' }} />
          {view.scope === 'universe' ? (
            <>
              <b>{state.universes.find((u) => u.id === view.universeId)?.name ?? 'Universe'}</b>
              <span className="sep hide-sm" />
              <span className="hide-sm">
                {view.system === 'mind' ? 'Mind map' : view.system === 'network' ? 'Network map' : view.system === 'concept' ? 'Concept map' : 'Hybrid'}
                {' · '}
                {view.layout}
              </span>
            </>
          ) : view.scope === 'orbit' ? (
            <>
              <b>Universe Hub</b>
              <span className="sep" />
              <span>{plan.groups.length} universes in orbit</span>
            </>
          ) : (
            <>
              <b>Constellation</b>
              <span className="sep" />
              <span>{plan.groups.length} universes side by side</span>
            </>
          )}
        </span>
        {view.linkMode && (
          <span className="linkbanner">
            <span className="lb-dot" />
            {linkSource ? 'Now click a target node' : 'Click a node to start a link'}
            <select
              className="select"
              style={{ height: 22, fontSize: 10, padding: '0 20px 0 6px' }}
              value={linkKind}
              onChange={(e) => setLinkKind(e.target.value as LinkKind)}
              data-interactive="select"
            >
              {(Object.keys(linkKindMeta) as LinkKind[]).map((k) => (
                <option key={k} value={k}>
                  {linkKindMeta[k].label}
                </option>
              ))}
            </select>
            <button
              className="iconbtn"
              style={{ width: 20, height: 20 }}
              onClick={() => {
                dispatch({ type: 'VIEW', patch: { linkMode: false } });
                setLinkSource(null);
              }}
              aria-label="Exit link mode"
            >
              <IconClose size={11} />
            </button>
          </span>
        )}
        {matches && (
          <span className="caption">
            {matches.size} match{matches.size === 1 ? '' : 'es'}
          </span>
        )}
      </div>

      <div className="overlay bl" data-interactive="overlay">
        <span className="caption">
          {view.scope === 'universe'
            ? 'Drag to pan · scroll to zoom · double-click to expand'
            : 'Click a universe glyph to dive in · drag between universes to create bridges'}
        </span>
        <button className="fab" style={{ width: 26, height: 26 }} onClick={() => setShowLegend((s) => !s)} title="Legend">
          <span style={{ fontSize: 11, fontWeight: 700 }}>?</span>
        </button>
        {showLegend && (
          <div
            className="caption"
            style={{
              position: 'absolute',
              bottom: 34,
              left: 0,
              padding: '10px 12px',
              display: 'grid',
              gap: 6,
              minWidth: 176,
              zIndex: 10,
              background: 'rgba(8,11,18,0.94)',
            }}
          >
            <div style={{ fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--faint)' }}>
              Task status
            </div>
            {[
              ['todo', 'To do'],
              ['doing', 'In progress'],
              ['done', 'Done'],
            ].map(([k, label]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: 'var(--muted)' }}>
                <span className={cx('status-dot', k)} style={{ marginTop: 0 }} />
                {label}
              </div>
            ))}
            <div style={{ fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--faint)', marginTop: 4 }}>
              Bridges
            </div>
            {Object.entries(linkKindMeta).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: 'var(--muted)' }}>
                <span style={{ width: 14, height: 2, background: v.color, borderRadius: 2 }} />
                {v.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {showMinimap && plan.nodes.length > 2 && (
        <Minimap
          plan={plan}
          transform={transform}
          size={size}
          onCenter={(x, y) => vp.centerOn(x, y)}
          onClose={() => setShowMinimap(false)}
        />
      )}

      <div className="overlay br" data-interactive="overlay">
        <button className="fab" onClick={() => vp.zoomBy(1 / 1.2)} title="Zoom out">
          <IconMinus size={14} />
        </button>
        <span className="caption" style={{ minWidth: 42, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
          {Math.round(transform.k * 100)}%
        </span>
        <button className="fab" onClick={() => vp.zoomBy(1.2)} title="Zoom in">
          <IconPlus size={14} />
        </button>
        <button
          className={cx('fab', showMinimap && 'on')}
          onClick={() => setShowMinimap((v) => !v)}
          title="Toggle minimap"
          aria-label="Toggle minimap"
        >
          <IconGrid size={13} />
        </button>
        <button className="fab" onClick={() => vp.fit(80, 1.05)} title="Fit to screen">
          <IconFit size={14} />
        </button>
        <button
          className="fab"
          title="Expand all branches"
          onClick={() => dispatch({ type: 'EXPAND_ALL' })}
        >
          <IconExpand size={13} />
        </button>
        <button
          className="fab"
          title="Collapse all branches"
          onClick={() => dispatch({ type: 'COLLAPSE_ALL' })}
        >
          <IconCompress size={13} />
        </button>
      </div>

      {view.linkMode && !view.selectedId && !linkSource && (
        <div className="overlay" style={{ left: '50%', bottom: 54, transform: 'translateX(-50%)' }} data-interactive="overlay">
          <span className="linkbanner">
            <IconLink size={12} />
            Linking mode — click any node to start
          </span>
        </div>
      )}

      {isEmpty && (
        <div
          className="overlay"
          style={{ inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}
        >
          <div style={{ textAlign: 'center', maxWidth: 320 }}>
            <div style={{ fontSize: 30, marginBottom: 8, opacity: 0.6 }}>✧</div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 16, fontWeight: 600 }}>
              This universe is empty
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6, lineHeight: 1.5 }}>
              Create a root branch to start mapping, or jump back to the universe hub to pick another profile.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
