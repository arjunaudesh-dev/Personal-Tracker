'use client';

import { CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

import { Modal } from '@/components/ui/Modal';
import { useNexus } from '@/store/nexus-store';

const CMSYS_FIELDS = [
  { field: 'Work order reference', local: 'task.id', remote: 'CMSYS WO number', state: 'mapped' },
  { field: 'Deliverable title', local: 'task.title', remote: 'CMSYS task name', state: 'mapped' },
  { field: 'Execution status', local: 'task.status', remote: 'CMSYS progress', state: 'mapped' },
  { field: 'Cost to date', local: 'cashflow.actualSpend', remote: 'CMSYS expenditure', state: 'mapped' },
  { field: 'Team allocation', local: 'task.contacts', remote: 'CMSYS labour', state: 'partial' },
  { field: 'Geofence / work site', local: 'task.tags', remote: 'CMSYS location', state: 'pending' },
];

/** Military CMSYS civil works synchronisation modal. */
export function CmsysSyncModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useNexus();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState('never');

  const workOrders = state.tasks.filter((t) => t.groupCategory === 'Work').slice(0, 6);

  const runSync = () => {
    setSyncing(true);
    window.setTimeout(() => {
      setSyncing(false);
      setLastSync(new Date().toLocaleTimeString());
    }, 1100);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="CMSYS civil works synchronisation"
      subtitle="Two-way bridge between the NEXUS task graph and the unit works register"
      accent="emerald"
      width="max-w-2xl"
      footer={
        <>
          <button onClick={onClose} className="btn btn-ghost">
            Close
          </button>
          <button onClick={runSync} disabled={syncing} className="btn btn-primary">
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Synchronising…' : 'Run synchronisation'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-xl border border-nexus-emerald/25 bg-nexus-emerald/[0.08] px-3 py-2.5">
          <ShieldCheck className="h-4 w-4 shrink-0 text-nexus-emerald" />
          <p className="text-[10.5px] leading-relaxed text-slate-300">
            Bridge status: <span className="font-mono text-nexus-emerald">AUTHENTICATED</span> · last
            successful sync <span className="font-mono">{lastSync}</span>
          </p>
        </div>

        <section>
          <p className="label-caps mb-2">Field mapping</p>
          <div className="overflow-hidden rounded-xl border border-white/[0.07]">
            <table className="w-full text-left text-[10.5px]">
              <thead className="bg-white/[0.04] text-[9px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-semibold">Field</th>
                  <th className="px-2 py-2 font-semibold">NEXUS</th>
                  <th className="px-2 py-2 font-semibold">CMSYS</th>
                  <th className="px-2 py-2 font-semibold">State</th>
                </tr>
              </thead>
              <tbody>
                {CMSYS_FIELDS.map((row) => (
                  <tr key={row.field} className="border-t border-white/[0.05]">
                    <td className="px-3 py-1.5 text-slate-300">{row.field}</td>
                    <td className="px-2 py-1.5 font-mono text-[9.5px] text-nexus-cyan">{row.local}</td>
                    <td className="px-2 py-1.5 font-mono text-[9.5px] text-nexus-violet">{row.remote}</td>
                    <td className="px-2 py-1.5">
                      <span
                        className={`chip ${
                          row.state === 'mapped'
                            ? 'border-nexus-emerald/30 bg-nexus-emerald/10 text-nexus-emerald'
                            : row.state === 'partial'
                              ? 'border-nexus-amber/30 bg-nexus-amber/10 text-nexus-amber'
                              : 'border-white/12 text-slate-500'
                        }`}
                      >
                        {row.state}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <p className="label-caps mb-2">Queued work orders ({workOrders.length})</p>
          <ul className="space-y-1">
            {workOrders.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2"
              >
                <CheckCircle2
                  className={`h-3.5 w-3.5 shrink-0 ${
                    task.status === 'done' ? 'text-nexus-emerald' : 'text-slate-600'
                  }`}
                />
                <span className="min-w-0 flex-1 truncate text-[11px] text-slate-300">{task.title}</span>
                <span className="font-mono text-[9px] text-slate-600">WO-{task.id.toUpperCase()}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Modal>
  );
}
