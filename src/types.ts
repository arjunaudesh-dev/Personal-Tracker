/* ------------------------------------------------------------------ *
 *  Orbit — universe of mind maps
 *  Core domain types
 * ------------------------------------------------------------------ */

export type Currency = 'USD' | 'LKR';

export type UniverseKind =
  | 'civil'
  | 'health'
  | 'finance'
  | 'personal'
  | 'career'
  | 'custom';

export type TaskStatus = 'todo' | 'doing' | 'done';

/** How a map is drawn. Systems can be layered together via 'hybrid'. */
export type SystemType = 'mind' | 'network' | 'concept' | 'hybrid';

/** Geometric arrangement of the graph. */
export type LayoutType = 'tree' | 'radial' | 'organic';

/** What the canvas is looking at. */
export type Scope = 'universe' | 'orbit' | 'constellation';

export type EdgeStyle = 'curve' | 'elbow' | 'straight' | 'arc';

/** Semantic relation for links that are not part of the tree. */
export type LinkKind =
  | 'relation'
  | 'dependency'
  | 'flow'
  | 'reference'
  | 'contrast';

export interface Universe {
  id: string;
  name: string;
  code: string;
  kind: UniverseKind;
  tagline: string;
  /** hex accents used for gradients, halos, orbit rings */
  accent: string;
  accent2: string;
  glyph: string;
  currency: Currency;
  /** default system used when the universe is opened */
  system: SystemType;
  createdAt: number;
}

export interface MindNode {
  id: string;
  universeId: string;
  parentId: string | null;
  title: string;
  kind: 'root' | 'branch' | 'task';
  status: TaskStatus;
  /** leaf progress 0–100; parents derive progress from children */
  progress: number;
  /** budget / bill-of-quantities amount, stored in USD */
  boq: number;
  notes?: string;
  collapsed?: boolean;
  order: number;
}

export interface NodeLink {
  id: string;
  from: string;
  to: string;
  kind: LinkKind;
  label?: string;
  strength: 1 | 2 | 3 | 4 | 5;
  style?: EdgeStyle;
  /** directional arrows for dependencies / flow */
  directed?: boolean;
}

export interface GraphLayers {
  hierarchy: boolean;
  network: boolean;
  concept: boolean;
}

export interface ViewSettings {
  scope: Scope;
  universeId: string | null;
  /** multi-universe filter for orbit scope */
  visibleUniverseIds: string[];
  system: SystemType;
  /** which systems are layered together — only meaningful for 'hybrid' */
  layers: GraphLayers;
  /** multi-universe scopes: draw each profile in its own preferred system */
  mixedSystems: boolean;
  layout: LayoutType;
  edgeStyle: EdgeStyle;
  showTreeEdges: boolean;
  showLinkLabels: boolean;
  currency: Currency;
  search: string;
  selectedId: string | null;
  linkMode: boolean;
  hiddenIds: string[];
  inspectorOpen: boolean;
}

export interface UniverseStats {
  nodes: number;
  done: number;
  doing: number;
  todo: number;
  progress: number;
  boq: number;
}

export interface NodeMeta {
  children: number;
  descendants: number;
  doneCount: number;
  progress: number;
  boq: number;
  degree: number;
}

export interface PlannedNode {
  node: MindNode;
  universe: Universe;
  meta: NodeMeta;
  depth: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GroupBox {
  universe: Universe;
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
  stats: UniverseStats;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Notice = { id: string; text: string; tone: 'ok' | 'info' | 'warn' };
