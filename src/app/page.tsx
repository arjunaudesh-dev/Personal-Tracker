'use client';

import React, { useState } from 'react';
import { AppHeader } from '@/components/navigation/AppHeader';
import { CommandPalette } from '@/components/navigation/CommandPalette';
import { ExecutiveBriefing } from '@/components/briefing/ExecutiveBriefing';
import { MindMapCanvas } from '@/components/mindmap/MindMapCanvas';
import { FinanceDashboard } from '@/components/finance/FinanceDashboard';
import { HealthDashboard } from '@/components/health/HealthDashboard';
import { SystemModule } from '@/types/nexus';

export default function MasterCommandShell() {
  const [activeModule, setActiveModule] = useState<SystemModule>('briefing');
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const handleSpawnHealthTask = (task: { title: string; category: string; priority: string; notes: string }) => {
    alert(`Spawned Clinical Task: "${task.title}". Switching to Mind-Map to view updated Health tree.`);
    setActiveModule('mindmap');
  };

  return (
    <main className="min-h-screen bg-[#090d16] flex flex-col selection:bg-sky-500 selection:text-white">
      <AppHeader
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        onOpenCommandPalette={() => setIsCommandOpen(true)}
      />

      <div className="flex-1 w-full">
        {activeModule === 'briefing' && (
          <ExecutiveBriefing onNavigateModule={(m) => setActiveModule(m)} />
        )}

        {activeModule === 'mindmap' && (
          <MindMapCanvas />
        )}

        {activeModule === 'finance' && (
          <FinanceDashboard />
        )}

        {activeModule === 'health' && (
          <HealthDashboard onSpawnTask={handleSpawnHealthTask} />
        )}
      </div>

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectModule={(m) => setActiveModule(m)}
      />
    </main>
  );
}
