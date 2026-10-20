/**
 * NEXUS LIFE-OS — Mind-map, BOQ & cross-link type contracts.
 */

export type TaskStatus = 'todo' | 'in-progress' | 'blocked' | 'done' | 'archived';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type GroupCategory = 'Work' | 'Health' | 'Finance' | 'Career' | 'Personal' | 'System';
export type Direction = 'LR' | 'TB';
export type RelationshipType = 'relates_to' | 'blocks' | 'depends_on';

export interface BoqLineItem {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  currency: 'USD' | 'LKR';
  actualQty?: number;
  actualRate?: number;
}

export interface TaskCashflow {
  estimatedCost: number;
  actualSpend: number;
  committed: number;
  currency: 'USD' | 'LKR';
  boq: BoqLineItem[];
}

export interface ContactLink {
  id: string;
  name: string;
  role: string;
  phone: string;
  organization?: string;
}

export interface TaskReminder {
  id: string;
  label: string;
  time: string;
  type: 'alarm' | 'calendar' | 'gcal';
}

export interface AiInsight {
  summary: string;
  directives: string[];
  generatedAt: string;
  confidence: number;
}

export interface MindMapTaskNode {
  id: string;
  parentId: string | null;
  boardId: string;
  title: string;
  markdownNotes: string;
  groupCategory: GroupCategory;
  direction: Direction;
  depth: number;
  posX: number;
  posY: number;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  isCollapsed: boolean;
  progress: number;
  isAutoCalculated: boolean;
  cashflow: TaskCashflow | null;
  reminders: TaskReminder[];
  attachments: string[];
  contacts: ContactLink[];
  aiInsight: AiInsight | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CrossGroupLink {
  id: string;
  sourceTaskId: string;
  targetTaskId: string;
  targetGroup: GroupCategory;
  relationshipType: RelationshipType;
  description: string;
  createdAt: string;
}

export interface BoardDefinition {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  accent: string;
}

export interface TaskSpace {
  id: string;
  label: string;
  groupCategory: GroupCategory;
}
