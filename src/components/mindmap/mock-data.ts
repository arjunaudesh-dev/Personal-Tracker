import type { CrossGroupLink, MindMapTaskNode } from '@/lib/types/mindmap';

import { addDays, isoDate, uid } from '@/lib/parser/utils';

import { CIVIL_MARINE_TASKS } from './mock-civil-tasks';
import { CIVIL_SLAB_TASKS } from './mock-civil-slab-tasks';
import { CIVIL_SEAWALL_TASKS } from './mock-seawall-tasks';
import { CIVIL_BOQ_SEEDS } from './mock-civil-subtasks';
import { HEALTH_TASKS } from './mock-health-tasks';
import { LIFE_TASKS } from './mock-life-tasks';
import { CATEGORY_BOARD } from './mock-multi-board';
import { rollupProgress } from './progress-rollup';

const ALL_SEEDS = [
  ...CIVIL_MARINE_TASKS,
  ...CIVIL_SEAWALL_TASKS,
  ...CIVIL_SLAB_TASKS,
  ...HEALTH_TASKS,
  ...LIFE_TASKS,
];

/** Deterministic leaf progress so the graph renders identically on every boot. */
const LEAF_PROGRESS: Record<string, number> = {
  'dock.fender': 100,
  'dock.bathymetry': 100,
  'dock.loadcase': 45,
  'dock.sim': 0,
  'dock.corrosion': 100,
  'dock.grout': 20,
  'seawall.rolls': 100,
  'seawall.seam': 70,
  'seawall.place': 0,
  'seawall.crest': 0,
  'slab.erect': 100,
  'slab.strike': 100,
  'slab.procure': 32,
  'slab.cut': 25,
  'slab.nails.est': 100,
  'slab.nhq.draft': 100,
  'slab.nhq.submit': 15,
  'health.push': 60,
  'health.pull': 0,
  'health.legs': 0,
  'health.condition': 0,
  'health.tdee': 55,
  'health.hydration': 72,
  'health.sleep': 88,
  'health.vitd': 40,
  'health.lipid': 0,
  'health.hba1c': 0,
  'finance.needs': 62,
  'finance.wants': 48,
  'finance.savings': 55,
  'finance.sinking': 58,
  'finance.reserve': 100,
  'finance.vehicle': 65,
  'finance.lease': 0,
  'career.license': 25,
  'career.course': 50,
  'career.crm': 70,
  'personal.vehicle': 0,
  'personal.home': 0,
  'system.cmsys': 66,
  'system.alarms': 100,
};

function buildBoq(key: string, estimated: number, actual: number, committed: number) {
  const lines = CIVIL_BOQ_SEEDS[key];
  if (!lines) {
    return {
      estimatedCost: estimated,
      actualSpend: actual,
      committed,
      currency: 'USD' as const,
      boq: [],
    };
  }
  return {
    estimatedCost: estimated,
    actualSpend: actual,
    committed,
    currency: 'USD' as const,
    boq: lines.map((l) => ({ ...l, id: uid('boq') })),
  };
}

export function createInitialTasks(): MindMapTaskNode[] {
  const today = isoDate();
  const depthOf = (key: string): number => {
    let depth = 0;
    let cursor = ALL_SEEDS.find((s) => s.key === key)?.parent ?? null;
    while (cursor) {
      depth += 1;
      cursor = ALL_SEEDS.find((s) => s.key === cursor)?.parent ?? null;
    }
    return depth;
  };

  const nodes = ALL_SEEDS.map((seed) => {
    const estimated = seed.estimatedCost ?? 0;
    const actual = seed.actualSpend ?? 0;
    const committed = seed.committed ?? 0;
    const isLeaf = !ALL_SEEDS.some((s) => s.parent === seed.key);

    return {
      id: seed.key,
      parentId: seed.parent,
      boardId: CATEGORY_BOARD[seed.category] ?? 'master',
      title: seed.title,
      markdownNotes: seed.notes,
      groupCategory: seed.category,
      direction: 'LR',
      depth: depthOf(seed.key),
      posX: 0,
      posY: 0,
      status: seed.status,
      priority: seed.priority,
      tags: seed.tags,
      isCollapsed: false,
      progress: isLeaf ? (LEAF_PROGRESS[seed.key] ?? 0) : 0,
      isAutoCalculated: !isLeaf,
      cashflow:
        estimated > 0 || actual > 0 || committed > 0
          ? buildBoq(seed.key, estimated, actual, committed)
          : null,
      reminders: [],
      attachments: [],
      contacts: [],
      aiInsight: null,
      dueDate: seed.dueInDays !== undefined ? addDays(today, seed.dueInDays) : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } satisfies MindMapTaskNode;
  });

  return rollupProgress(nodes);
}

/** Cross-system dependency web that links the civil, health and finance boards. */
export const INITIAL_LINKS: CrossGroupLink[] = [
  {
    id: 'link_sink_dock',
    sourceTaskId: 'finance.sinking',
    targetTaskId: 'dock',
    targetGroup: 'Work',
    relationshipType: 'relates_to',
    description: 'Civil capital sinking fund ring-fences the harbour mooring package.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'link_sleep_sim',
    sourceTaskId: 'health.sleep',
    targetTaskId: 'dock.sim',
    targetGroup: 'Work',
    relationshipType: 'blocks',
    description: 'Tidal window simulation must not run under sleep debt — operator judgement load.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'link_course_tension',
    sourceTaskId: 'career.course',
    targetTaskId: 'dock.tension',
    targetGroup: 'Work',
    relationshipType: 'relates_to',
    description: 'Structural detailing course directly improves mooring load case modelling.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'link_vehicle_loan',
    sourceTaskId: 'personal.vehicle',
    targetTaskId: 'finance.vehicle',
    targetGroup: 'Finance',
    relationshipType: 'depends_on',
    description: 'Fitness certificate renewal depends on servicing the vehicle loan account.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'link_vitd_lipid',
    sourceTaskId: 'health.vitd',
    targetTaskId: 'health.lipid',
    targetGroup: 'Health',
    relationshipType: 'depends_on',
    description: 'Correct vitamin D before the 8-week lipid re-test to avoid confounded results.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'link_crm_nhq',
    sourceTaskId: 'career.crm',
    targetTaskId: 'slab.nhq',
    targetGroup: 'Work',
    relationshipType: 'relates_to',
    description: 'NHQ concurrence routed through the district engineer in the personnel CRM.',
    createdAt: new Date().toISOString(),
  },
];
