import React from 'react';
import type { Scope, SystemType, ViewSettings } from '../types';
import type { TrackerState } from '../store/store';
import { cx } from '../lib/utils';
import { layerPreset } from '../lib/layers';
import {
  IconClose,
  IconCompress,
  IconConcept,
  IconDown,
  IconExpand,
  IconHybrid,
  IconLink,
  IconMind,
  IconNetwork,
  IconSearch,
  IconSettings,
} from './icons';

interface Props {
  state: TrackerState;
  dispatch: React.Dispatch<any>;
  viewbarOpen: boolean;
  onToggleViewbar: () => void;
  matchCount: number | null;
  onSearchEnter: () => void;
}

const SYSTEMS: Array<{ id: SystemType; label: string; icon: React.ReactNode; hint: string }> = [
  { id: 'mind', label: 'Mind', icon: <IconMind size={13} />, hint: 'Hierarchy with left-to-right branches and roll-ups' },
  { id: 'network', label: 'Network', icon: <IconNetwork size={13} />, hint: 'Nodes as connected pills with degree weight' },
  { id: 'concept', label: 'Concept', icon: <IconConcept size={13} />, hint: 'Labelled, arrowed relationships between ideas' },
  { id: 'hybrid', label: 'Hybrid', icon: <IconHybrid size={13} />, hint: 'Mind hierarchy + network halos + concept labels' },
];

export const Toolbar: React.FC<Props> = ({
  state,
  dispatch,
  viewbarOpen,
  onToggleViewbar,
  matchCount,
  onSearchEnter,
}) => {
  const { view } = state;
  const setView = (patch: Partial<ViewSettings>) => dispatch({ type: 'VIEW', patch });

  const setScope = (scope: Scope) => {
    if (scope === 'universe' && !view.universeId) {
      setView({ scope, universeId: state.universes[0]?.id ?? null });
      return;
    }
    setView({ scope, selectedId: scope === 'universe' ? view.selectedId : null });
  };

  const allVisible = view.visibleUniverseIds.length === state.universes.length;
  const currentSystem = SYSTEMS.find((s) => s.id === view.system)!;

  return (
    <div className="toolbar-wrap">
      <div className="toolbar">
        <label className="search">
          <span className="s-icon">
            <IconSearch size={13} />
          </span>
          <input
            id="orbit-search"
            type="search"
            placeholder="Search branches, tasks, notes…"
            value={view.search}
            onChange={(e) => setView({ search: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSearchEnter();
              }
            }}
            aria-label="Search branches"
          />
          {view.search && (
            <button className="s-clear" onClick={() => setView({ search: '' })} aria-label="Clear search">
              <IconClose size={11} />
            </button>
          )}
        </label>

        <div className="seg" role="group" aria-label="Scope">
          {(['universe', 'orbit', 'constellation'] as Scope[]).map((s) => (
            <button
              key={s}
              className={cx(view.scope === s && 'on')}
              onClick={() => setScope(s)}
              title={
                s === 'universe'
                  ? 'One universe at a time'
                  : s === 'orbit'
                    ? 'All universes in orbit around the core'
                    : 'Universes side by side for comparison'
              }
            >
              {s === 'universe' ? 'Universe' : s === 'orbit' ? 'Orbit' : 'Constellation'}
            </button>
          ))}
        </div>

        {view.scope !== 'universe' && (
          <div className="chips">
            <button
              className={cx('chip', allVisible && 'on')}
              style={{ ['--chip-accent' as string]: '#c7d2fe' }}
              onClick={() => setView({ visibleUniverseIds: state.universes.map((u) => u.id) })}
            >
              All
            </button>
            {state.universes.map((u) => {
              const on = view.visibleUniverseIds.includes(u.id);
              return (
                <button
                  key={u.id}
                  className={cx('chip', on && 'on')}
                  style={{ ['--chip-accent' as string]: u.accent }}
                  onClick={() => {
                    const next = on
                      ? view.visibleUniverseIds.filter((id) => id !== u.id)
                      : [...view.visibleUniverseIds, u.id];
                    if (!next.length) return;
                    setView({ visibleUniverseIds: next });
                  }}
                  title={`${on ? 'Hide' : 'Show'} ${u.name}`}
                >
                  <span className="dot" style={{ background: u.accent, boxShadow: 'none' }} />
                  {u.code}
                  <span className="chip-count">{u.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="spacer" />

        <button
          className={cx('btn', view.linkMode && 'active')}
          onClick={() => setView({ linkMode: !view.linkMode })}
          title="Link two nodes — works across universes (L)"
        >
          <IconLink size={13} /> Link
        </button>

        <button
          className="btn"
          title="Expand every branch"
          onClick={() => dispatch({ type: 'EXPAND_ALL' })}
        >
          <IconExpand size={13} />
          <span className="hide-sm">Expand all</span>
        </button>
        <button
          className="btn icon"
          title="Collapse to top-level branches"
          aria-label="Collapse all"
          onClick={() => dispatch({ type: 'COLLAPSE_ALL' })}
        >
          <IconCompress size={13} />
        </button>

        <button className={cx('btn', viewbarOpen && 'active')} onClick={onToggleViewbar}>
          <IconSettings size={13} /> Systems
        </button>
      </div>

      {viewbarOpen && (
        <div className="viewbar">
          <div className="seg" role="group" aria-label="Graph system">
            {SYSTEMS.map((s) => (
              <button
                key={s.id}
                className={cx(view.system === s.id && 'on')}
                onClick={() => setView({ system: s.id, layers: layerPreset(s.id) })}
                title={s.hint}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>

          {view.system === 'hybrid' && (
            <div className="chips" style={{ marginLeft: 1 }}>
              {(
                [
                  ['hierarchy', 'Hierarchy', '#60a5fa'],
                  ['network', 'Network', '#c084fc'],
                  ['concept', 'Concepts', '#4ade80'],
                ] as const
              ).map(([k, label, color]) => (
                <button
                  key={k}
                  className={cx('chip', view.layers[k] && 'on')}
                  style={{ ['--chip-accent' as string]: color }}
                  onClick={() => {
                    const next = { ...view.layers, [k]: !view.layers[k] };
                    if (!next.hierarchy && !next.network && !next.concept) return;
                    setView({ layers: next });
                  }}
                  title={`Toggle the ${label.toLowerCase()} layer`}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 2,
                      background: view.layers[k] ? color : 'rgba(255,255,255,0.22)',
                    }}
                  />
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="vr" />

          <div className="field">
            Layout
            <select
              className="select"
              value={view.layout}
              onChange={(e) => setView({ layout: e.target.value as ViewSettings['layout'] })}
              aria-label="Layout"
            >
              <option value="tree">Tidy tree</option>
              <option value="radial">Radial</option>
              <option value="organic">Organic force</option>
            </select>
          </div>

          <div className="field">
            Edges
            <select
              className="select"
              value={view.edgeStyle}
              onChange={(e) => setView({ edgeStyle: e.target.value as ViewSettings['edgeStyle'] })}
              aria-label="Edge style"
            >
              <option value="curve">Curved</option>
              <option value="elbow">Elbow</option>
              <option value="straight">Straight</option>
              <option value="arc">Arc</option>
            </select>
          </div>

          <div className="vr" />

          <label className="toggle">
            <input
              type="checkbox"
              checked={view.showTreeEdges}
              onChange={(e) => setView({ showTreeEdges: e.target.checked })}
            />
            Tree edges
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={view.showLinkLabels}
              onChange={(e) => setView({ showLinkLabels: e.target.checked })}
            />
            Labels
          </label>

          <div className="spacer" />

          <span style={{ fontSize: 10, color: 'var(--faint)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="dot" style={{ background: 'var(--acc)', boxShadow: 'none' }} />
            {view.system === 'hybrid'
              ? `Mixed system — ${view.layers.hierarchy ? 'mind' : '—'} × ${view.layers.network ? 'network' : '—'} × ${view.layers.concept ? 'concept' : '—'}`
              : currentSystem.hint}
          </span>

          {matchCount !== null && (
            <span className="pill" style={{ borderColor: 'var(--line-2)' }}>
              <b>{matchCount}</b> matches
            </span>
          )}
        </div>
      )}
    </div>
  );
};
