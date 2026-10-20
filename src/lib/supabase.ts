// NEXUS LIFE-OS Supabase PostgreSQL Client Bridge
export interface SupabaseConfig {
  url?: string;
  anonKey?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project')
);

export class NexusSupabaseClient {
  private isLive: boolean;

  constructor() {
    this.isLive = isSupabaseConfigured;
  }

  async fetchTasks() {
    if (!this.isLive) return null;
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/mindmap_tasks?select=*`, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async saveTask(task: Record<string, unknown>) {
    if (!this.isLive) return false;
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/mindmap_tasks`, {
        method: 'POST',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(task),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const supabase = new NexusSupabaseClient();
