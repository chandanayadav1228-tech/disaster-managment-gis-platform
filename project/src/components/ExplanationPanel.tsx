import type { SimResults, SimParams } from '@/sim/types';
import { labelForLevel } from '@/sim/types';
import { ZONES, SHELTERS } from '@/sim/regions';
import { RED_ZONE_THRESHOLD } from '@/sim/engine';
import { Lightbulb, TrendingDown, TrendingUp } from 'lucide-react';

function fmt(n: number): string {
  return n.toLocaleString('en-US');
}

interface ExplanationPanelProps {
  results: SimResults;
  params: SimParams;
}

export function ExplanationPanel({ results, params }: ExplanationPanelProps) {
  const topZone = results.priorityZones[0];
  const topZoneData = topZone ? ZONES.find((z) => z.id === topZone.id) : undefined;
  const fullestShelter = [...results.shelters].sort((a, b) => b.utilization - a.utilization)[0];
  const fullestShelterData = fullestShelter ? SHELTERS.find((s) => s.id === fullestShelter.id) : undefined;
  const coveragePct = results.totalEvacNeeded > 0 ? Math.round((results.totalAllocated / results.totalEvacNeeded) * 100) : 100;

  const insights: { type: 'warn' | 'good' | 'info'; text: string }[] = [];

  if (results.unallocated > 0) {
    const pct = results.totalEvacNeeded > 0 ? Math.round((results.unallocated / results.totalEvacNeeded) * 100) : 0;
    insights.push({
      type: 'warn',
      text: `${fmt(results.unallocated)} people (${pct}%) cannot be sheltered — total available capacity (${fmt(results.totalCapacity)}) is insufficient for the ${fmt(results.totalEvacNeeded)} people requiring relocation. Consider increasing shelter capacity or improving road access.`,
    });
  } else if (results.totalEvacNeeded > 0) {
    insights.push({
      type: 'good',
      text: `All ${fmt(results.totalEvacNeeded)} people requiring relocation can be sheltered. Capacity coverage is ${coveragePct}%.`,
    });
  } else {
    insights.push({
      type: 'good',
      text: `No zones require relocation under current parameters. All zones are below the evacuation risk threshold.`,
    });
  }

  if (results.redZoneCount > 0) {
    insights.push({
      type: 'warn',
      text: `${results.redZoneCount} zone${results.redZoneCount !== 1 ? 's' : ''} cross the Red Zone threshold (risk ≥ ${RED_ZONE_THRESHOLD}), putting ${fmt(results.redZonePopulation)} residents at critical risk.`,
    });
  }

  if (topZone && topZoneData) {
    insights.push({
      type: 'info',
      text: `Highest-priority zone is ${topZoneData.name} (risk ${topZone.riskScore}/100, ${labelForLevel(topZone.riskLevel)}). ${fmt(topZone.evacNeeded)} of its ${fmt(topZoneData.population)} residents need relocation.`,
    });
  }

  if (fullestShelter && fullestShelterData && fullestShelter.utilization >= 95) {
    insights.push({
      type: 'warn',
      text: `${fullestShelterData.name} is at ${fullestShelter.utilization}% capacity (${fmt(fullestShelter.allocated)}/${fmt(fullestShelter.capacity)}). Additional overflow capacity may be needed.`,
    });
  }

  if (params.accessibilityPct < 50) {
    insights.push({
      type: 'warn',
      text: `Road accessibility is critically low at ${params.accessibilityPct}%. Evacuation routes are severely degraded, increasing effective risk and reducing usable shelter capacity.`,
    });
  }

  const toneStyles = {
    warn: { border: 'border-amber-500/25', bg: 'bg-amber-500/5', text: 'text-amber-300', icon: TrendingDown },
    good: { border: 'border-emerald-500/25', bg: 'bg-emerald-500/5', text: 'text-emerald-300', icon: TrendingUp },
    info: { border: 'border-sky-500/25', bg: 'bg-sky-500/5', text: 'text-sky-300', icon: Lightbulb },
  };

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-850/60 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb size={15} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-slate-100">Optimization Explanation</h3>
      </div>
      <div className="space-y-2.5">
        {insights.map((ins, i) => {
          const style = toneStyles[ins.type];
          const Icon = style.icon;
          return (
            <div key={i} className={`flex items-start gap-2.5 rounded-lg border ${style.border} ${style.bg} px-3 py-2.5`}>
              <Icon size={14} className={`${style.text} mt-0.5 shrink-0`} />
              <p className="text-[13px] text-slate-300 leading-relaxed">{ins.text}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-ink-700 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Metric label="Coverage" value={`${coveragePct}%`} />
        <Metric label="Avg Risk" value={`${results.avgRisk}/100`} />
        <Metric label="Red Zones" value={`${results.redZoneCount}`} />
        <Metric label="Unsheltered" value={fmt(results.unallocated)} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-slate-100 tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}
