import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CurrencyCode } from "@/types/finance";

export const USD_TO_LKR_RATE = 308.0;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'USD',
  decimalPlaces = 2
): string {
  if (currency === 'LKR') {
    const lkrVal = amount * USD_TO_LKR_RATE;
    return `Rs. ${lkrVal.toLocaleString('en-LK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimalPlaces,
    })}`;
  }

  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  })}`;
}

export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): number {
  if (from === to) return amount;
  if (from === 'USD' && to === 'LKR') return amount * USD_TO_LKR_RATE;
  if (from === 'LKR' && to === 'USD') return amount / USD_TO_LKR_RATE;
  return amount;
}

/** Epley Formula: 1RM = Weight * (1 + Reps / 30) */
export function calculateOneRepMax(weightKg: number, reps: number): number {
  if (reps <= 0) return 0;
  if (reps === 1) return weightKg;
  const val = weightKg * (1 + reps / 30);
  return Math.round(val * 10) / 10;
}

/** TDEE Mifflin-St Jeor formula approximation */
export function calculateTDEE(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  isMale: boolean,
  activityMultiplier: number,
  activeBurnBonus = 0
): { bmr: number; tdee: number } {
  const genderConst = isMale ? 5 : -161;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + genderConst;
  const tdee = Math.round(bmr * activityMultiplier + activeBurnBonus);
  return { bmr: Math.round(bmr), tdee };
}

export function generateWhatsAppLink(
  phone: string,
  message: string
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}
