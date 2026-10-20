import { MindMapTaskNode, CrossGroupLink } from '@/types/mindmap';
import { mockCivilTasks } from './mock-civil-tasks';
import { mockCivilSubtasks } from './mock-civil-subtasks';

export const initialMindMapTasks: MindMapTaskNode[] = [
  ...mockCivilTasks,
  ...mockCivilSubtasks,
  {
    id: 'task-health-hypertrophy',
    parentId: null,
    title: 'Strength & Hypertrophy Regimen',
    markdownNotes: 'Officer high-performance conditioning. 4-day Push/Pull/Legs/Civil Conditioning split.',
    groupCategory: 'Health',
    status: 'in_progress',
    priority: 'high',
    progress: 85,
    depth: 0,
    tags: ['Athletics', 'Gym'],
  },
  {
    id: 'subtask-vitamind-corrective',
    parentId: 'task-health-hypertrophy',
    title: 'Vitamin D3 (25-OH) Corrective Protocol (5,000 IU/day)',
    markdownNotes: 'Spawned automatically from Asiri Surgical lab report (Deficient: 24.2 ng/mL). Take with lunch.',
    groupCategory: 'Health',
    status: 'in_progress',
    priority: 'urgent',
    progress: 50,
    depth: 1,
    tags: ['Biomarker', 'Clinical', 'Supplements'],
  },
  {
    id: 'task-finance-capital',
    parentId: null,
    title: 'Personal & Project Financial Velocity',
    markdownNotes: 'Monthly cashflow budget allocation under 50/30/20 rule, sinking funds and debt liquidation.',
    groupCategory: 'Finance',
    status: 'in_progress',
    priority: 'high',
    progress: 78,
    depth: 0,
    tags: ['Finance', 'Capital'],
  },
  {
    id: 'subtask-civil-material-disbursement',
    parentId: 'task-finance-capital',
    title: 'Civil Material Direct Disbursement Fund',
    markdownNotes: 'Committed funds for Tor steel rebar and shuttering marine plywood.',
    groupCategory: 'Finance',
    status: 'in_progress',
    priority: 'urgent',
    progress: 90,
    depth: 1,
    tags: ['Disbursement', 'Committed'],
  },
];

export const initialCrossLinks: CrossGroupLink[] = [
  {
    id: 'link-1',
    sourceTaskId: 'subtask-civil-material-disbursement',
    targetTaskId: 'task-slab-rebar',
    targetGroup: 'Civil',
    relationshipType: 'depends_on',
    description: 'Rebar fabrication cannot proceed without material disbursement settlement.',
  },
  {
    id: 'link-2',
    sourceTaskId: 'subtask-vitamind-corrective',
    targetTaskId: 'task-health-hypertrophy',
    targetGroup: 'Health',
    relationshipType: 'relates_to',
    description: 'Neuromuscular recovery and peak 1RM squats linked to optimal calcitriol synthesis.',
  },
];
