import type { GraphLayers, SystemType } from '../types';

/** how each preset stacks the three drawing systems */
export const layerPreset = (system: SystemType): GraphLayers => ({
  hierarchy: true,
  network: system === 'network' || system === 'hybrid',
  concept: system === 'concept' || system === 'hybrid',
});

export const LAYER_KEYS = ['hierarchy', 'network', 'concept'] as const;
export type LayerKey = (typeof LAYER_KEYS)[number];
