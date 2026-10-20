import React from 'react';
import { FileText, Calculator, Phone, Calendar } from 'lucide-react';
import { MindMapTaskNode } from '@/types/mindmap';
import { formatCurrency } from '@/lib/utils';

interface NodeFooterBadgesProps {
  task: MindMapTaskNode;
}

export function NodeFooterBadges({ task }: NodeFooterBadgesProps) {
  const hasBoq = Boolean(task.cashflow?.items && task.cashflow.items.length > 0);
  const totalCost = task.cashflow?.actualSpend || task.cashflow?.estimatedCost || 0;
  const hasDocs = Boolean(task.attachments && task.attachments.length > 0);
  const hasContacts = Boolean(task.contacts && task.contacts.length > 0);

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-white/5 text-[10px]">
      {hasBoq && (
        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono border border-amber-500/20">
          <Calculator className="w-2.5 h-2.5" />
          {formatCurrency(totalCost, task.cashflow?.currency || 'USD', 0)}
        </span>
      )}

      {hasDocs && (
        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
          <FileText className="w-2.5 h-2.5" />
          {task.attachments?.length} Docs
        </span>
      )}

      {hasContacts && (
        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
          <Phone className="w-2.5 h-2.5" />
          {task.contacts?.[0]?.name}
        </span>
      )}

      {task.dueDate && (
        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 ml-auto border border-white/5">
          <Calendar className="w-2.5 h-2.5" />
          {task.dueDate.slice(5)}
        </span>
      )}
    </div>
  );
}
