import { BoardDefinition } from '@/types/mindmap';

export const mockBoards: BoardDefinition[] = [
  {
    id: 'master-command',
    name: 'Master Command Canvas',
    description: 'Unified cross-functional graph across Civil Engineering, Finance, Health, and Logistics.',
    category: 'Work',
    icon: 'Layers',
  },
  {
    id: 'board-admin-slab',
    name: 'Admin Building Slab Concrete',
    description: 'Formwork shuttering, Tor steel rebar, NHQ concurrence, batching plant coordination.',
    category: 'Civil',
    icon: 'Building2',
  },
  {
    id: 'board-floating-dock',
    name: 'Harbor Floating Dock Mooring',
    description: 'Naval harbor anchor chain refurb, diver tension rigging, cathodic inspection.',
    category: 'Civil',
    icon: 'Anchor',
  },
  {
    id: 'board-sea-wall',
    name: 'Sea Wall Tidal Armoring',
    description: 'Geotextile membrane laying, rip-rap boulder placement, monsoon crest integrity.',
    category: 'Civil',
    icon: 'Shield',
  },
  {
    id: 'board-health-athletics',
    name: 'Health & Athletic Optimization',
    description: 'Hypertrophy workout splits, daily TDEE macro targets, clinical biomarker correction.',
    category: 'Health',
    icon: 'Activity',
  },
  {
    id: 'board-financial-capital',
    name: '50/30/20 Capital Velocity',
    description: 'Needs-Wants-Savings waterfall, sinking fund accrual, LKR/USD liquidity management.',
    category: 'Finance',
    icon: 'DollarSign',
  },
];
