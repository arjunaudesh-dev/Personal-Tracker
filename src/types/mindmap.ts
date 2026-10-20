export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type GroupCategory = 'Work' | 'Finance' | 'Health' | 'Personal' | 'Civil';
export type LinkRelation = 'relates_to' | 'blocks' | 'depends_on';

export interface BoqItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitRate: number;
  total: number;
  category?: 'Material' | 'Labor' | 'Equipment' | 'Subcontract';
}

export interface TaskCashflow {
  estimatedCost: number;
  actualSpend: number;
  currency: 'USD' | 'LKR';
  items?: BoqItem[];
}

export interface TaskReminder {
  id: string;
  time: string;
  label: string;
  syncedGCal?: boolean;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  size?: string;
  type?: 'pdf' | 'blueprint' | 'doc' | 'image';
}

export interface TaskContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  whatsapp?: string;
}

export interface TaskAiInsight {
  bottleneck: string;
  recommendation: string;
  generatedAt: string;
}

export interface MindMapTaskNode {
  id: string;
  userId?: string;
  parentId?: string | null;
  title: string;
  markdownNotes?: string;
  groupCategory: GroupCategory;
  direction?: 'LR';
  depth?: number;
  posX?: number;
  posY?: number;
  status: TaskStatus;
  priority: TaskPriority;
  tags?: string[];
  isCollapsed?: boolean;
  progress: number;
  isAutoCalculated?: boolean;
  cashflow?: TaskCashflow;
  reminders?: TaskReminder[];
  attachments?: TaskAttachment[];
  contacts?: TaskContact[];
  aiInsight?: TaskAiInsight;
  dueDate?: string;
  subtasks?: Array<{ id: string; title: string; completed: boolean }>;
}

export interface CrossGroupLink {
  id: string;
  sourceTaskId: string;
  targetTaskId: string;
  targetGroup: GroupCategory;
  relationshipType: LinkRelation;
  description?: string;
}

export interface BoardDefinition {
  id: string;
  name: string;
  description: string;
  category: GroupCategory;
  icon?: string;
}
