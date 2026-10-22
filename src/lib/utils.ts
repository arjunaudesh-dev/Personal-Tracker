import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const LKR_PER_USD = 308;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

export function formatMoney(usd: number, currency: 'USD' | 'LKR' = 'USD'): string {
  const value = currency === 'LKR' ? usd * LKR_PER_USD : usd;
  return new Intl.NumberFormat(currency === 'LKR' ? 'en-LK' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'LKR' ? 0 : 2,
  }).format(value);
}

export function todayISO(): string {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
