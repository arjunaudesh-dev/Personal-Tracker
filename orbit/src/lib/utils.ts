import type { Currency } from '../types';

/** Indicative conversion used by the currency toggle. All amounts are stored in USD. */
export const USD_LKR = 302.4;

export const uid = (prefix = 'id'): string =>
  `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now()
    .toString(36)
    .slice(-4)}`;

export const clamp = (n: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, n));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ');

export const convert = (usd: number, currency: Currency): number =>
  currency === 'LKR' ? usd * USD_LKR : usd;

export const fmtMoney = (
  usd: number,
  currency: Currency,
  opts: { compact?: boolean; decimals?: boolean } = {},
): string => {
  const value = convert(usd, currency);
  const { compact = false, decimals = true } = opts;
  if (compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  }).format(value);
};

export const fmtNumber = (n: number): string =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);

export const pct = (n: number): string => `${Math.round(n)}%`;

export const relativeTime = (ts: number): string => {
  const diff = Date.now() - ts;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

export const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

export const debounce = <A extends unknown[]>(fn: (...args: A) => void, ms: number) => {
  let t: ReturnType<typeof setTimeout>;
  return (...args: A) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

export const hexToRgba = (hex: string, alpha: number): string => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const int = parseInt(full, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const mix = (a: string, b: string, t: number): string => {
  const pa = a.replace('#', '');
  const pb = b.replace('#', '');
  const ra = parseInt(pa, 16);
  const rb = parseInt(pb, 16);
  const r = Math.round(lerp((ra >> 16) & 255, (rb >> 16) & 255, t));
  const g = Math.round(lerp((ra >> 8) & 255, (rb >> 8) & 255, t));
  const bl = Math.round(lerp(ra & 255, rb & 255, t));
  return `rgb(${r}, ${g}, ${bl})`;
};

export const download = (filename: string, content: string, type = 'application/json') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
