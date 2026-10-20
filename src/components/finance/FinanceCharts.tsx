import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { CurrencyCode, CashflowWaterfallPoint } from '@/types/finance';
import { formatCurrency } from '@/lib/utils';

interface FinanceChartsProps {
  waterfallData: CashflowWaterfallPoint[];
  donutData: Array<{ name: string; value: number; color: string; target: number }>;
  categoryData: Array<{ category: string; planned: number; actual: number }>;
  currency: CurrencyCode;
}

export function FinanceCharts({
  waterfallData,
  donutData,
  categoryData,
  currency,
}: FinanceChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 50/30/20 Donut */}
      <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            50 / 30 / 20 Framework Adherence
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Target Rings</span>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: number) => formatCurrency(val, currency)}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/5 text-[11px] text-center">
          {donutData.map((d) => (
            <div key={d.name} className="flex flex-col">
              <span className="text-slate-400">{d.name}</span>
              <span className="font-bold font-mono" style={{ color: d.color }}>
                {d.value}%
              </span>
              <span className="text-[9px] text-slate-500">Target: {d.target}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cashflow Waterfall Trajectory */}
      <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Cashflow Waterfall Trajectory
          </h3>
          <span className="text-[10px] font-mono text-emerald-400">Running Liquidity</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={waterfallData}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="period" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip
                formatter={(val: number) => formatCurrency(val, currency)}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="runningBalance" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Planned vs Actual */}
      <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Planned vs Actual Variance
          </h3>
          <span className="text-[10px] font-mono text-amber-400">Engineering vs Living</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <XAxis dataKey="category" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip
                formatter={(val: number) => formatCurrency(val, currency)}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="planned" fill="#475569" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
