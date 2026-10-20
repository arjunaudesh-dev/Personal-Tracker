'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { ModuleId } from '@/lib/types/nexus';
import { AppHeader } from '@/components/navigation/AppHeader';
import { ExecutiveBriefing } from '@/components/briefing/ExecutiveBriefing';
import { FinanceDashboard } from '@/components/finance/FinanceDashboard';
import { HealthDashboard } from '@/components/health/HealthDashboard';
import { MedicalReportAnalyzer } from '@/components/health/MedicalReportAnalyzer';
import { MindMapWorkspace } from '@/components/mindmap/MindMapWorkspace';
import { NexusProvider, useNexus } from '@/store/nexus-store';

const MODULE_IDS: ModuleId[] = ['briefing', 'mindmap', 'finance', 'health', 'lab'];

function ModuleView({ module }: { module: ModuleId }) {
  switch (module) {
    case 'mindmap':
      return <MindMapWorkspace />;
    case 'finance':
      return <FinanceDashboard />;
    case 'health':
      return <HealthDashboard />;
    case 'lab':
      return <MedicalReportAnalyzer />;
    default:
      return <ExecutiveBriefing />;
  }
}

function CommandShell() {
  const { state, ready, dispatch } = useNexus();
  const [hydratedModule, setHydratedModule] = useState<ModuleId | null>(null);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as ModuleId;
    if (MODULE_IDS.includes(hash)) {
      dispatch({ type: 'set-module', module: hash });
    }
    setHydratedModule(state.activeModule);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const onHash = () => {
      const hash = window.location.hash.replace('#', '') as ModuleId;
      if (MODULE_IDS.includes(hash)) dispatch({ type: 'set-module', module: hash });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [ready, dispatch]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-nexus-cyan" />
          <p className="label-caps">Initialising command shell</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-[1800px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.activeModule}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <ModuleView module={state.activeModule} />
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="border-t border-white/[0.06] px-6 py-4 text-center">
        <p className="text-[10px] text-slate-600">
          NEXUS LIFE-OS · Personal &amp; Civil Engineering Command Center · build 1.0.0 ·
          {hydratedModule ? ' module ' + hydratedModule : ''}
        </p>
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <NexusProvider>
      <CommandShell />
    </NexusProvider>
  );
}
