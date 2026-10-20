import React, { useState } from 'react';
import { X, ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react';

interface CmsysSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CmsysSyncModal({ isOpen, onClose }: CmsysSyncModalProps) {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState('2026-10-20 08:30 UTC');

  if (!isOpen) return null;

  const triggerSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSync(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-sky-500/30 rounded-2xl p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Military CMSYS Naval Bridge</h3>
            <p className="text-xs text-slate-400 font-mono">
              Terminal: Officer Arjuna Kahandawa (Western Command)
            </p>
          </div>
        </div>

        <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-white/5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Classification Level:</span>
            <span className="font-mono text-emerald-400 font-bold">RESTRICTED // CIVIL WORKS</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">HQ Concurrence Gateway:</span>
            <span className="font-mono text-white">NHQ-CE-BRIDGE: ONLINE</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Synchronized Trees:</span>
            <span className="font-mono text-sky-300">Harbor Dock, Sea Wall, Slab C35</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Last Telemetry Handshake:</span>
            <span className="font-mono text-slate-300">{lastSync}</span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={triggerSync}
            disabled={syncing}
            className="flex-1 bg-sky-500 hover:bg-sky-400 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-glow"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Establishing Handshake...' : 'Synchronize CMSYS Now'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
