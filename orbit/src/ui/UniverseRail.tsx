import React, { useMemo, useRef } from 'react';
import type { NodeMeta, Universe } from '../types';
import type { TrackerState } from '../store/store';
import { universeStats } from '../lib/rollup';
import { cx, fmtMoney } from '../lib/utils';
import { linkKindMeta, universeKindLabel } from '../data/seed';
import {
  IconArrowUpRight,
  IconClose,
  IconDownload,
  IconEye,
  IconEyeOff,
  IconPlus,
  IconSettings,
  IconTrash,
  IconUpload,
} from './icons';

interface Props {
  state: TrackerState;
  dispatch: React.Dispatch<any>;
  meta: Map<string, NodeMeta>;
  onClose: () => void;
  onOpen: (id: string) => void;
  onCreate: () => void;
  onEdit: (id: string) => void;
  onJump: (universeId: string, nodeId: string) => void;
  onToast: (text: string, tone?: 'ok' | 'info' | 'warn') => void;
}

export const UniverseRail: React.FC<Props> = ({
  state,
  dispatch,
  meta,
  onClose,
  onOpen,
  onCreate,
  onEdit,
  onJump,
  onToast,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const stats = useMemo(
    () =>
      new Map(
        state.universes.map((u) => [u.id, universeStats(u, state.nodes, meta)] as const),
      ),
    [state.universes, state.nodes, meta],
  );
  const totalBoq = [...stats.values()].reduce((s, x) => s + x.boq, 0);
  const totalNodes = state.nodes.length;
  const nodeById = useMemo(() => new Map(state.nodes.map((n) => [n.id, n])), [state.nodes]);
  const universeById = useMemo(
    () => new Map(state.universes.map((u) => [u.id, u])),
    [state.universes],
  );
  const bridges = useMemo(
    () =>
      state.links
        .map((l) => {
          const from = nodeById.get(l.from);
          const to = nodeById.get(l.to);
          if (!from || !to) return null;
          return {
            link: l,
            from,
            to,
            fromU: universeById.get(from.universeId),
            toU: universeById.get(to.universeId),
            cross: from.universeId !== to.universeId,
          };
        })
        .filter((b): b is NonNullable<typeof b> => !!b)
        .sort((a, b) => Number(b.cross) - Number(a.cross)),
    [state.links, nodeById, universeById],
  );
  const crossCount = bridges.filter((b) => b.cross).length;

  const toggleVisible = (u: Universe) => {
    const has = state.view.visibleUniverseIds.includes(u.id);
    const next = has
      ? state.view.visibleUniverseIds.filter((id) => id !== u.id)
      : [...state.view.visibleUniverseIds, u.id];
    if (!next.length) {
      onToast('Keep at least one universe visible', 'warn');
      return;
    }
    dispatch({ type: 'VIEW', patch: { visibleUniverseIds: next } });
  };

  const exportAll = () => {
    const payload = {
      app: 'orbit',
      version: 2,
      exportedAt: new Date().toISOString(),
      universes: state.universes,
      nodes: state.nodes,
      links: state.links,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orbit-universes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onToast('Exported all universes', 'ok');
  };

  const importAll = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed.universes) || !Array.isArray(parsed.nodes)) {
        throw new Error('bad shape');
      }
      dispatch({
        type: 'IMPORT',
        payload: {
          universes: parsed.universes,
          nodes: parsed.nodes,
          links: Array.isArray(parsed.links) ? parsed.links : [],
        },
      });
      onToast('Universe set imported', 'ok');
    } catch {
      onToast('That file is not a valid Orbit export', 'warn');
    }
  };

  return (
    <aside className="drawer left" aria-label="Universes">
      <div className="drawer-head">
        <div className="drawer-title">Universes</div>
        <span className="pill">
          <b>{state.universes.length}</b> profiles
        </span>
        <button className="iconbtn" onClick={onClose} aria-label="Close universes">
          <IconClose size={15} />
        </button>
      </div>

      <div className="drawer-body">
        <div className="row2">
          <div className="kv"><span>Total tasks</span><span>{totalNodes}</span></div>
          <div className="kv"><span>Total BOQ</span><span>{fmtMoney(totalBoq, state.view.currency, { compact: true })}</span></div>
        </div>

        <div className="section-label">Profiles</div>
        <div className="urail">
          {state.universes.map((u) => {
            const s = stats.get(u.id)!;
            const isVisible = state.view.visibleUniverseIds.includes(u.id);
            const active =
              (state.view.scope === 'universe' && state.view.universeId === u.id) ||
              false;
            return (
              <div
                key={u.id}
                className={cx('ucard', active && 'active')}
                style={{
                  ['--u-acc' as string]: u.accent,
                  ['--u-acc2' as string]: u.accent2,
                }}
                onClick={() => onOpen(u.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onOpen(u.id);
                }}
              >
                <div className="ucard-top">
                  <span className="uorb">{u.glyph}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="ucard-name">{u.name}</div>
                    <div className="ucard-code">
                      {u.code} · {universeKindLabel[u.kind]}
                    </div>
                  </div>
                  <div className="ucard-actions">
                    <button
                      className="iconbtn"
                      title={isVisible ? 'Hide from orbit' : 'Show in orbit'}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisible(u);
                      }}
                    >
                      {isVisible ? <IconEye size={13} /> : <IconEyeOff size={13} />}
                    </button>
                    <button
                      className="iconbtn"
                      title="Edit universe"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(u.id);
                      }}
                    >
                      <IconSettings size={13} />
                    </button>
                    {state.universes.length > 1 && (
                      <button
                        className="iconbtn danger"
                        title="Delete universe"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete “${u.name}” with ${s.nodes} tasks? Bridges into it will be removed too.`)) {
                            dispatch({ type: 'DELETE_UNIVERSE', id: u.id });
                            onToast('Universe deleted', 'info');
                          }
                        }}
                      >
                        <IconTrash size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="tinybar">
                  <i style={{ width: `${Math.max(1.5, s.progress)}%` }} />
                </div>

                <div className="ucard-stats">
                  <span><b>{s.nodes}</b> tasks</span>
                  <span><b>{Math.round(s.progress)}%</b> done</span>
                  <span><b>{fmtMoney(s.boq, state.view.currency, { compact: true })}</b></span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, color: 'var(--faint)' }}>
                  <span className="dot" style={{ width: 4, height: 4, background: u.accent, boxShadow: 'none' }} />
                  {u.system === 'mind' ? 'Mind map' : u.system === 'network' ? 'Network map' : u.system === 'concept' ? 'Concept map' : 'Hybrid'} · {u.tagline}
                </div>
              </div>
            );
          })}
        </div>

        <button
          className="btn"
          style={{ justifyContent: 'center', height: 36, borderStyle: 'dashed' }}
          onClick={onCreate}
        >
          <IconPlus size={13} /> New universe profile
        </button>

        <div className="section-label">
          Bridges
          <span className="pill" style={{ height: 18, padding: '0 6px', fontSize: 9 }}>
            {bridges.length} · {crossCount} cross
          </span>
        </div>
        {bridges.length === 0 && (
          <p style={{ fontSize: 11, color: 'var(--faint)', margin: 0, lineHeight: 1.5 }}>
            No bridges yet. Use <b style={{ color: 'var(--text)' }}>Link</b> on the canvas, then click
            two nodes — they can live in different universes.
          </p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 232, overflowY: 'auto' }}>
          {bridges.map(({ link, from, to, fromU, toU, cross }) => (
            <div key={link.id} className="linkrow" style={{ alignItems: 'center' }}>
              <div className="linkrow-main">
                <div className="linkrow-top">
                  <span className="linkkind" style={{ ['--lc' as string]: linkKindMeta[link.kind].color }}>
                    {cross ? '⇄' : linkKindMeta[link.kind].label}
                  </span>
                  <span>{from.title}</span>
                </div>
                <div className="linkrow-sub">
                  {fromU?.code} → {toU?.code} · {to.title}
                </div>
              </div>
              <button
                className="iconbtn"
                title={`Open ${to.title}`}
                onClick={() => onJump(to.universeId, to.id)}
              >
                <IconArrowUpRight size={13} />
              </button>
              <button
                className="iconbtn danger"
                title="Delete bridge"
                onClick={() => dispatch({ type: 'DELETE_LINK', id: link.id })}
              >
                <IconTrash size={12} />
              </button>
            </div>
          ))}
        </div>

        <div className="section-label">Universe tools</div>
        <div className="rowbtns">
          <button className="btn" onClick={exportAll}>
            <IconDownload size={12} /> Export JSON
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            <IconUpload size={12} /> Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importAll(f);
              e.target.value = '';
            }}
          />
          <button
            className="btn"
            onClick={() => {
              if (window.confirm('Reset to the demo universe set? This clears your saved changes.')) {
                dispatch({ type: 'RESET' });
                onToast('Demo universes restored', 'info');
              }
            }}
          >
            Reset demo
          </button>
        </div>
        <p style={{ fontSize: 10.5, color: 'var(--faint)', lineHeight: 1.6, margin: 0 }}>
          Universes are independent profiles. Bridges can cross any two profiles, and orbit view
          shows all bridges at once. Storage is local to this browser.
        </p>
      </div>
    </aside>
  );
};
