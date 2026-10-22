'use client';

import { useNexus } from './store';
import { LKR_PER_USD, formatMoney } from './utils';

/** Converts USD amounts to the active display currency. */
export function useCurrencyLabel() {
  const { state } = useNexus();
  const currency = state.currency;
  return {
    currency,
    convert: (usd: number) => (currency === 'LKR' ? usd * LKR_PER_USD : usd),
    label: (usd: number) => formatMoney(usd, currency),
  };
}
