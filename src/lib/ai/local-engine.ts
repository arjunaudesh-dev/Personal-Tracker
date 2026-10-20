import type { AdvisorDirective, BriefingDirective } from '@/lib/types/nexus';

import { formatCurrency, round } from '@/lib/parser/utils';

/**
 * Deterministic local reasoning — financial and operational surfaces.
 * These run whenever the Gemini API key is absent, so every AI surface in the
 * system remains fully functional offline.
 */

export interface FinancialContext {
  monthlyIncome: number;
  monthlyExpense: number;
  breakdown: Array<{ bucket: string; actual: number; planned: number }>;
  burnRate: number;
  committedSpend: number;
}

export function localFinancialAdvice(ctx: FinancialContext): AdvisorDirective[] {
  const out: AdvisorDirective[] = [];
  const net = ctx.monthlyIncome - ctx.monthlyExpense;
  const savingsRate = ctx.monthlyIncome > 0 ? (net / ctx.monthlyIncome) * 100 : 0;

  for (const b of ctx.breakdown) {
    const gap = b.actual - b.planned;
    if (gap > 0 && b.planned > 0) {
      const over = (gap / b.planned) * 100;
      out.push({
        title: `${b.bucket.charAt(0).toUpperCase() + b.bucket.slice(1)} bucket overspent`,
        detail: `Actual spend is ${formatCurrency(gap)} (${round(over, 1)}%) above the ${formatCurrency(b.planned)} allocation. Trim discretionary ${b.bucket} line items or move the excess into savings.`,
        impact: round(gap, 2),
        severity: over > 25 ? 'high' : 'medium',
      });
    }
  }

  if (savingsRate < 20) {
    out.push({
      title: 'Savings rate below the 20 % floor',
      detail: `Net position is ${formatCurrency(net)} — a ${round(savingsRate, 1)} % savings rate. Redirect the ${formatCurrency(ctx.monthlyIncome * 0.2 - net)} shortfall into the civil capital sinking fund.`,
      impact: round(ctx.monthlyIncome * 0.2 - net, 2),
      severity: savingsRate < 10 ? 'high' : 'medium',
    });
  } else {
    out.push({
      title: 'Savings discipline holding',
      detail: `Savings rate is ${round(savingsRate, 1)} % — above the 20 % target. Consider routing the surplus ${formatCurrency(Math.max(0, net - ctx.monthlyIncome * 0.2))} into the harbour mooring sinking fund.`,
      impact: round(Math.max(0, net - ctx.monthlyIncome * 0.2), 2),
      severity: 'low',
    });
  }

  if (ctx.burnRate > ctx.monthlyIncome / 30) {
    out.push({
      title: 'Daily burn rate exceeds daily income',
      detail: `Burn rate is ${formatCurrency(ctx.burnRate)}/day against ${formatCurrency(ctx.monthlyIncome / 30)}/day of income. Freeze discretionary procurement until the variance closes.`,
      impact: round(ctx.burnRate - ctx.monthlyIncome / 30, 2),
      severity: 'high',
    });
  }

  if (ctx.committedSpend > ctx.monthlyExpense * 0.45) {
    out.push({
      title: 'Committed capital concentration',
      detail: `${formatCurrency(ctx.committedSpend)} of capital is already committed against ${formatCurrency(ctx.monthlyExpense)} of monthly outflow. Negotiate the grout and armour-stone delivery terms before new commitments are raised.`,
      impact: round(ctx.committedSpend, 2),
      severity: 'medium',
    });
  }

  return out.slice(0, 5);
}

export interface WarRoomContext {
  urgent: Array<{ id: string; title: string; status: string; dueDate: string | null; group: string }>;
  sleepScore: number;
  burnRate: number;
  committedSpend: number;
  bottlenecks: number;
}

export function localWarRoom(ctx: WarRoomContext): BriefingDirective[] {
  const out: BriefingDirective[] = [];
  const critical = ctx.urgent.filter((t) => t.status === 'blocked');
  const dueSoon = ctx.urgent.filter((t) => t.status !== 'done' && t.dueDate !== null).slice(0, 3);

  out.push({
    id: 'wr_critical',
    title:
      critical.length > 0
        ? `Unblock ${critical.length} critical path task${critical.length > 1 ? 's' : ''}`
        : 'Protect the critical path for the slab pour',
    detail:
      critical.length > 0
        ? `${critical.map((t) => t.title).join(', ')} ${critical.length > 1 ? 'are' : 'is'} blocked. Clear the blocking dependency first — every downstream milestone inherits the delay.`
        : 'TMT procurement and NHQ concurrence are the two tasks that gate the first-floor slab pour. Confirm mill certificates and countersignature before day-end.',
    severity: 'critical',
    source: 'Mind-Map critical path',
  });

  out.push({
    id: 'wr_finance',
    title: 'Committed spend is outrunning the sinking fund',
    detail: `Committed capital of ${formatCurrency(ctx.committedSpend)} is drawing on the 20 % savings allocation. Release a sinking-fund tranche against the mooring package or resequence the armour-stone barge charter.`,
    severity: 'warning',
    source: 'Financial Command Center',
  });

  out.push({
    id: 'wr_recovery',
    title:
      ctx.sleepScore >= 80
        ? 'Recovery window is healthy — schedule the tidal simulation'
        : `Sleep score ${ctx.sleepScore}/100 is limiting judgement-heavy work`,
    detail:
      ctx.sleepScore >= 80
        ? `Sleep score ${ctx.sleepScore}/100 supports sustained analytical work. Schedule the 72-hour tidal window simulation inside the morning block and gate night work.`
        : `Sleep score ${ctx.sleepScore}/100 reduces simulation accuracy and site safety margin. Defer load-case sign-off until recovery is above 80.`,
    severity: ctx.sleepScore >= 80 ? 'info' : 'warning',
    source: 'Wearable telemetry',
  });

  if (dueSoon.length) {
    out.push({
      id: 'wr_due',
      title: `${dueSoon.length} deliverable${dueSoon.length > 1 ? 's' : ''} inside the current window`,
      detail: dueSoon.map((t) => `${t.title} (${t.dueDate})`).join(' · '),
      severity: 'info',
      source: 'Timeline & alarms',
    });
  }

  return out.slice(0, 4);
}
