import type {
  LinkKind,
  MindNode,
  NodeLink,
  SystemType,
  TaskStatus,
  Universe,
  UniverseKind,
} from '../types';

interface SeedTask {
  t: string;
  s?: TaskStatus;
  p?: number;
  boq?: number;
  note?: string;
  collapsed?: boolean;
  kids?: SeedTask[];
}

interface SeedUniverse {
  id: string;
  name: string;
  code: string;
  kind: UniverseKind;
  tagline: string;
  accent: string;
  accent2: string;
  glyph: string;
  system: SystemType;
  root: SeedTask;
}

interface SeedLink {
  from: string; // "Universe/Path/To/Node" — title path, "/" separated
  to: string;
  kind: LinkKind;
  label?: string;
  strength?: 1 | 2 | 3 | 4 | 5;
  directed?: boolean;
}

const universeSeeds: SeedUniverse[] = [
  {
    id: 'u-civil',
    name: 'Civil Works',
    code: 'CIV',
    kind: 'civil',
    tagline: 'Module A · BOQ, cadastre & build schedule',
    accent: '#f5c451',
    accent2: '#ff9d5c',
    glyph: '▦',
    system: 'mind',
    root: {
      t: 'Civil Works Programme',
      s: 'doing',
      note: 'Left-to-right build programme. BOQ lines roll up into the programme budget.',
      kids: [
        {
          t: 'Land Acquisition',
          s: 'doing',
          kids: [
            { t: 'Survey & title clearance', s: 'done', boq: 420 },
            { t: 'Valuation & compensation', s: 'doing', p: 70, boq: 1150 },
            { t: 'Deed registration', s: 'todo', p: 0, boq: 210 },
            { t: 'Encumbrance check', s: 'todo', p: 0, boq: 298 },
          ],
        },
        {
          t: 'Building 01 — Main House',
          s: 'doing',
          note: 'Two storey load-bearing shell, 232 m² footprint.',
          kids: [
            { t: 'Foundation & footing', s: 'done', boq: 860 },
            { t: 'Superstructure', s: 'doing', p: 55, boq: 1420 },
            { t: 'Roof & waterproofing', s: 'todo', p: 0, boq: 540 },
            { t: 'Finishes', s: 'todo', p: 0, boq: 300 },
            { t: 'MEP rough-in', s: 'doing', p: 25, boq: 620 },
          ],
        },
        {
          t: 'Utilities & Services',
          s: 'todo',
          kids: [
            { t: 'Water supply connection', s: 'doing', p: 40, boq: 190 },
            { t: 'Power & DB', s: 'todo', p: 0, boq: 260 },
            { t: 'Septic & drainage', s: 'todo', p: 0, boq: 0 },
          ],
        },
        {
          t: 'External Works',
          s: 'todo',
          kids: [
            { t: 'Boundary wall & gate', s: 'todo', p: 0, boq: 340 },
            { t: 'Driveway paving', s: 'todo', p: 0, boq: 120 },
            { t: 'Landscaping', s: 'todo', p: 0, boq: 90 },
          ],
        },
      ],
    },
  },
  {
    id: 'u-health',
    name: 'Health & Vitality',
    code: 'HLT',
    kind: 'health',
    tagline: 'Body, fuel & recovery loops',
    accent: '#4ade80',
    accent2: '#22d3ee',
    glyph: '✚',
    system: 'network',
    root: {
      t: 'Health & Vitality',
      s: 'doing',
      note: 'Recovery, movement and fuel are one system — a late night costs tomorrow’s lift.',
      kids: [
        {
          t: 'Fitness',
          s: 'doing',
          kids: [
            { t: 'Strength · 3× per week', s: 'doing', p: 60, boq: 45 },
            { t: 'Zone-2 cardio', s: 'doing', p: 35 },
            { t: 'Mobility routine', s: 'todo', p: 0 },
          ],
        },
        {
          t: 'Nutrition',
          s: 'doing',
          kids: [
            { t: 'Protein target · 1.6 g/kg', s: 'doing', p: 70 },
            { t: 'Meal prep Sundays', s: 'done' },
            { t: 'Hydration · 3 L', s: 'doing', p: 50 },
          ],
        },
        {
          t: 'Sleep & Recovery',
          s: 'doing',
          note: 'The highest leverage node in this universe.',
          kids: [
            { t: 'Sleep window · 7.5 h', s: 'doing', p: 55 },
            { t: 'Screen curfew · 22:30', s: 'todo', p: 20 },
            { t: 'Deload week', s: 'todo', p: 0 },
          ],
        },
        {
          t: 'Medical',
          s: 'doing',
          kids: [
            { t: 'Annual bloodwork', s: 'done', boq: 180 },
            { t: 'Dental check', s: 'todo', p: 0, boq: 90 },
            { t: 'Supplement audit', s: 'doing', p: 30 },
          ],
        },
      ],
    },
  },
  {
    id: 'u-finance',
    name: 'Finance',
    code: 'FIN',
    kind: 'finance',
    tagline: 'Cashflow, buffers & compounding',
    accent: '#60a5fa',
    accent2: '#818cf8',
    glyph: '◈',
    system: 'mind',
    root: {
      t: 'Net Worth Engine',
      s: 'doing',
      note: 'Every node is a target, not a log. Amounts are goals in USD.',
      kids: [
        {
          t: 'Income Streams',
          s: 'doing',
          kids: [
            { t: 'Salary', s: 'done' },
            { t: 'Freelance retainers', s: 'doing', p: 65, boq: 2400 },
            { t: 'Dividend income', s: 'todo', p: 15, boq: 900 },
          ],
        },
        {
          t: 'Savings & Buffer',
          s: 'doing',
          kids: [
            { t: 'Emergency fund · 6 months', s: 'doing', p: 72, boq: 4200 },
            { t: 'Sinking funds', s: 'doing', p: 40, boq: 1800 },
            { t: 'Tax reserve', s: 'todo', p: 0, boq: 1600 },
          ],
        },
        {
          t: 'Investments',
          s: 'doing',
          kids: [
            { t: 'Index DCA', s: 'doing', p: 80, boq: 3000 },
            { t: 'Gold allocation', s: 'todo', p: 25, boq: 800 },
            { t: 'REIT sleeve', s: 'todo', p: 5, boq: 500 },
          ],
        },
        {
          t: 'Debt',
          s: 'todo',
          kids: [
            { t: 'Credit card · clear', s: 'done' },
            { t: 'Vehicle lease', s: 'doing', p: 45, boq: 900 },
          ],
        },
      ],
    },
  },
  {
    id: 'u-personal',
    name: 'Personal Growth',
    code: 'PSN',
    kind: 'personal',
    tagline: 'Learning, people & side quests',
    accent: '#c084fc',
    accent2: '#f472b6',
    glyph: '✦',
    system: 'concept',
    root: {
      t: 'Personal Growth',
      s: 'doing',
      note: 'Compounding habits. Concept map: everything connects to something else.',
      kids: [
        {
          t: 'Learning',
          s: 'doing',
          kids: [
            { t: 'Systems design course', s: 'doing', p: 30, boq: 120 },
            { t: 'Reading · 24 books', s: 'doing', p: 55 },
            { t: 'Spoken Japanese', s: 'todo', p: 10 },
          ],
        },
        {
          t: 'Relationships',
          s: 'doing',
          kids: [
            { t: 'Weekly family call', s: 'done' },
            { t: 'Mentorship circle', s: 'doing', p: 50 },
            { t: 'Friend audit', s: 'todo', p: 0 },
          ],
        },
        {
          t: 'Side Projects',
          s: 'doing',
          kids: [
            { t: 'Portfolio site', s: 'doing', p: 60, boq: 12 },
            { t: 'CAD plugin', s: 'todo', p: 20 },
            { t: 'Writing series', s: 'todo', p: 5 },
          ],
        },
      ],
    },
  },
  {
    id: 'u-career',
    name: 'Career Trajectory',
    code: 'CAR',
    kind: 'career',
    tagline: 'Credentials, visibility & network',
    accent: '#f472b6',
    accent2: '#fb7185',
    glyph: '⬢',
    system: 'hybrid',
    root: {
      t: 'Career Trajectory',
      s: 'doing',
      note: 'Pull one lever: proof of work beats another certificate.',
      kids: [
        {
          t: 'Credentials',
          s: 'doing',
          kids: [
            { t: 'Chartership / PMP', s: 'doing', p: 25, boq: 400 },
            { t: 'CAD certification', s: 'todo', p: 0, boq: 180 },
          ],
        },
        {
          t: 'Visibility',
          s: 'doing',
          kids: [
            { t: 'Case-study posts', s: 'doing', p: 45 },
            { t: 'Conference talk', s: 'todo', p: 10 },
          ],
        },
        {
          t: 'Network',
          s: 'doing',
          kids: [
            { t: 'Peer review circle', s: 'doing', p: 30 },
            { t: 'Industry mentors', s: 'todo', p: 0 },
          ],
        },
      ],
    },
  },
];

const linkSeeds: SeedLink[] = [
  {
    from: 'Civil Works/Building 01 — Main House',
    to: 'Finance/Savings & Buffer',
    kind: 'dependency',
    label: 'draws budget',
    strength: 5,
    directed: true,
  },
  {
    from: 'Civil Works/External Works',
    to: 'Personal Growth/Side Projects',
    kind: 'relation',
    label: 'shares weekends',
    strength: 2,
  },
  {
    from: 'Health & Vitality/Sleep & Recovery',
    to: 'Personal Growth/Learning',
    kind: 'flow',
    label: 'focus fuel',
    strength: 4,
    directed: true,
  },
  {
    from: 'Finance/Income Streams',
    to: 'Career Trajectory/Visibility',
    kind: 'flow',
    label: 'feeds',
    strength: 3,
    directed: true,
  },
  {
    from: 'Personal Growth/Learning',
    to: 'Career Trajectory/Credentials',
    kind: 'dependency',
    label: 'prerequisite',
    strength: 3,
    directed: true,
  },
  {
    from: 'Civil Works/Land Acquisition',
    to: 'Finance/Savings & Buffer/Tax reserve',
    kind: 'dependency',
    label: 'needs reserve',
    strength: 3,
    directed: true,
  },
  {
    from: 'Health & Vitality/Medical',
    to: 'Finance/Savings & Buffer',
    kind: 'relation',
    label: 'buffer against',
    strength: 4,
  },
  {
    from: 'Career Trajectory/Network',
    to: 'Civil Works/Land Acquisition',
    kind: 'relation',
    label: 'permits & approvals',
    strength: 2,
  },
  {
    from: 'Personal Growth/Side Projects',
    to: 'Career Trajectory/Visibility',
    kind: 'reference',
    label: 'portfolio proof',
    strength: 3,
    directed: true,
  },
  {
    from: 'Health & Vitality/Fitness',
    to: 'Health & Vitality/Sleep & Recovery',
    kind: 'dependency',
    label: 'recovers via',
    strength: 5,
    directed: true,
  },
  {
    from: 'Finance/Investments',
    to: 'Finance/Savings & Buffer',
    kind: 'contrast',
    label: 'rebalances',
    strength: 2,
  },
  {
    from: 'Personal Growth/Relationships',
    to: 'Health & Vitality/Sleep & Recovery',
    kind: 'relation',
    label: 'evening rhythm',
    strength: 2,
  },
];

const flatten = (spec: SeedUniverse): MindNode[] => {
  const nodes: MindNode[] = [];
  let counter = 0;

  const walk = (
    task: SeedTask,
    parentId: string | null,
    depth: number,
    order: number,
  ): string => {
    const id = `n-${spec.id.replace('u-', '')}-${++counter}`;
    const node: MindNode = {
      id,
      universeId: spec.id,
      parentId,
      title: task.t,
      kind: depth === 0 ? 'root' : depth === 1 ? 'branch' : 'task',
      status: task.s ?? 'todo',
      progress: task.p ?? (task.s === 'done' ? 100 : 0),
      boq: task.boq ?? 0,
      notes: task.note,
      collapsed: task.collapsed,
      order,
    };
    nodes.push(node);
    (task.kids ?? []).forEach((kid, i) => walk(kid, id, depth + 1, i));
    return id;
  };

  walk(spec.root, null, 0, 0);
  return nodes;
};

export const seedUniverses: Universe[] = universeSeeds.map((spec, i) => ({
  id: spec.id,
  name: spec.name,
  code: spec.code,
  kind: spec.kind,
  tagline: spec.tagline,
  accent: spec.accent,
  accent2: spec.accent2,
  glyph: spec.glyph,
  currency: spec.id === 'u-civil' ? 'USD' : spec.id === 'u-finance' ? 'USD' : 'LKR',
  system: spec.system,
  createdAt: Date.now() - (universeSeeds.length - i) * 86400000,
}));

export const seedNodes: MindNode[] = universeSeeds.flatMap(flatten);

const pathIndex = new Map<string, string>();
for (const u of universeSeeds) {
  for (const n of seedNodes.filter((n) => n.universeId === u.id)) {
    const parent = n.parentId ? seedNodes.find((p) => p.id === n.parentId) : null;
    const path = parent?.kind === 'root' ? `${u.name}/${n.title}` : parent?.parentId ? `${u.name}/${parent.title}/${n.title}` : `${u.name}/${n.title}`;
    pathIndex.set(path.toLowerCase(), n.id);
  }
}

export const seedLinks: NodeLink[] = linkSeeds.map((l, i) => {
  const from = pathIndex.get(l.from.toLowerCase());
  const to = pathIndex.get(l.to.toLowerCase());
  if (!from || !to) throw new Error(`Seed link path not found: ${!from ? l.from : l.to}`);
  return {
    id: `l-seed-${i + 1}`,
    from,
    to,
    kind: l.kind,
    label: l.label,
    strength: l.strength ?? 3,
    directed: l.directed ?? false,
  };
});

export const universeKindLabel: Record<UniverseKind, string> = {
  civil: 'Build & works',
  health: 'Body & mind',
  finance: 'Money',
  personal: 'Life',
  career: 'Work',
  custom: 'Custom',
};

export const linkKindMeta: Record<
  LinkKind,
  { label: string; verb: string; color: string }
> = {
  relation: { label: 'Relation', verb: 'relates to', color: '#8b95ab' },
  dependency: { label: 'Dependency', verb: 'depends on', color: '#f5c451' },
  flow: { label: 'Flow', verb: 'flows to', color: '#4ade80' },
  reference: { label: 'Reference', verb: 'references', color: '#60a5fa' },
  contrast: { label: 'Contrast', verb: 'tensions with', color: '#f472b6' },
};
