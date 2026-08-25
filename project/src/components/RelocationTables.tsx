import type { SimResults } from '@/sim/types';
import { colorForLevel, labelForLevel } from '@/sim/types';
import { ZONES, SHELTERS } from '@/sim/regions';
import { AlertTriangle, Building2, ArrowRight, Users, Gauge } from 'lucide-react';

function fmt(n: number): string {
  return n.toLocaleString('en-US');
}

export function RelocationTables({ results }: { results: SimResults }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Priority list */}
      <div className="rounded-xl border border-ink-700 bg-ink-900/50 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-ink-700 bg-ink-850/50 flex items-center gap-2">
          <AlertTriangle size={14} className="text-orange-400" />
          <h4 className="text-xs uppercase tracking-wide text-slate-300 font-semibold">Relocation Priority</h4>
        </div>
        {results.priorityZones.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-500">No zones require relocation under current parameters.</div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-ink-800">
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Zone</th>
                  <th className="px-3 py-2 font-medium">Risk</th>
                  <th className="px-3 py-2 font-medium text-right">Evac</th>
                  <th className="px-3 py-2 font-medium text-right">Pop</th>
                </tr>
              </thead>
              <tbody>
                {results.priorityZones.map((z, i) => {
                  const zone = ZONES.find((x) => x.id === z.id);
                  return (
                    <tr key={z.id} className="border-b border-ink-800/60 last:border-0 hover:bg-ink-800/30 transition-colors">
                      <td className="px-3 py-2.5">
                        <span className={`font-mono text-xs font-semibold ${z.redZone ? 'text-red-400' : 'text-slate-400'}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: colorForLevel(z.riskLevel) }} />
                          <span className="text-slate-200 text-[13px]">{zone?.name ?? z.name}</span>
                          {z.redZone && <span className="text-[9px] px-1 py-0.5 rounded bg-red-500/15 text-red-400 font-medium">RED</span>}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="font-mono text-slate-300 tabular-nums">{z.riskScore}</span>
                        <span className="text-[10px] text-slate-500 ml-1">{labelForLevel(z.riskLevel)}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums text-slate-100 font-medium">{fmt(z.evacNeeded)}</td>
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums text-slate-500">{fmt(zone?.population ?? 0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Shelter allocation */}
      <div className="rounded-xl border border-ink-700 bg-ink-900/50 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-ink-700 bg-ink-850/50 flex items-center gap-2">
          <Building2 size={14} className="text-sky-400" />
          <h4 className="text-xs uppercase tracking-wide text-slate-300 font-semibold">Shelter Allocation</h4>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-ink-800">
                <th className="px-3 py-2 font-medium">Shelter</th>
                <th className="px-3 py-2 font-medium">Utilization</th>
                <th className="px-3 py-2 font-medium text-right">Allocated</th>
                <th className="px-3 py-2 font-medium text-right">Cap</th>
              </tr>
            </thead>
            <tbody>
              {results.shelters.map((s) => {
                const shelter = SHELTERS.find((x) => x.id === s.id);
                const full = s.utilization >= 95;
                const over = s.allocated > s.capacity;
                return (
                  <tr key={s.id} className="border-b border-ink-800/60 last:border-0 hover:bg-ink-800/30 transition-colors">
                    <td className="px-3 py-2.5">
                      <div className="text-slate-200 text-[13px]">{shelter?.name ?? s.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {s.incomingFrom.length} zone{s.incomingFrom.length !== 1 ? 's' : ''} incoming
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-ink-700 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(s.utilization, 100)}%`,
                              background: full ? '#ef4444' : s.utilization > 70 ? '#f97316' : '#10b981',
                            }}
                          />
                        </div>
                        <span className={`font-mono text-xs tabular-nums ${full ? 'text-red-400' : s.utilization > 70 ? 'text-orange-400' : 'text-emerald-400'}`}>
                          {s.utilization}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-slate-100 font-medium">{fmt(s.allocated)}</td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-slate-500">
                      {fmt(s.capacity)}
                      {over && <span className="text-[10px] text-red-400 ml-1">OVER</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incoming flows detail */}
      <div className="lg:col-span-2 rounded-xl border border-ink-700 bg-ink-900/50 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-ink-700 bg-ink-850/50 flex items-center gap-2">
          <Users size={14} className="text-ink-500" />
          <h4 className="text-xs uppercase tracking-wide text-slate-300 font-semibold">Allocation Detail</h4>
        </div>
        {results.shelters.every((s) => s.incomingFrom.length === 0) ? (
          <div className="px-4 py-8 text-center text-sm text-slate-500">No allocations under current parameters.</div>
        ) : (
          <div className="divide-y divide-ink-800">
            {results.shelters.map((s) => {
              const shelter = SHELTERS.find((x) => x.id === s.id);
              if (s.incomingFrom.length === 0) return null;
              return (
                <div key={s.id} className="px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="text-sm text-slate-200 font-medium min-w-[140px]">{shelter?.name ?? s.name}</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {s.incomingFrom.map((inc) => {
                      const zone = ZONES.find((z) => z.id === inc.zoneId);
                      return (
                        <span key={inc.zoneId} className="inline-flex items-center gap-1 text-[11px] bg-ink-800/60 border border-ink-700 rounded-lg px-2 py-1">
                          <span className="text-slate-500">{zone?.name ?? inc.zoneId}</span>
                          <ArrowRight size={11} className="text-ink-600" />
                          <span className="font-mono text-slate-200 tabular-nums">{fmt(inc.people)}</span>
                        </span>
                      );
                    })}
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-slate-400">
                    <Gauge size={12} />
                    <span className="font-mono">{fmt(s.allocated)} / {fmt(s.capacity)}</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
