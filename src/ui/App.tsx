import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TrackerProvider, useTracker } from '../store/store';
import { aggregateStats, computeMeta, buildForest } from '../lib/rollup';
import { planGraph } from '../lib/layout';
import { universeKindLabel } from '../data/seed';
import { cx, fmtMoney, relativeTime } from '../lib/utils';
import { Canvas } from './Canvas';
import { Toolbar } from './Toolbar';
import { StatsStrip, type Stat } from './StatsStrip';
import { Inspector } from './Inspector';
import { UniverseRail } from './UniverseRail';
import { UniverseModal } from './UniverseModal';
import { Toasts } from './Toasts';
import { layerPreset } from '../lib/layers';
import {
  IconHelp,
  IconOrbit,
  IconPlus,
  IconRedo,
  IconUndo,
} from './icons';

const TrackerApp: React.FC = () => {
  const { state, dispatch, toast, toasts, undo, redo, canUndo, canRedo } = useTracker();
  const { view } = state;

  const [railOpen, setRailOpen] = useState(false);
  const [viewbarOpen, setViewbarOpen] = useState(true);
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; id?: string } | null>(null);
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [focusTarget, setFocusTarget] = useState<{ id: string; nonce: number } | null>(null);

  const meta = useMemo(() => computeMeta(state.nodes, state.links), [state.nodes, state.links]);
  const forest = useMemo(() => buildForest(state.nodes), [state.nodes]);

  const [stageH, setStageH] = useState(0);
  const stageRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setStageH(el.clientHeight));
    ro.observe(el);
    setStageH(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  const plan = useMemo(
    () =>
      planGraph(state.universes, state.nodes, state.links, meta, view, {
        // band the tree so the whole universe fits the stage at a readable zoom
        targetHeight: stageH ? Math.max(320, Math.min(820, stageH * 1.25)) : 560,
      }),
    [state.universes, state.nodes, state.links, meta, view, stageH],
  );


  const currentUniverse =
    state.universes.find((u) => u.id === view.universeId) ?? state.universes[0];

  const scopeUniverses =
    view.scope === 'universe'
      ? currentUniverse
        ? [currentUniverse]
        : []
      : state.universes.filter((u) => view.visibleUniverseIds.includes(u.id));

  const agg = useMemo(
    () => aggregateStats(scopeUniverses, state.nodes, meta),
    [scopeUniverses, state.nodes, meta],
  );

  const bridges = state.links.length;
  const crossBridges = useMemo(() => {
    let n = 0;
    for (const l of state.links) {
      const a = forest.byId.get(l.from);
      const b = forest.byId.get(l.to);
      if (a && b && a.universeId !== b.universeId) n += 1;
    }
    return n;
  }, [state.links, forest]);

  const matchCount = useMemo(() => {
    const q = view.search.trim().toLowerCase();
    if (!q) return null;
    return plan.nodes.filter(
      (p) =>
        p.node.title.toLowerCase().includes(q) ||
        (p.node.notes ?? '').toLowerCase().includes(q),
    ).length;
  }, [view.search, plan.nodes]);

  const selectedNode = state.nodes.find((n) => n.id === view.selectedId) ?? null;
  const editingUniverse = modal?.id ? state.universes.find((u) => u.id === modal.id) : undefined;

  /* ------------------------- actions ------------------------- */

  const openUniverse = useCallback(
    (id: string) => {
      dispatch({
        type: 'VIEW',
        patch: { scope: 'universe', universeId: id, selectedId: null, linkMode: false, search: '' },
      });
      setSelectedLink(null);
      setRailOpen(false);
    },
    [dispatch],
  );

  const openBridge = useCallback(
    (universeId: string, nodeId: string) => {
      dispatch({
        type: 'VIEW',
        patch: {
          scope: 'universe',
          universeId,
          selectedId: nodeId,
          inspectorOpen: true,
          linkMode: false,
          search: '',
        },
      });
      setFocusTarget({ id: nodeId, nonce: Date.now() });
      setSelectedLink(null);
    },
    [dispatch],
  );

  const jumpToNode = useCallback(
    (id: string) => {
      const node = state.nodes.find((n) => n.id === id);
      if (!node) return;
      dispatch({
        type: 'VIEW',
        patch: {
          scope: 'universe',
          universeId: node.universeId,
          selectedId: id,
          inspectorOpen: true,
          linkMode: false,
        },
      });
      setFocusTarget({ id, nonce: Date.now() });
      setSelectedLink(null);
    },
    [dispatch, state.nodes],
  );

  const selectNode = useCallback(
    (id: string) => {
      dispatch({ type: 'SELECT', id });
      setSelectedLink(null);
      setHelpOpen(false);
    },
    [dispatch],
  );

  const addRoot = useCallback(() => {
    const targetId = view.universeId ?? state.universes[0]?.id;
    if (!targetId) return;
    if (view.scope !== 'universe') {
      dispatch({ type: 'VIEW', patch: { scope: 'universe', universeId: targetId } });
    }
    dispatch({ type: 'ADD_NODE', parentId: null, universeId: targetId });
  }, [dispatch, state.universes, view.scope, view.universeId]);

  const deleteSelected = useCallback(() => {
    if (!view.selectedId) return;
    const node = state.nodes.find((n) => n.id === view.selectedId);
    if (!node) return;
    const m = meta.get(node.id);
    if ((m?.descendants ?? 0) > 0) {
      const ok = window.confirm(
        `Delete “${node.title}” and its ${m?.descendants} child task${m?.descendants === 1 ? '' : 's'}?`,
      );
      if (!ok) return;
    }
    dispatch({ type: 'DELETE_NODE', id: node.id });
    setSelectedLink(null);
  }, [dispatch, meta, state.nodes, view.selectedId]);

  const handleSearchEnter = useCallback(() => {
    const q = view.search.trim().toLowerCase();
    if (!q) return;
    const candidates = state.nodes.filter((n) => n.title.toLowerCase().includes(q));
    if (!candidates.length) {
      toast('No task matched that search', 'warn');
      return;
    }
    const preferred =
      candidates.find((n) =>
        view.scope === 'universe' ? n.universeId === view.universeId : view.visibleUniverseIds.includes(n.universeId),
      ) ?? candidates[0];
    jumpToNode(preferred.id);
  }, [state.nodes, view.search, view.scope, view.universeId, view.visibleUniverseIds, jumpToNode, toast]);

  const openHelp = useCallback(() => {
    dispatch({ type: 'SELECT', id: null });
    dispatch({ type: 'VIEW', patch: { linkMode: false } });
    setSelectedLink(null);
    setHelpOpen(true);
  }, [dispatch]);

  /* ------------------------- shortcuts ------------------------- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (typing) return;
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }

      if (e.key === 'Escape') {
        if (modal) {
          setModal(null);
          return;
        }
        if (railOpen) {
          setRailOpen(false);
          return;
        }
        dispatch({ type: 'VIEW', patch: { linkMode: false, inspectorOpen: false } });
        dispatch({ type: 'SELECT', id: null });
        setSelectedLink(null);
        return;
      }

      if (typing) return;

      if (e.key === '/') {
        e.preventDefault();
        document.getElementById('orbit-search')?.focus();
        return;
      }
      if (e.key === 'Tab' && view.selectedId) {
        e.preventDefault();
        dispatch({
          type: e.shiftKey ? 'OUTDENT' : 'INDENT',
          id: view.selectedId,
        });
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        if (e.shiftKey || !view.selectedId) addRoot();
        else dispatch({ type: 'ADD_NODE', parentId: view.selectedId });
        return;
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        deleteSelected();
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        window.dispatchEvent(new CustomEvent('orbit:fit'));
        return;
      }
      if (e.key === 'l' || e.key === 'L') {
        dispatch({ type: 'VIEW', patch: { linkMode: !view.linkMode } });
        return;
      }
      if (['1', '2', '3', '4'].includes(e.key)) {
        const systems = ['mind', 'network', 'concept', 'hybrid'] as const;
        const sys = systems[Number(e.key) - 1];
        dispatch({ type: 'VIEW', patch: { system: sys, layers: layerPreset(sys) } });
        return;
      }
      if (e.key === '?') {
        e.preventDefault();
        openHelp();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    addRoot,
    deleteSelected,
    dispatch,
    modal,
    openHelp,
    railOpen,
    redo,
    undo,
    view.linkMode,
    view.selectedId,
  ]);

  /* ------------------------- stats ------------------------- */

  const stats: Stat[] =
    view.scope === 'universe'
      ? [
          {
            label: 'Tasks',
            value: agg.nodes,
            sub: `${plan.nodes.length} visible`,
            accent: currentUniverse?.accent,
            spark: 100 - agg.progress,
            seed: 1,
          },
          {
            label: 'Done',
            value: agg.done,
            sub: agg.nodes ? `${Math.round((agg.done / agg.nodes) * 100)}%` : '0%',
            accent: '#4ade80',
            spark: 40 + agg.progress / 2,
            seed: 2,
          },
          {
            label: 'In progress',
            value: agg.doing,
            accent: '#f5c451',
            spark: agg.progress,
            seed: 3,
          },
          {
            label: 'Roll-up progress',
            value: `${Math.round(agg.progress)}%`,
            accent: currentUniverse?.accent,
            spark: agg.progress,
            seed: 4,
          },
          {
            label: 'Total BOQ value',
            value: (
              <span style={{ color: 'var(--acc)' }}>{fmtMoney(agg.boq, view.currency)}</span>
            ),
            accent: currentUniverse?.accent,
            seed: 5,
          },
        ]
      : [
          {
            label: 'Universes',
            value: plan.groups.length,
            sub: `of ${state.universes.length}`,
            accent: '#c7d2fe',
            spark: 80,
            seed: 1,
          },
          {
            label: 'Tasks',
            value: agg.nodes,
            accent: '#c7d2fe',
            spark: 55,
            seed: 2,
          },
          {
            label: 'Done',
            value: agg.done,
            sub: agg.nodes ? `${Math.round((agg.done / agg.nodes) * 100)}%` : '0%',
            accent: '#4ade80',
            spark: 40 + agg.progress / 2,
            seed: 3,
          },
          {
            label: 'Mean progress',
            value: `${Math.round(agg.progress)}%`,
            accent: '#a5b4fc',
            spark: agg.progress,
            seed: 4,
          },
          {
            label: 'Total BOQ value',
            value: (
              <span style={{ color: 'var(--acc)' }}>{fmtMoney(agg.boq, view.currency, { compact: true })}</span>
            ),
            accent: '#c7d2fe',
            seed: 5,
          },
        ];

  /* ------------------------- copy ------------------------- */

  const orbitAccent = '#c7d2fe';
  const accent = view.scope === 'universe' && currentUniverse ? currentUniverse.accent : orbitAccent;
  const accent2 =
    view.scope === 'universe' && currentUniverse ? currentUniverse.accent2 : '#818cf8';

  const eyebrowTop =
    view.scope === 'universe'
      ? `Universe ${currentUniverse?.code ?? ''}`
      : view.scope === 'orbit'
        ? 'Universe hub'
        : 'Constellation';

  const eyebrowBottom =
    view.scope === 'universe'
      ? universeKindLabel[currentUniverse?.kind ?? 'custom']
      : `${state.universes.length} profiles`;

  const title =
    view.scope === 'universe'
      ? currentUniverse?.name ?? 'Universe'
      : view.scope === 'orbit'
        ? 'Universe Hub'
        : 'Constellation';

  const subtitle =
    view.scope === 'universe'
      ? `${currentUniverse?.tagline ?? ''} · Edit a leaf and every parent recalculates. BOQ lines roll up into the universe budget.`
      : view.scope === 'orbit'
        ? 'Every profile is its own universe of tasks. Bridges cross between them — orbit view shows the whole system, and any glyph dives into its universe.'
        : 'Universes side by side. Compare roll-ups, trace cross-universe bridges and keep each profile visually distinct.';

  const glyph =
    view.scope === 'universe' ? currentUniverse?.glyph ?? '✦' : view.scope === 'orbit' ? '◉' : '✧';

  /* ------------------------- render ------------------------- */

  return (
    <div
      className="app"
      style={{
        ['--acc' as string]: accent,
        ['--acc2' as string]: accent2,
        ['--acc2-a08' as string]: `${accent2}1a`,
      }}
    >
      <div className="aurora" />

      <div className="shell">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark">O</div>
            <div className="brand-copy">
              <div className="brand-name">Orbit</div>
              <div className="brand-sub">A universe of mind maps</div>
            </div>
          </div>

          <div className="top-actions">
            <div className="seg" role="group" aria-label="Currency">
              {(['USD', 'LKR'] as const).map((c) => (
                <button
                  key={c}
                  className={cx(view.currency === c && 'on')}
                  style={{ ['--seg-accent' as string]: 'var(--acc)' }}
                  onClick={() => dispatch({ type: 'VIEW', patch: { currency: c } })}
                  title={`Show budgets in ${c}`}
                >
                  {c}
                </button>
              ))}
            </div>

            <button className="btn" onClick={() => setRailOpen(true)}>
              <IconOrbit size={13} />
              Universes
              <span className="pill" style={{ height: 19, padding: '0 6px' }}>
                {state.universes.length}
              </span>
            </button>

            <button
              className="btn icon"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (⌘/Ctrl+Z)"
              aria-label="Undo"
            >
              <IconUndo size={14} />
            </button>
            <button
              className="btn icon"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (⇧⌘/Ctrl+Z)"
              aria-label="Redo"
            >
              <IconRedo size={14} />
            </button>
            <button className="btn icon" onClick={openHelp} title="Shortcuts & help" aria-label="Help">
              <IconHelp size={14} />
            </button>
          </div>
        </header>

        <section className="headline">
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow">
              <span className="dot" style={{ width: 5, height: 5 }} />
              {eyebrowTop}
              <span className="slash">/</span>
              {eyebrowBottom}
              <span className="slash">/</span>
              {bridges} bridges
            </div>
            <div className="title-row">
              <span className="title-glyph">{glyph}</span>
              <h1>{title}</h1>
              {view.scope === 'universe' && (
                <span className="pill">
                  <span className="dot" />
                  <b>{agg.nodes}</b> tasks
                </span>
              )}
              {view.scope !== 'universe' && crossBridges > 0 && (
                <span className="pill" style={{ color: 'var(--acc)' }}>
                  ⤴ {crossBridges} cross-universe
                </span>
              )}
            </div>
            <div className="subtitle">{subtitle}</div>
          </div>

          <div className="head-actions">
            {view.scope === 'universe' ? (
              <>
                <button className="btn" onClick={() => setModal({ mode: 'create' })}>
                  <IconPlus size={13} /> New universe
                </button>
                <button className="btn primary" onClick={addRoot} title="Add a root branch (Shift+N)">
                  <IconPlus size={14} /> Root branch
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn"
                  onClick={() => {
                    const first = state.universes.find((u) =>
                      view.visibleUniverseIds.includes(u.id),
                    );
                    if (first) openUniverse(first.id);
                  }}
                >
                  Open a universe
                </button>
                <button className="btn primary" onClick={() => setModal({ mode: 'create' })}>
                  <IconPlus size={14} /> New universe
                </button>
              </>
            )}
          </div>
        </section>

        <StatsStrip stats={stats} />

        <Toolbar
          state={state}
          dispatch={dispatch}
          viewbarOpen={viewbarOpen}
          onToggleViewbar={() => setViewbarOpen((v) => !v)}
          matchCount={matchCount}
          onSearchEnter={handleSearchEnter}
        />

        <main className="stage" ref={stageRef}>
          <Canvas
            plan={plan}
            view={view}
            meta={meta}
            state={state}
            dispatch={dispatch}
            currency={view.currency}
            selectedLinkId={selectedLink}
            onSelectLink={(id) => {
              setSelectedLink(id);
              if (id) dispatch({ type: 'VIEW', patch: { inspectorOpen: true } });
            }}
            onOpenUniverse={openUniverse}
            onOpenRail={() => setRailOpen(true)}
            onOpenBridge={openBridge}
            onSelectNode={selectNode}
            onToast={toast}
            focusTarget={focusTarget}
          />

          {railOpen && (
            <>
              <div className="scrim" onClick={() => setRailOpen(false)} />
              <UniverseRail
                state={state}
                dispatch={dispatch}
                meta={meta}
                onClose={() => setRailOpen(false)}
                onOpen={openUniverse}
                onCreate={() => {
                  setRailOpen(false);
                  setModal({ mode: 'create' });
                }}
                onEdit={(id) => {
                  setRailOpen(false);
                  setModal({ mode: 'edit', id });
                }}
                onJump={(universeId, nodeId) => {
                  setRailOpen(false);
                  openBridge(universeId, nodeId);
                }}
                onToast={toast}
              />
            </>
          )}

          {((selectedNode || selectedLink) && view.inspectorOpen) || helpOpen ? (
            <Inspector
              state={state}
              dispatch={dispatch}
              meta={meta}
              selectedLinkId={selectedLink}
              onClose={() => {
                dispatch({ type: 'VIEW', patch: { inspectorOpen: false } });
                dispatch({ type: 'SELECT', id: null });
                setSelectedLink(null);
                setHelpOpen(false);
              }}
              onJump={jumpToNode}
              onClearLink={() => {
                setSelectedLink(null);
                if (!selectedNode) dispatch({ type: 'VIEW', patch: { inspectorOpen: false } });
              }}
            />
          ) : null}
        </main>

        <footer className="hintbar">
          <div className="hints">
            <span>
              <b>Drag</b> to pan
            </span>
            <span>
              <b>Scroll</b> to zoom
            </span>
            <span>
              <b>Click</b> a node to inspect
            </span>
            <span>
              <b>Double-click</b> folds a branch
            </span>
            <span>
              <b>Shift + click</b> starts a bridge
            </span>
          </div>
          <div className="hints">
            <span>
              <span className="dot" style={{ width: 5, height: 5 }} />
              {bridges} bridges · {crossBridges} cross-universe
            </span>
            <span>
              {state.savedAt ? `Saved ${relativeTime(state.savedAt)}` : 'Saved locally'} · {view.currency}
            </span>
          </div>
        </footer>
      </div>

      {modal && (
        <UniverseModal
          mode={modal.mode}
          universe={editingUniverse}
          onClose={() => setModal(null)}
          onSubmit={(values) => {
            if (modal.mode === 'create') {
              dispatch({
                type: 'ADD_UNIVERSE',
                input: {
                  name: values.name,
                  kind: values.kind,
                  accent: values.accent,
                  accent2: values.accent2,
                  glyph: values.glyph,
                  system: values.system,
                  tagline: values.tagline,
                },
              });
              toast(`Universe “${values.name}” created`, 'ok');
            } else if (modal.id) {
              dispatch({
                type: 'UPDATE_UNIVERSE',
                id: modal.id,
                patch: {
                  name: values.name,
                  tagline: values.tagline,
                  kind: values.kind,
                  accent: values.accent,
                  accent2: values.accent2,
                  glyph: values.glyph,
                  system: values.system,
                },
              });
              toast('Universe updated', 'ok');
            }
            setModal(null);
          }}
        />
      )}

      <Toasts toasts={toasts} />
    </div>
  );
};

export const App: React.FC = () => (
  <TrackerProvider>
    <TrackerApp />
  </TrackerProvider>
);
