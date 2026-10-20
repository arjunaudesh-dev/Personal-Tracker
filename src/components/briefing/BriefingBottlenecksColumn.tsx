import React, { useState } from 'react';
import { Sparkles, CheckSquare, Square, MessageSquare, Send, ArrowRight } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/utils';

interface BottleneckItem {
  id: string;
  title: string;
  domain: string;
  priority: 'urgent' | 'high';
  completed: boolean;
}

const initialBottlenecks: BottleneckItem[] = [
  { id: 'b1', title: 'Admin Building 1st Floor Slab: Tor Steel Rebar Tying (T12/T16)', domain: 'Civil Works', priority: 'urgent', completed: false },
  { id: 'b2', title: 'NHQ Concurrence Letter Clearance for Ready-Mix Concrete Grade C35', domain: 'Approvals', priority: 'urgent', completed: false },
  { id: 'b3', title: 'Harbor Floating Dock Mooring: 42mm Anchor Chain Tension Rigging', domain: 'Naval Port', priority: 'high', completed: false },
  { id: 'b4', title: 'Clinical Action: Vitamin D3 (25-OH) 5,000 IU daily dosing', domain: 'Health Lab', priority: 'urgent', completed: true },
];

export function BriefingBottlenecksColumn() {
  const [bottlenecks, setBottlenecks] = useState<BottleneckItem[]>(initialBottlenecks);

  const toggleBottleneck = (id: string) => {
    setBottlenecks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, completed: !b.completed } : b))
    );
  };

  const dispatchContacts = [
    { name: 'Cmdr. Silva', role: 'NHQ Works', phone: '+94771234567', msg: 'Commander Silva, submitting Formwork inspection checklist for Slab C35.' },
    { name: 'Eng. Perera', role: 'Batching Plant', phone: '+94779876543', msg: 'Eng Perera, please verify Grade C35 mix design batch schedule for tomorrow 07:30.' },
    { name: 'Foreman Dias', role: 'Site Rebar', phone: '+94715551234', msg: 'Dias, ensure cover block 25mm spacing across bottom rebar mesh is completed today.' },
  ];

  return (
    <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg space-y-4 flex flex-col h-full">
      {/* AI War-Room Directives */}
      <div className="bg-gradient-to-br from-sky-950/40 to-slate-900/90 p-3.5 rounded-xl border border-sky-500/20 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
          <Sparkles className="w-4 h-4" /> AI War-Room Strategy Directives
        </div>
        <div className="space-y-1.5 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold font-mono">1.</span>
            <span>Sleep recovery optimal (88/100). Push structural steel sign-off at Admin slab prior to midday.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400 font-bold font-mono">2.</span>
            <span>Daily burn rate ($115/day) within tolerance. $1,800 rebar allocation cleared for settlement.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-rose-400 font-bold font-mono">3.</span>
            <span>Critical path: Clear NHQ concurrence before scheduled Ready-Mix batching tomorrow morning.</span>
          </div>
        </div>
      </div>

      {/* Live Bottleneck Checklist */}
      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Critical Path Bottlenecks ({bottlenecks.filter((b) => b.completed).length}/{bottlenecks.length})
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Auto-rollup to Mind-Map</span>
        </div>

        <div className="space-y-2">
          {bottlenecks.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleBottleneck(item.id)}
              className="w-full text-left p-2.5 rounded-lg bg-slate-950/50 border border-white/5 flex items-start gap-2.5 hover:border-sky-500/30 transition-all text-xs"
            >
              {item.completed ? (
                <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <span className={item.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                  {item.title}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    {item.domain}
                  </span>
                  <span className="text-[9px] text-rose-400 font-bold uppercase">
                    {item.priority}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* WhatsApp Quick Dispatch Row */}
      <div className="pt-2 border-t border-white/5 space-y-2">
        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
          <MessageSquare className="w-3.5 h-3.5" /> 1-Click WhatsApp Site Dispatch
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {dispatchContacts.map((c) => {
            const link = generateWhatsAppLink(c.phone, c.msg);
            return (
              <a
                key={c.name}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-emerald-950/20 hover:bg-emerald-900/30 border border-emerald-500/30 text-emerald-300 text-xs flex flex-col justify-between transition-colors"
              >
                <div className="font-bold text-white text-[11px]">{c.name}</div>
                <div className="text-[9px] text-slate-400">{c.role}</div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                  <Send className="w-2.5 h-2.5" /> Dispatch
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
