import type { SimResults } from '@/sim/types';
import { colorForLevel, labelForLevel } from '@/sim/types';
import { TrendingUp, TrendingDown, Minus, AlertOctagon, Users, Home, BedDouble, ShieldAlert, Activity } from 'lucide-react';
import { ZONES } from '@/sim/regions';

interface ComparisonViewProps {
  before: SimResults;
  after: SimResults;
}

interface StatDef {
  label: string;
  icon: typeof Users;
  before: number;
  after: number;
  unit?: string;
  invertGood?: boolean; // true = lower is better
  format?: (n: number) => string;
}

function fmt(n: number): string {
  return n.toLocaleString('en-US');
}

function Delta({ before, after, invertGood }: { before: number; after: number; invertGood?: boolean }) {
  if (after === before) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-500">
        <Minus size={11} /> no change
      </span>
    );
  }
  const up = after > before;
  const good = invertGood ? !up : up;
  const pct = before === 0 ? 100 : Math.round(((after - before) / before) * 100);
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${good ? 'text-emerald-400' : 'text-red-400'}`}>
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {up ? '+' : ''}
      {pct}% ({fmt(after - before)})
    </span>
  );
}

export function ComparisonView({ before, after }: ComparisonViewProps) {
  const stats: StatDef[] = [
    { label: 'Avg Risk Score', icon: Activity, before: before.avgRisk, after: after.avgRisk, invertGood: true, format: (n) => `${n}/100` },
    { label: 'Red Zones', icon: AlertOctagon, before: before.redZoneCount, after: after.redZoneCount, invertGood: true },
    { label: 'Red Zone Pop.', icon: ShieldAlert, before: before.redZonePopulation, after: after.redZonePopulation, invertGood: true, format: fmt },
    { label: 'People to Relocate', icon: Users, before: before.totalEvacNeeded, after: after.totalEvacNeeded, invertGood: true, format: fmt },
    { label: 'Shelter Capacity', icon: BedDouble, before: before.totalCapacity, after: after.totalCapacity, format: fmt },
    { label: 'Allocated', icon: Home, before: before.totalAllocated, after: after.totalAllocated, format: fmt },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-ink-700 bg-ink-900/60 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={15} className="text-ink-500" />
                <span className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">{s.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-100 tabular-nums">
                  {s.format ? s.format(s.after) : s.after}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                <span className="text-slate-500">was {s.format ? s.format(s.before) : s.before}</span>
                <Delta before={s.before} after={s.after} invertGood={s.invertGood} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Zone-by-zone before/after */}
      <div className="mt-5 rounded-xl border border-ink-700 bg-ink-900/40 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-ink-700 bg-ink-850/50">
          <h4 className="text-xs uppercase tracking-wide text-slate-400 font-semibold">Zone Risk Comparison</h4>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-ink-700">
                <th className="px-4 py-2 font-medium">Zone</th>
                <th className="px-3 py-2 font-medium">Before</th>
                <th className="px-3 py-2 font-medium">After</th>
                <th className="px-3 py-2 font-medium">Change</th>
                <th className="px-4 py-2 font-medium text-right">Evac Needed</th>
              </tr>
            </thead>
            <tbody>
              {after.zones.map((z) => {
                const zb = before.zones.find((x) => x.id === z.id);
                const zone = ZONES.find((x) => x.id === z.id);
                const beforeScore = zb?.riskScore ?? 0;
                const delta = z.riskScore - beforeScore;
                const becameRed = z.redZone && !zb?.redZone;
                const leftRed = !z.redZone && zb?.redZone;
                return (
                  <tr key={z.id} className="border-b border-ink-800 last:border-0 hover:bg-ink-800/30 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-slate-500">{z.id}</span>
                        <span className="text-slate-200">{zone?.name ?? z.name}</span>
                        {becameRed && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-medium">NEW RED</span>}
                        {leftRed && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-medium">CLEARED</span>}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: colorForLevel(zb?.riskLevel ?? 'safe') }} />
                        <span className="font-mono text-slate-300 tabular-nums">{beforeScore}</span>
                        <span className="text-[10px] text-slate-500">{labelForLevel(zb?.riskLevel ?? 'safe')}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: colorForLevel(z.riskLevel) }} />
                        <span className="font-mono text-slate-100 tabular-nums font-semibold">{z.riskScore}</span>
                        <span className="text-[10px] text-slate-400">{labelForLevel(z.riskLevel)}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      {delta === 0 ? (
                        <span className="text-slate-500 text-xs">—</span>
                      ) : (
                        <span className={`font-mono text-xs font-medium ${delta > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {delta > 0 ? '+' : ''}
                          {delta}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-200">
                      {z.evacNeeded.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
