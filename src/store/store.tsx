import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import type {
  Currency,
  LinkKind,
  MindNode,
  NodeLink,
  TaskStatus,
  Universe,
  UniverseKind,
  ViewSettings,
} from '../types';
import { seedLinks, seedNodes, seedUniverses } from '../data/seed';
import { buildForest, subtreeIds } from '../lib/rollup';
import { uid } from '../lib/utils';
import { layerPreset } from '../lib/layers';

const STORAGE_KEY = 'orbit.tracker.v2';

interface Snapshot {
  universes: Universe[];
  nodes: MindNode[];
  links: NodeLink[];
}

export interface TrackerState extends Snapshot {
  view: ViewSettings;
  past: Snapshot[];
  future: Snapshot[];
  hydrated: boolean;
  savedAt: number | null;
}

const defaultView: ViewSettings = {
  scope: 'universe',
  universeId: 'u-civil',
  visibleUniverseIds: seedUniverses.map((u) => u.id),
  system: 'mind',
  layers: { hierarchy: true, network: false, concept: false },
  layout: 'tree',
  edgeStyle: 'curve',
  showTreeEdges: true,
  showLinkLabels: true,
  currency: 'USD',
  search: '',
  selectedId: null,
  linkMode: false,
  hiddenIds: [],
  inspectorOpen: false,
};

const initialState: TrackerState = {
  universes: seedUniverses,
  nodes: seedNodes,
  links: seedLinks,
  view: defaultView,
  past: [],
  future: [],
  hydrated: false,
  savedAt: null,
};

type Action =
  | { type: 'HYDRATE'; payload: Partial<Snapshot> & { view?: Partial<ViewSettings> } }
  | { type: 'VIEW'; patch: Partial<ViewSettings> }
  | { type: 'SELECT'; id: string | null }
  | { type: 'ADD_NODE'; parentId: string | null; universeId?: string; title?: string }
  | { type: 'UPDATE_NODE'; id: string; patch: Partial<MindNode> }
  | { type: 'DELETE_NODE'; id: string }
  | { type: 'TOGGLE_COLLAPSE'; id: string }
  | { type: 'EXPAND_ALL' }
  | { type: 'COLLAPSE_ALL' }
  | { type: 'INDENT'; id: string }
  | { type: 'OUTDENT'; id: string }
  | { type: 'ADD_LINK'; from: string; to: string; kind?: LinkKind; label?: string }
  | { type: 'UPDATE_LINK'; id: string; patch: Partial<NodeLink> }
  | { type: 'DELETE_LINK'; id: string }
  | {
      type: 'ADD_UNIVERSE';
      input: {
        name: string;
        kind: UniverseKind;
        accent: string;
        accent2: string;
        glyph: string;
        system?: Universe['system'];
        tagline?: string;
      };
    }
  | { type: 'UPDATE_UNIVERSE'; id: string; patch: Partial<Universe> }
  | { type: 'DELETE_UNIVERSE'; id: string }
  | { type: 'RESET' }
  | { type: 'IMPORT'; payload: Snapshot }
  | { type: 'UNDO' }
  | { type: 'REDO' };

const snapshot = (s: TrackerState): Snapshot => ({
  universes: s.universes,
  nodes: s.nodes,
  links: s.links,
});

const commit = (state: TrackerState, next: Partial<Snapshot>): TrackerState => ({
  ...state,
  ...next,
  past: [...state.past.slice(-40), snapshot(state)],
  future: [],
  savedAt: Date.now(),
});

const normalizeOrders = (nodes: MindNode[], parentId: string | null, universeId: string) => {
  const siblings = nodes
    .filter((n) => n.parentId === parentId && n.universeId === universeId)
    .sort((a, b) => a.order - b.order);
  const map = new Map(siblings.map((n, i) => [n.id, i]));
  return nodes.map((n) => (map.has(n.id) ? { ...n, order: map.get(n.id)! } : n));
};

const newUniverseId = () => uid('u');

const reducer = (state: TrackerState, action: Action): TrackerState => {
  switch (action.type) {
    case 'HYDRATE': {
      return {
        ...state,
        ...action.payload,
        view: { ...state.view, ...(action.payload.view ?? {}) },
        hydrated: true,
      };
    }

    case 'VIEW':
      return { ...state, view: { ...state.view, ...action.patch } };

    case 'SELECT':
      return {
        ...state,
        view: {
          ...state.view,
          selectedId: action.id,
          inspectorOpen: action.id ? true : state.view.inspectorOpen,
        },
      };

    case 'ADD_NODE': {
      const universeId =
        action.universeId ??
        (action.parentId
          ? state.nodes.find((n) => n.id === action.parentId)?.universeId
          : state.view.universeId) ??
        state.universes[0]?.id;
      const parent = action.parentId
        ? state.nodes.find((n) => n.id === action.parentId)
        : null;
      const siblings = state.nodes.filter(
        (n) => n.parentId === (parent?.id ?? null) && n.universeId === universeId,
      );
      const node: MindNode = {
        id: uid('n'),
        universeId,
        parentId: parent?.id ?? null,
        title: action.title ?? (parent ? 'New task' : 'New branch'),
        kind: !parent ? 'root' : parent.parentId ? 'task' : 'branch',
        status: 'todo',
        progress: 0,
        boq: 0,
        order: siblings.length,
      };
      const nodes = [...state.nodes.map((n) => (n.id === parent?.id ? { ...n, collapsed: false } : n)), node];
      return {
        ...commit(state, { nodes }),
        view: { ...state.view, selectedId: node.id, inspectorOpen: true, linkMode: false },
      };
    }

    case 'UPDATE_NODE': {
      const nodes = state.nodes.map((n) => (n.id === action.id ? { ...n, ...action.patch } : n));
      return commit(state, { nodes });
    }

    case 'DELETE_NODE': {
      const target = state.nodes.find((n) => n.id === action.id);
      if (!target) return state;
      const kill = new Set(subtreeIds(action.id, buildForest(state.nodes)));
      const nodes = state.nodes.filter((n) => !kill.has(n.id));
      const links = state.links.filter((l) => !kill.has(l.from) && !kill.has(l.to));
      return {
        ...commit(state, { nodes, links }),
        view: { ...state.view, selectedId: null, hiddenIds: state.view.hiddenIds.filter((id) => !kill.has(id)) },
      };
    }

    case 'TOGGLE_COLLAPSE': {
      const nodes = state.nodes.map((n) =>
        n.id === action.id ? { ...n, collapsed: !n.collapsed } : n,
      );
      return commit(state, { nodes });
    }

    case 'EXPAND_ALL': {
      const nodes = state.nodes.map((n) => (n.collapsed ? { ...n, collapsed: false } : n));
      return commit(state, { nodes });
    }

    case 'COLLAPSE_ALL': {
      const forest = buildForest(state.nodes);
      const nodes = state.nodes.map((n) => {
        const depth = (() => {
          let d = 0;
          let cur: MindNode | undefined = n;
          while (cur?.parentId) {
            cur = forest.byId.get(cur.parentId);
            d += 1;
            if (!cur) break;
          }
          return d;
        })();
        const collapsed = (forest.childrenOf.get(n.id) ?? []).length > 0 && depth >= 1;
        return n.collapsed === collapsed ? n : { ...n, collapsed };
      });
      return commit(state, { nodes });
    }

    case 'INDENT': {
      const node = state.nodes.find((n) => n.id === action.id);
      if (!node) return state;
      const siblings = state.nodes
        .filter((n) => n.parentId === node.parentId && n.universeId === node.universeId)
        .sort((a, b) => a.order - b.order);
      const idx = siblings.findIndex((n) => n.id === node.id);
      if (idx <= 0) return state;
      const prev = siblings[idx - 1];
      let nodes = state.nodes.map((n) =>
        n.id === node.id
          ? { ...n, parentId: prev.id, order: state.nodes.filter((c) => c.parentId === prev.id).length }
          : n.id === prev.id
            ? { ...n, collapsed: false }
            : n,
      );
      nodes = normalizeOrders(nodes, node.parentId, node.universeId);
      return commit(state, { nodes });
    }

    case 'OUTDENT': {
      const node = state.nodes.find((n) => n.id === action.id);
      if (!node?.parentId) return state;
      const parent = state.nodes.find((n) => n.id === node.parentId);
      if (!parent) return state;
      let nodes = state.nodes.map((n) =>
        n.id === node.id
          ? { ...n, parentId: parent.parentId, order: parent.order + 0.5 }
          : n,
      );
      nodes = normalizeOrders(nodes, parent.parentId, node.universeId);
      return commit(state, { nodes });
    }

    case 'ADD_LINK': {
      if (action.from === action.to) return state;
      const exists = state.links.find(
        (l) =>
          (l.from === action.from && l.to === action.to) ||
          (l.from === action.to && l.to === action.from),
      );
      if (exists) return state;
      const link: NodeLink = {
        id: uid('l'),
        from: action.from,
        to: action.to,
        kind: action.kind ?? 'relation',
        label: action.label,
        strength: 3,
        directed: action.kind === 'dependency' || action.kind === 'flow',
      };
      return commit(state, { links: [...state.links, link] });
    }

    case 'UPDATE_LINK': {
      const links = state.links.map((l) => (l.id === action.id ? { ...l, ...action.patch } : l));
      return commit(state, { links });
    }

    case 'DELETE_LINK':
      return commit(state, { links: state.links.filter((l) => l.id !== action.id) });

    case 'ADD_UNIVERSE': {
      const id = newUniverseId();
      const universe: Universe = {
        id,
        name: action.input.name.trim() || 'Untitled Universe',
        code: (action.input.name.trim() || 'NEW').slice(0, 3).toUpperCase(),
        kind: action.input.kind,
        tagline: action.input.tagline?.trim() || 'A fresh universe of tasks',
        accent: action.input.accent,
        accent2: action.input.accent2,
        glyph: action.input.glyph,
        currency: state.view.currency === 'LKR' ? 'LKR' : 'USD',
        system: action.input.system ?? 'mind',
        createdAt: Date.now(),
      };
      const root: MindNode = {
        id: uid('n'),
        universeId: id,
        parentId: null,
        title: universe.name,
        kind: 'root',
        status: 'doing',
        progress: 0,
        boq: 0,
        order: 0,
      };
      return {
        ...commit(state, {
          universes: [...state.universes, universe],
          nodes: [...state.nodes, root],
        }),
        view: {
          ...state.view,
          scope: 'universe',
          universeId: id,
          selectedId: null,
          inspectorOpen: false,
          visibleUniverseIds: [...state.view.visibleUniverseIds, id],
          search: '',
        },
      };
    }

    case 'UPDATE_UNIVERSE': {
      const universes = state.universes.map((u) =>
        u.id === action.id ? { ...u, ...action.patch } : u,
      );
      return commit(state, { universes });
    }

    case 'DELETE_UNIVERSE': {
      if (state.universes.length <= 1) return state;
      const killNodes = new Set(
        state.nodes.filter((n) => n.universeId === action.id).map((n) => n.id),
      );
      const nodes = state.nodes.filter((n) => !killNodes.has(n.id));
      const links = state.links.filter((l) => !killNodes.has(l.from) && !killNodes.has(l.to));
      const universes = state.universes.filter((u) => u.id !== action.id);
      return {
        ...commit(state, { universes, nodes, links }),
        view: {
          ...state.view,
          scope: state.view.universeId === action.id ? 'orbit' : state.view.scope,
          universeId:
            state.view.universeId === action.id ? null : state.view.universeId,
          visibleUniverseIds: state.view.visibleUniverseIds.filter((id) => id !== action.id),
        },
      };
    }

    case 'RESET': {
      return {
        ...initialState,
        view: { ...defaultView },
        hydrated: true,
        past: [...state.past, snapshot(state)],
        future: [],
        savedAt: Date.now(),
      };
    }

    case 'IMPORT': {
      return {
        ...commit(state, {
          universes: action.payload.universes,
          nodes: action.payload.nodes,
          links: action.payload.links,
        }),
        view: {
          ...state.view,
          scope: 'orbit',
          universeId: null,
          visibleUniverseIds: action.payload.universes.map((u) => u.id),
        },
      };
    }

    case 'UNDO': {
      const prev = state.past[state.past.length - 1];
      if (!prev) return state;
      return {
        ...state,
        ...prev,
        past: state.past.slice(0, -1),
        future: [snapshot(state), ...state.future].slice(0, 40),
        savedAt: Date.now(),
      };
    }

    case 'REDO': {
      const next = state.future[0];
      if (!next) return state;
      return {
        ...state,
        ...next,
        past: [...state.past, snapshot(state)],
        future: state.future.slice(1),
        savedAt: Date.now(),
      };
    }

    default:
      return state;
  }
};

export interface Toast {
  id: string;
  text: string;
  tone: 'ok' | 'info' | 'warn';
}

interface TrackerApi {
  state: TrackerState;
  dispatch: React.Dispatch<Action>;
  toasts: Toast[];
  toast: (text: string, tone?: Toast['tone']) => void;
  setCurrency: (c: Currency) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const TrackerContext = createContext<TrackerApi | null>(null);

export const TrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const toast = useCallback((text: string, tone: Toast['tone'] = 'info') => {
    const id = uid('t');
    setToasts((prev) => [...prev.slice(-2), { id, text, tone }]);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timers.current.delete(id);
    }, 3200);
    timers.current.set(id, timer);
  }, []);

  // hydrate from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Snapshot> & { view?: Partial<ViewSettings> };
        if (parsed.universes?.length && parsed.nodes?.length) {
          const ids = new Set(parsed.universes.map((u) => u.id));
          dispatch({
            type: 'HYDRATE',
            payload: {
              universes: parsed.universes,
              nodes: parsed.nodes,
              links: (parsed.links ?? []).filter(
                (l) => parsed.nodes!.some((n) => n.id === l.from) && parsed.nodes!.some((n) => n.id === l.to),
              ),
              view: {
                ...parsed.view,
                visibleUniverseIds: parsed.universes.map((u) => u.id),
                universeId:
                  parsed.view?.universeId && ids.has(parsed.view.universeId)
                    ? parsed.view.universeId
                    : parsed.universes[0].id,
                selectedId: null,
                linkMode: false,
                inspectorOpen: false,
              },
            },
          });
          return;
        }
      }
    } catch {
      /* corrupted storage — fall through to seed */
    }
    dispatch({ type: 'HYDRATE', payload: {} });
  }, []);

  // persist content immediately, view settings on a short debounce
  const viewRef = useRef(state.view);
  viewRef.current = state.view;
  const contentJson = useMemo(
    () =>
      JSON.stringify({
        universes: state.universes,
        nodes: state.nodes,
        links: state.links,
        version: 2,
      }),
    [state.universes, state.nodes, state.links],
  );

  useEffect(() => {
    if (!state.hydrated) return;
    const write = () => {
      try {
        const base = JSON.parse(contentJson) as Record<string, unknown>;
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...base, view: viewRef.current }),
        );
      } catch {
        /* quota or corrupted — ignore */
      }
    };
    const t = setTimeout(write, 320);
    return () => clearTimeout(t);
  }, [state.hydrated, contentJson, state.view]);

  // keep system in sync with the universe default when switching universes
  const prevUniverse = useRef<string | null>(null);
  useEffect(() => {
    const uidNow = state.view.scope === 'universe' ? state.view.universeId : null;
    if (uidNow && uidNow !== prevUniverse.current) {
      const u = state.universes.find((x) => x.id === uidNow);
      if (u) {
        dispatch({ type: 'VIEW', patch: { system: u.system, layers: layerPreset(u.system) } });
      }
    }
    prevUniverse.current = uidNow;
  }, [state.view.scope, state.view.universeId, state.universes]);

  const setCurrency = useCallback(
    (currency: Currency) => dispatch({ type: 'VIEW', patch: { currency } }),
    [],
  );

  const value = useMemo<TrackerApi>(
    () => ({
      state,
      dispatch,
      toasts,
      toast,
      setCurrency,
      undo: () => dispatch({ type: 'UNDO' }),
      redo: () => dispatch({ type: 'REDO' }),
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
    }),
    [state, toasts, toast, setCurrency],
  );

  return <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>;
};

export const useTracker = (): TrackerApi => {
  const ctx = useContext(TrackerContext);
  if (!ctx) throw new Error('useTracker must be used inside TrackerProvider');
  return ctx;
};

export const nextStatusOf = (status: TaskStatus): TaskStatus =>
  status === 'todo' ? 'doing' : status === 'doing' ? 'done' : 'todo';

export const statusPercentage = (status: TaskStatus, progress: number) =>
  status === 'done' ? 100 : status === 'todo' ? Math.min(progress, 10) : Math.max(progress, 18);
