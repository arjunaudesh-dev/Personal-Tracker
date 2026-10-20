import type { BoqLineItem } from '@/lib/types/mindmap';

/**
 * Itemised Bill of Quantities seeds for the civil works packages.
 * Each entry: description · unit · qty · rate (USD) with actual qty/rate where consumed.
 */
export const CIVIL_BOQ_SEEDS: Record<string, Omit<BoqLineItem, 'id'>[]> = {
  'dock.inspect': [
    { description: 'Underwater inspection diver team', unit: 'day', quantity: 4, rate: 620, currency: 'USD', actualQty: 4, actualRate: 610 },
    { description: 'Multibeam bathymetric survey', unit: 'km', quantity: 1.4, rate: 1_250, currency: 'USD', actualQty: 1.4, actualRate: 1_190 },
    { description: 'Bollard pull-out test (certified)', unit: 'no', quantity: 6, rate: 145, currency: 'USD', actualQty: 6, actualRate: 145 },
  ],
  'dock.tension': [
    { description: 'Mooring analysis software licence', unit: 'mo', quantity: 2, rate: 380, currency: 'USD', actualQty: 1, actualRate: 380 },
    { description: 'Senior marine engineer day rate', unit: 'day', quantity: 12, rate: 240, currency: 'USD', actualQty: 6, actualRate: 240 },
    { description: 'Tide gauge telemetry streaming', unit: 'mo', quantity: 3, rate: 160, currency: 'USD' },
  ],
  'dock.anchor': [
    { description: 'Non-shrink grout (25 kg bags)', unit: 'bag', quantity: 220, rate: 22, currency: 'USD', actualQty: 90, actualRate: 21 },
    { description: 'Galvanised anchor plate set', unit: 'set', quantity: 8, rate: 1_180, currency: 'USD', actualQty: 3, actualRate: 1_210 },
    { description: 'Torque testing rig hire', unit: 'day', quantity: 3, rate: 340, currency: 'USD', actualQty: 1, actualRate: 340 },
    { description: 'ULS certified torque technician', unit: 'day', quantity: 4, rate: 285, currency: 'USD', actualQty: 1, actualRate: 285 },
  ],
  'seawall.geotextile': [
    { description: '400 g/m² non-woven filter geotextile', unit: 'm²', quantity: 1_960, rate: 3.4, currency: 'USD', actualQty: 1_180, actualRate: 3.35 },
    { description: 'Seam tape (100 mm)', unit: 'roll', quantity: 90, rate: 26, currency: 'USD', actualQty: 58, actualRate: 26 },
    { description: 'Tape-seam testing (14 kPa)', unit: 'lap', quantity: 82, rate: 14.5, currency: 'USD', actualQty: 58, actualRate: 14.5 },
  ],
  'seawall.riprap': [
    { description: 'Class 40 armour stone (2 t nominal)', unit: 't', quantity: 3_400, rate: 8.2, currency: 'USD', actualQty: 780, actualRate: 8.4 },
    { description: 'Barge charter (12 h tide window)', unit: 'trip', quantity: 6, rate: 2_400, currency: 'USD', actualQty: 2, actualRate: 2_400 },
    { description: 'GPS positioning & survey crew', unit: 'day', quantity: 8, rate: 310, currency: 'USD' },
  ],
  'slab.formwork': [
    { description: 'Steel table form hire', unit: 'm²', quantity: 640, rate: 9.4, currency: 'USD', actualQty: 640, actualRate: 9.35 },
    { description: 'Shoring props (Acrow 60)', unit: 'no', quantity: 420, rate: 11.8, currency: 'USD', actualQty: 412, actualRate: 11.8 },
    { description: 'Formwork carpenter crew', unit: 'day', quantity: 34, rate: 96, currency: 'USD', actualQty: 34, actualRate: 95 },
  ],
  'slab.rebar': [
    { description: 'TMT 12 mm — 640 m² slab', unit: 't', quantity: 42, rate: 92, currency: 'USD', actualQty: 16, actualRate: 94 },
    { description: 'TMT 16 mm — main beams', unit: 't', quantity: 58, rate: 89, currency: 'USD', actualQty: 21, actualRate: 91 },
    { description: 'TMT 25 mm — columns', unit: 't', quantity: 42, rate: 86, currency: 'USD' },
    { description: 'Cut & bend labour', unit: 't', quantity: 142, rate: 21.5, currency: 'USD', actualQty: 37, actualRate: 21.5 },
    { description: 'Binding wire & chairs', unit: 'lot', quantity: 1, rate: 640, currency: 'USD', actualQty: 1, actualRate: 640 },
  ],
  'slab.nails': [
    { description: '5 kg wire nails (centring)', unit: 'carton', quantity: 14, rate: 44, currency: 'USD', actualQty: 0, actualRate: 44 },
  ],
  'slab.nhq': [
    { description: 'Engineering council submission fee', unit: 'lot', quantity: 1, rate: 450, currency: 'USD', actualQty: 1, actualRate: 450 },
    { description: 'Certified courier & stamping', unit: 'run', quantity: 6, rate: 58, currency: 'USD', actualQty: 3, actualRate: 58 },
  ],
};
