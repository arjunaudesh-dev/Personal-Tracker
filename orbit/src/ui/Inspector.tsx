import React, { useEffect, useMemo, useState } from 'react';
import type { LinkKind, MindNode, NodeMeta, TaskStatus, ViewSettings } from '../types';
import { linkKindMeta } from '../data/seed';
import { chainToRoot, buildForest } from '../lib/rollup';
import { cx, fmtMoney, USD_LKR } from '../lib/utils';
import type { TrackerState } from '../store/store';
import {
  IconArrowUpRight,
  IconClose,
  IconCopy,
  IconLink,
  IconPlus,
  IconTrash,
} from './icons';

interface Props {
  state: TrackerState;
  dispatch: React.Dispatch<any>;
  meta: Map<string, NodeMeta>;
  selectedLinkId: string | null;
  onClose: () => void;
  onJump: (nodeId: string) => void;
  onClearLink: () => void;
}

const LINK_KINDS = Object.keys(linkKindMeta) as LinkKind[];

const crossUniverseCandidates = (rows: Array<{ cross: boolean }>) =>
  rows.filter((r) => r.cross).length;

export const Inspector: React.FC<Props> = ({
  state,
  dispatch,
  meta,
  selectedLinkId,
  onClose,
  onJump,
  onClearLink,
}) => {
  const { view } = state;
  const node = useMemo(
    () => state.nodes.find((n) => n.id === view.selectedId) ?? null,
    [state.nodes, view.selectedId],
  );
  const link = useMemo(
    () => state.links.find((l) => l.id === selectedLinkId) ?? null,
    [state.links, selectedLinkId],
  );
  const forest = useMemo(() => buildForest(state.nodes), [state.nodes]);
  const universe = state.universes.find((u) => u.id === node?.universeId) ?? state.universes[0];

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [boqInput, setBoqInput] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');
  const [pickerKind, setPickerKind] = useState<LinkKind>('relation');

  useEffect(() => {
    setPickerOpen(false);
    setPickerQuery('');
  }, [node?.id]);

  useEffect(() => {
    setTitle(node?.title ?? '');
    setNotes(node?.notes ?? '');
    const shown =
      node && node.boq
        ? view.currency === 'LKR'
          ? +(node.boq * USD_LKR).toFixed(2)
          : +node.boq.toFixed(2)
        : 0;
    setBoqInput(node?.boq ? String(shown) : '');
  }, [node?.id, node?.boq, node?.notes, node?.title, view.currency]);

  /* --- bridge picker data (must run before any early return: hook order) --- */
  const focusId = node?.id ?? null;
  const focusUniverse = node?.universeId ?? null;

  const linkedIds = useMemo(
    () =>
      new Set(
        state.links.flatMap((l) =>
          focusId ? (l.from === focusId ? [l.to] : l.to === focusId ? [l.from] : []) : [],
        ),
      ),
    [state.links, focusId],
  );

  const familyIds = useMemo(() => {
    const set = new Set<string>();
    if (!focusId) return set;
    let cur = forest.byId.get(focusId);
    let guard = 0;
    while (cur && guard++ < 100) {
      set.add(cur.id);
      cur = cur.parentId ? forest.byId.get(cur.parentId) : undefined;
    }
    const stack = [focusId];
    let guard2 = 0;
    while (stack.length && guard2++ < 500) {
      const id = stack.pop()!;
      set.add(id);
      for (const k of forest.childrenOf.get(id) ?? []) stack.push(k.id);
    }
    return set;
  }, [forest, focusId]);

  const pickerResults = useMemo(() => {
    if (!pickerOpen || !focusId) return [];
    const q = pickerQuery.trim().toLowerCase();
    return state.nodes
      .filter((x) => x.id !== focusId && !familyIds.has(x.id) && !linkedIds.has(x.id))
      .map((x) => {
        const u = state.universes.find((v) => v.id === x.universeId);
        return { node: x, universe: u, cross: x.universeId !== focusUniverse };
      })
      .filter((r) => {
        if (!q) return true;
        return (
          r.node.title.toLowerCase().includes(q) ||
          (r.universe?.name ?? '').toLowerCase().includes(q) ||
          (r.universe?.code ?? '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => Number(b.cross) - Number(a.cross) || a.node.title.localeCompare(b.node.title))
      .slice(0, 40);
  }, [pickerOpen, pickerQuery, state.nodes, state.universes, focusId, focusUniverse, familyIds, linkedIds]);

  if (!node && !link) {
    return (
      <aside className="drawer right" aria-label="Inspector">
        <div className="drawer-head">
          <div className="drawer-title">Inspector</div>
          <button className="iconbtn" onClick={onClose} aria-label="Close inspector">
            <IconClose size={15} />
          </button>
        </div>
        <div className="drawer-body">
          <div className="section-label">Getting started</div>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
            Select any node on the canvas to edit its status, progress, budget line or notes.
            Double-click a node to fold its branch away.
          </p>
          <div className="section-label">Bridges</div>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
            Hit <b style={{ color: 'var(--text)' }}>Link</b> in the toolbar, then click two nodes —
            even inside two different universes — to connect them. Existing bridges show as portal
            chips beside the map.
          </p>
          <div className="section-label">Shortcuts</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {[
              ['N', 'New child task'],
              ['Shift + N', 'New root branch'],
              ['Delete', 'Delete selected node'],
              ['F', 'Fit map to screen'],
              ['L', 'Toggle link mode'],
              ['1 – 4', 'Mind / Network / Concept / Hybrid'],
              ['Esc', 'Deselect / cancel linking'],
              ['⌘/Ctrl + Z', 'Undo'],
            ].map(([k, label]) => (
              <div key={k} className="kv">
                <span>{label}</span>
                <kbd>{k}</kbd>
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  if (link) {
    const from = state.nodes.find((n) => n.id === link.from);
    const to = state.nodes.find((n) => n.id === link.to);
    const fromU = state.universes.find((u) => u.id === from?.universeId);
    const toU = state.universes.find((u) => u.id === to?.universeId);
    return (
      <aside className="drawer right" aria-label="Bridge inspector">
        <div className="drawer-head">
          <span className="linkkind" style={{ ['--lc' as string]: linkKindMeta[link.kind].color }}>
            {linkKindMeta[link.kind].label}
          </span>
          <div className="drawer-title">Bridge</div>
          <button className="iconbtn" onClick={onClearLink} aria-label="Close bridge inspector">
            <IconClose size={15} />
          </button>
        </div>
        <div className="drawer-body">
          <div className="section-label">Endpoints</div>
          <div className="linkrow">
            <div className="linkrow-main">
              <div className="linkrow-top">
                <span>{from?.title ?? '—'}</span>
              </div>
              <div className="linkrow-sub">{fromU?.name} · {fromU?.code}</div>
            </div>
            <button className="iconbtn" onClick={() => from && onJump(from.id)} aria-label="Open first endpoint">
              <IconArrowUpRight size={13} />
            </button>
          </div>
          <div className="linkrow">
            <div className="linkrow-main">
              <div className="linkrow-top">
                <span>{to?.title ?? '—'}</span>
              </div>
              <div className="linkrow-sub">{toU?.name} · {toU?.code}</div>
            </div>
            <button className="iconbtn" onClick={() => to && onJump(to.id)} aria-label="Open second endpoint">
              <IconArrowUpRight size={13} />
            </button>
          </div>
          {fromU && toU && fromU.id !== toU.id && (
            <div
              className="pill"
              style={{
                alignSelf: 'flex-start',
                color: 'var(--acc)',
                borderColor: 'color-mix(in srgb, var(--acc) 40%, transparent)',
                background: 'color-mix(in srgb, var(--acc) 10%, transparent)',
              }}
            >
              ⤴ Cross-universe bridge · {fromU.code} → {toU.code}
            </div>
          )}

          <div className="section-label">Relation</div>
          <div className="fieldblock">
            <span className="flabel">Kind</span>
            <select
              className="select"
              style={{ height: 32, width: '100%' }}
              value={link.kind}
              onChange={(e) =>
                dispatch({ type: 'UPDATE_LINK', id: link.id, patch: { kind: e.target.value as LinkKind } })
              }
            >
              {LINK_KINDS.map((k) => (
                <option key={k} value={k}>
                  {linkKindMeta[k].label} — {linkKindMeta[k].verb}
                </option>
              ))}
            </select>
          </div>
          <div className="fieldblock">
            <span className="flabel">Label</span>
            <input
              className="input"
              value={link.label ?? ''}
              placeholder={linkKindMeta[link.kind].verb}
              onChange={(e) =>
                dispatch({ type: 'UPDATE_LINK', id: link.id, patch: { label: e.target.value } })
              }
            />
          </div>
          <div className="row2">
            <div className="fieldblock">
              <span className="flabel">Strength</span>
              <select
                className="select"
                style={{ height: 32 }}
                value={link.strength}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_LINK',
                    id: link.id,
                    patch: { strength: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 },
                  })
                }
              >
                <option value={1}>1 · faint</option>
                <option value={2}>2 · light</option>
                <option value={3}>3 · normal</option>
                <option value={4}>4 · strong</option>
                <option value={5}>5 · core</option>
              </select>
            </div>
            <label className="toggle" style={{ alignSelf: 'flex-end', height: 32 }}>
              <input
                type="checkbox"
                checked={!!link.directed}
                onChange={(e) =>
                  dispatch({ type: 'UPDATE_LINK', id: link.id, patch: { directed: e.target.checked } })
                }
              />
              Directed
            </label>
          </div>
        </div>
        <div className="drawer-foot">
          <button
            className="btn"
            style={{ color: '#fda4af' }}
            onClick={() => {
              dispatch({ type: 'DELETE_LINK', id: link.id });
              onClearLink();
            }}
          >
            <IconTrash size={13} /> Delete bridge
          </button>
        </div>
      </aside>
    );
  }

  const n = node as MindNode;
  const m = meta.get(n.id)!;
  const chain = chainToRoot(n, forest);
  const related = state.links
    .filter((l) => l.from === n.id || l.to === n.id)
    .map((l) => {
      const otherId = l.from === n.id ? l.to : l.from;
      const other = state.nodes.find((x) => x.id === otherId);
      const otherU = state.universes.find((u) => u.id === other?.universeId);
      return { link: l, other, otherU, direction: l.from === n.id ? 'out' : 'in' };
    })
    .filter((r) => r.other);

  const commitTitle = () => {
    const next = title.trim();
    if (next && next !== n.title) dispatch({ type: 'UPDATE_NODE', id: n.id, patch: { title: next } });
    else setTitle(n.title);
  };

  const commitBoq = () => {
    const parsed = parseFloat(boqInput.replace(/[^0-9.-]/g, ''));
    if (Number.isNaN(parsed)) {
      setBoqInput(n.boq ? String(n.boq) : '');
      return;
    }
    const usd = view.currency === 'LKR' ? parsed / USD_LKR : parsed;
    dispatch({ type: 'UPDATE_NODE', id: n.id, patch: { boq: Math.max(0, +usd.toFixed(2)) } });
  };

  const setStatus = (status: TaskStatus) => {
    const progress = status === 'done' ? 100 : status === 'doing' ? Math.max(n.progress, 40) : Math.min(n.progress, 10);
    dispatch({ type: 'UPDATE_NODE', id: n.id, patch: { status, progress } });
  };

  const isLeaf = m.children === 0;

  return (
    <aside className="drawer right" aria-label="Node inspector">
      <div className="drawer-head">
        <span className="dot" style={{ background: universe.accent, boxShadow: `0 0 10px ${universe.accent}` }} />
        <div className="drawer-title" style={{ fontSize: 13 }}>
          {universe.name}
        </div>
        <button className="iconbtn" onClick={onClose} aria-label="Close inspector">
          <IconClose size={15} />
        </button>
      </div>

      <div className="drawer-body">
        <div className="breadcrumb">
          {chain.slice(0, -1).map((step, i) => (
            <React.Fragment key={step.id}>
              {i > 0 && <span style={{ opacity: 0.5 }}>/</span>}
              <button onClick={() => onJump(step.id)}>{step.title}</button>
            </React.Fragment>
          ))}
          {chain.length > 1 && <span style={{ opacity: 0.5 }}>/</span>}
          <span style={{ color: 'var(--muted)' }}>{n.kind}</span>
        </div>

        <div className="fieldblock">
          <input
            className="input"
            style={{ fontSize: 15, fontWeight: 600, padding: '10px 11px' }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            }}
            placeholder="Task title"
            aria-label="Task title"
          />
        </div>

        <div className="fieldblock">
          <span className="flabel">Status</span>
          <div className="statusbtns">
            {(['todo', 'doing', 'done'] as TaskStatus[]).map((s) => (
              <button key={s} className={cx(s, n.status === s && 'on')} onClick={() => setStatus(s)}>
                <span className={cx('status-dot', s)} style={{ marginTop: 0 }} />
                {s === 'todo' ? 'To do' : s === 'doing' ? 'Doing' : 'Done'}
              </button>
            ))}
          </div>
        </div>

        <div className="fieldblock">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="flabel">{isLeaf ? 'Progress' : 'Rolled-up progress'}</span>
            <span style={{ fontSize: 11.5, fontWeight: 650, color: 'var(--acc)' }}>
              {Math.round(m.progress)}%
            </span>
          </div>
          <input
            className="slider"
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(isLeaf ? n.progress : m.progress)}
            disabled={!isLeaf}
            style={{ ['--val' as string]: `${Math.round(isLeaf ? n.progress : m.progress)}%`, opacity: isLeaf ? 1 : 0.55 }}
            onChange={(e) =>
              dispatch({ type: 'UPDATE_NODE', id: n.id, patch: { progress: Number(e.target.value) } })
            }
          />
          <span style={{ fontSize: 10, color: 'var(--faint)' }}>
            {isLeaf
              ? 'Leaf tasks own their progress.'
              : `Derived from ${m.children} child branches. Edit the leaves to move this.`}
          </span>
        </div>

        <div className="row2">
          <div className="fieldblock">
            <span className="flabel">Budget line ({view.currency})</span>
            <input
              className="input"
              inputMode="decimal"
              value={boqInput}
              placeholder="0.00"
              onChange={(e) => setBoqInput(e.target.value)}
              onBlur={commitBoq}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              }}
            />
          </div>
          <div className="fieldblock">
            <span className="flabel">Rolled-up BOQ</span>
            <div
              className="input"
              style={{
                display: 'flex',
                alignItems: 'center',
                height: 34,
                color: 'var(--acc)',
                fontWeight: 600,
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              {fmtMoney(m.boq, view.currency)}
            </div>
          </div>
        </div>

        <div className="fieldblock">
          <span className="flabel">Notes</span>
          <textarea
            className="textarea"
            value={notes}
            placeholder="Constraints, decisions, next action…"
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => {
              if (notes !== (n.notes ?? '')) dispatch({ type: 'UPDATE_NODE', id: n.id, patch: { notes } });
            }}
          />
        </div>

        <div className="section-label">Structure</div>
        <div className="row2">
          <div className="kv"><span>Children</span><span>{m.children}</span></div>
          <div className="kv"><span>Descendants</span><span>{m.descendants}</span></div>
          <div className="kv"><span>Bridges</span><span>{m.degree}</span></div>
          <div className="kv"><span>Done in branch</span><span>{m.doneCount}</span></div>
        </div>

        <div className="section-label">Bridges</div>
        {related.length === 0 && (
          <p style={{ fontSize: 11, color: 'var(--faint)', margin: 0, lineHeight: 1.5 }}>
            No bridges yet. Connect this node to another universe to make progress here ripple across profiles.
          </p>
        )}
        {related.map(({ link: l, other, otherU, direction }) => (
          <div key={l.id} className="linkrow">
            <div className="linkrow-main">
              <div className="linkrow-top">
                <span className="linkkind" style={{ ['--lc' as string]: linkKindMeta[l.kind].color }}>
                  {linkKindMeta[l.kind].label}
                </span>
                <span>{other?.title}</span>
              </div>
              <div className="linkrow-sub">
                {direction === 'out' ? '→' : '←'} {otherU?.code} · {l.label || linkKindMeta[l.kind].verb}
              </div>
            </div>
            <button className="iconbtn" onClick={() => other && onJump(other.id)} aria-label="Open linked node">
              <IconArrowUpRight size={13} />
            </button>
            <button
              className="iconbtn danger"
              onClick={() => dispatch({ type: 'DELETE_LINK', id: l.id })}
              aria-label="Delete bridge"
            >
              <IconTrash size={12} />
            </button>
          </div>
        ))}

        <div className="rowbtns">
          <button
            className="btn"
            title="Move under the previous sibling (Tab)"
            onClick={() => dispatch({ type: 'INDENT', id: n.id })}
          >
            ⇥ Indent
          </button>
          <button
            className="btn"
            title="Move out to the parent's level (Shift+Tab)"
            disabled={!n.parentId}
            onClick={() => dispatch({ type: 'OUTDENT', id: n.id })}
          >
            ⇤ Outdent
          </button>
        </div>

        <div className="rowbtns">
          <button
            className={cx('btn', pickerOpen && 'active')}
            onClick={() => setPickerOpen((v) => !v)}
          >
            <IconLink size={12} /> Connect to another node…
          </button>
          <button
            className="btn"
            onClick={() => {
              const rootNode = state.nodes.find(
                (x) => x.universeId === n.universeId && !x.parentId,
              );
              if (rootNode) onJump(rootNode.id);
            }}
          >
            <IconArrowUpRight size={12} /> Universe root
          </button>
        </div>

        {pickerOpen && (
          <div className="bridgepicker">
            <div className="bridgepicker-top">
              <input
                className="input"
                autoFocus
                placeholder="Search any task in any universe…"
                value={pickerQuery}
                onChange={(e) => setPickerQuery(e.target.value)}
                aria-label="Search bridge target"
              />
            </div>
            <div className="bridgepicker-top">
              <span className="flabel" style={{ whiteSpace: 'nowrap' }}>
                Relation
              </span>
              <select
                className="select"
                style={{ height: 26, fontSize: 10.5, flex: 1 }}
                value={pickerKind}
                onChange={(e) => setPickerKind(e.target.value as LinkKind)}
              >
                {LINK_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {linkKindMeta[k].label} — {linkKindMeta[k].verb}
                  </option>
                ))}
              </select>
            </div>
            <div className="bridgepicker-list">
              {pickerResults.length === 0 && (
                <div className="bridgepicker-empty">
                  {state.nodes.length <= 1
                    ? 'Create tasks in another universe first.'
                    : 'Nothing matches — try another search, or clear it to see every task.'}
                </div>
              )}
              {pickerResults.map(({ node: target, universe: targetU, cross }) => (
                <button
                  key={target.id}
                  className={cx('bpresult', cross && 'cross')}
                  style={{ ['--bp-acc' as string]: targetU?.accent ?? 'var(--acc)' }}
                  onClick={() => {
                    dispatch({
                      type: 'ADD_LINK',
                      from: n.id,
                      to: target.id,
                      kind: pickerKind,
                    });
                    setPickerOpen(false);
                    setPickerQuery('');
                  }}
                >
                  <span className="bpresult-code">{targetU?.code ?? '??'}</span>
                  <span className="bpresult-main">
                    <span className="bpresult-title">{target.title}</span>
                    <span className="bpresult-sub">
                      {targetU?.name} · {target.kind}
                    </span>
                  </span>
                  {cross && <span className="bpresult-badge">cross</span>}
                </button>
              ))}
            </div>
            <div className="bridgepicker-foot">
              <IconLink size={10} />
              {crossUniverseCandidates(pickerResults)} of {pickerResults.length} shown are from other universes
            </div>
          </div>
        )}
      </div>

      <div className="drawer-foot">
        <button className="btn primary" onClick={() => dispatch({ type: 'ADD_NODE', parentId: n.id })}>
          <IconPlus size={13} /> Add child
        </button>
        <button
          className="btn"
          onClick={() =>
            dispatch({
              type: 'ADD_NODE',
              parentId: n.parentId,
              universeId: n.universeId,
            })
          }
        >
          <IconCopy size={12} /> Add sibling
        </button>
        <div className="spacer" />
        <button
          className="iconbtn danger"
          title="Delete node and its children"
          onClick={() => {
            const count = m.descendants + 1;
            if (count > 1) {
              const ok = window.confirm(`Delete “${n.title}” and ${m.descendants} child task${m.descendants === 1 ? '' : 's'}?`);
              if (!ok) return;
            }
            dispatch({ type: 'DELETE_NODE', id: n.id });
            onClose();
          }}
        >
          <IconTrash size={14} />
        </button>
      </div>
    </aside>
  );
};
