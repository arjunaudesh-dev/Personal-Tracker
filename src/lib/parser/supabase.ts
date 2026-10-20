import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { CrossGroupLink, FinancialTransaction, MindMapTaskNode } from '@/lib/types/nexus';

let client: SupabaseClient | null = null;

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Lazily create the Supabase client used by the relational mirror. */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return client;
}

/** Persist the full task graph (nodes + cross links) to PostgreSQL. */
export async function syncTasksToSupabase(
  userId: string,
  tasks: MindMapTaskNode[],
  links: CrossGroupLink[],
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' };

  const { error: nodeError } = await supabase.from('mindmap_tasks').upsert(
    tasks.map((t) => ({
      id: t.id,
      user_id: userId,
      parent_id: t.parentId,
      title: t.title,
      markdown_notes: t.markdownNotes,
      group_category: t.groupCategory,
      direction: t.direction,
      depth: t.depth,
      pos_x: t.posX,
      pos_y: t.posY,
      status: t.status,
      priority: t.priority,
      tags: t.tags,
      is_collapsed: t.isCollapsed,
      progress: t.progress,
      is_auto_calculated: t.isAutoCalculated,
      cashflow: t.cashflow,
      reminders: t.reminders,
      attachments: t.attachments,
      contacts: t.contacts,
      ai_insight: t.aiInsight,
      due_date: t.dueDate,
      updated_at: t.updatedAt,
    })),
    { onConflict: 'id' },
  );
  if (nodeError) return { ok: false, error: nodeError.message };

  if (links.length) {
    const { error: linkError } = await supabase.from('task_cross_group_links').upsert(
      links.map((l) => ({
        id: l.id,
        source_task_id: l.sourceTaskId,
        target_task_id: l.targetTaskId,
        target_group: l.targetGroup,
        relationship_type: l.relationshipType,
        description: l.description,
        created_at: l.createdAt,
      })),
      { onConflict: 'id' },
    );
    if (linkError) return { ok: false, error: linkError.message };
  }

  return { ok: true };
}

/** Append a ledger entry to PostgreSQL. */
export async function pushTransaction(
  userId: string,
  transaction: FinancialTransaction,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' };

  const { error } = await supabase.from('financial_transactions').upsert(
    {
      id: transaction.id,
      user_id: userId,
      date: transaction.date,
      amount: transaction.amount,
      currency: transaction.currency,
      title: transaction.title,
      category: transaction.category,
      bucket: transaction.bucket,
      type: transaction.type,
      linked_task_id: transaction.linkedTaskId,
      status: transaction.status,
    },
    { onConflict: 'id' },
  );

  return error ? { ok: false, error: error.message } : { ok: true };
}
