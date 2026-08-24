import { useState, useMemo, useCallback } from 'react';
import { CloudLightning, AlertTriangle, Info, Map as MapIcon, BarChart3, Layers, GitCompare, Lightbulb } from 'lucide-react';
import type { SimParams } from '@/sim/types';
import { DEFAULT_PARAMS } from '@/sim/regions';
import { runSimulation, RED_ZONE_THRESHOLD } from '@/sim/engine';
import { ZoneMap } from '@/components/ZoneMap';
import { ParamControls } from '@/components/ParamControls';
import { ComparisonView } from '@/components/ComparisonView';
import { RelocationTables } from '@/components/RelocationTables';
import { ExplanationPanel } from '@/components/ExplanationPanel';
import { ReportExport } from '@/components/ReportExport';

type Tab = 'overview' | 'comparison' | 'allocation' | 'report';

export default function App() {
  const [params, setParams] = useState<SimParams>(DEFAULT_PARAMS);
  const [baseline, setBaseline] = useState<SimParams>(DEFAULT_PARAMS);
  const [tab, setTab] = useState<Tab>('overview');
  const [showBeforeOnMap, setShowBeforeOnMap] = useState(true);

  const beforeResults = useMemo(() => runSimulation(baseline), [baseline]);
  const afterResults = useMemo(() => runSimulation(params), [params]);

  const hasChanges = useMemo(
    () =>
      params.rainfall !== baseline.rainfall ||
      params.hazardSeverity !== baseline.hazardSeverity ||
      params.availableCapacityPct !== baseline.availableCapacityPct ||
      params.accessibilityPct !== baseline.accessibilityPct,
    [params, baseline],
  );

  const handleReset = useCallback(() => setParams(DEFAULT_PARAMS), []);
  const handleSetBaseline = useCallback(() => setBaseline(params), [params]);

  const tabs: { id: Tab; label: string; icon: typeof MapIcon }[] = [
    { id: 'overview', label: 'Overview', icon: MapIcon },
    { id: 'comparison', label: 'Before vs After', icon: GitCompare },
    { id: 'allocation', label: 'Allocation', icon: Layers },
    { id: 'report', label: 'Report', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-ink-950 text-slate-200">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-ink-800 bg-ink-950/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-ink-600 flex items-center justify-center shadow-glow">
              <CloudLightning size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-100 leading-tight">Disaster GIS — Scenario Simulation</h1>
              <p className="text-[11px] text-slate-500 leading-tight">Hypothetical modeling · not real-time prediction</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 bg-ink-900/60 border border-ink-700 rounded-xl p-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    tab === t.id ? 'bg-ink-600 text-slate-100' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon size={13} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Disclaimer banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-2">
          <Info size={14} className="text-amber-400 shrink-0" />
          <p className="text-[12px] text-amber-200/90">
            <span className="font-semibold">Simulation only.</span> This tool models hypothetical disaster scenarios for planning purposes. It is
            <span className="font-semibold"> not</span> a real-time disaster prediction system and must not be used for live emergency response decisions.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: parameter controls */}
          <aside className="lg:col-span-3 space-y-4">
            <ParamControls params={params} onChange={setParams} onReset={handleReset} />

            <div className="rounded-2xl border border-ink-700 bg-ink-850/80 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold tracking-wide text-slate-300 uppercase">Baseline</h3>
                {hasChanges && (
                  <button
                    onClick={handleSetBaseline}
                    className="text-[11px] text-sky-400 hover:text-sky-300 font-medium"
                  >
                    Set current as baseline
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                The baseline represents the &ldquo;before&rdquo; state. Adjust parameters above to model an &ldquo;after&rdquo; scenario and compare.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                <BaselineChip label="Rain" value={baseline.rainfall} />
                <BaselineChip label="Hazard" value={baseline.hazardSeverity} />
                <BaselineChip label="Capacity" value={baseline.availableCapacityPct} />
                <BaselineChip label="Access" value={baseline.accessibilityPct} />
              </div>
            </div>
          </aside>

          {/* Right: results */}
          <section className="lg:col-span-9 space-y-5">
            {/* Mobile tabs */}
            <div className="sm:hidden flex items-center gap-1 bg-ink-900/60 border border-ink-700 rounded-xl p-1">
              {tabs.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      tab === t.id ? 'bg-ink-600 text-slate-100' : 'text-slate-400'
                    }`}
                  >
                    <Icon size={13} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {tab === 'overview' && (
              <div className="space-y-5 animate-fade-in-up">
                {/* Map */}
                <div className="rounded-2xl border border-ink-700 bg-ink-850/60 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapIcon size={15} className="text-ink-500" />
                      <h2 className="text-sm font-semibold text-slate-100">Region Map — Current Scenario</h2>
                    </div>
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showBeforeOnMap}
                        onChange={(e) => setShowBeforeOnMap(e.target.checked)}
                        className="accent-ink-500 w-3.5 h-3.5"
                      />
                      Show baseline ghost
                    </label>
                  </div>
                  <ZoneMap results={afterResults} beforeResults={beforeResults} showBefore={showBeforeOnMap} />
                </div>

                {/* Summary stat row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <SummaryCard label="Avg Risk" value={`${afterResults.avgRisk}`} sub="/100" tone={afterResults.avgRisk > 55 ? 'danger' : afterResults.avgRisk > 35 ? 'warn' : 'ok'} />
                  <SummaryCard label="Red Zones" value={`${afterResults.redZoneCount}`} sub={`/ ${afterResults.zones.length}`} tone="danger" />
                  <SummaryCard label="To Relocate" value={afterResults.totalEvacNeeded.toLocaleString()} sub="people" tone="warn" />
                  <SummaryCard
                    label="Allocated"
                    value={afterResults.totalAllocated.toLocaleString()}
                    sub={afterResults.unallocated > 0 ? `${afterResults.unallocated.toLocaleString()} unsheltered` : 'all housed'}
                    tone={afterResults.unallocated > 0 ? 'danger' : 'ok'}
                  />
                </div>

                {/* Red zone callout */}
                {afterResults.redZoneCount > 0 && (
                  <div className="rounded-xl border border-red-500/25 bg-red-500/5 p-4 flex items-start gap-3">
                    <AlertTriangle size={18} className="text-red-400 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <span className="text-red-300 font-semibold">{afterResults.redZoneCount} Red Zone{afterResults.redZoneCount !== 1 ? 's' : ''}</span>
                      <span className="text-slate-400"> identified in this scenario — </span>
                      <span className="text-slate-300">{afterResults.redZonePopulation.toLocaleString()} people</span>
                      <span className="text-slate-400"> reside in zones with risk score ≥ {RED_ZONE_THRESHOLD}. </span>
                      <span className="text-slate-500 text-xs">Red Zones are zones that cross the critical-risk threshold in the simulation.</span>
                    </div>
                  </div>
                )}

                <RelocationTables results={afterResults} />

                <ExplanationPanel results={afterResults} params={params} />
              </div>
            )}

            {tab === 'comparison' && (
              <div className="space-y-5 animate-fade-in-up">
                <div className="rounded-2xl border border-ink-700 bg-ink-850/60 p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                      <BarChart3 size={15} className="text-ink-500" />
                      Before vs After
                    </h2>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${hasChanges ? 'bg-sky-500/15 text-sky-300' : 'bg-ink-700 text-slate-500'}`}>
                      {hasChanges ? 'scenario changed' : 'no changes yet'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">
                    Baseline parameters vs current simulation parameters. Green deltas = improvement, red = worsening.
                  </p>
                  <ComparisonView before={beforeResults} after={afterResults} />
                </div>
              </div>
            )}

            {tab === 'allocation' && (
              <div className="space-y-5 animate-fade-in-up">
                <div className="rounded-2xl border border-ink-700 bg-ink-850/60 p-5">
                  <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-1">
                    <Layers size={15} className="text-ink-500" />
                    Relocation Allocation
                  </h2>
                  <p className="text-xs text-slate-500 mb-4">
                    How people from at-risk zones are distributed to shelters, by priority (highest risk first).
                  </p>
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <SummaryCard label="To Relocate" value={afterResults.totalEvacNeeded.toLocaleString()} sub="people" tone="warn" />
                    <SummaryCard label="Allocated" value={afterResults.totalAllocated.toLocaleString()} sub="housed" tone="ok" />
                    <SummaryCard label="Unsheltered" value={afterResults.unallocated.toLocaleString()} sub="no capacity" tone={afterResults.unallocated > 0 ? 'danger' : 'ok'} />
                  </div>
                  <RelocationTables results={afterResults} />
                </div>
              </div>
            )}

            {tab === 'report' && (
              <div className="space-y-5 animate-fade-in-up">
                <div className="rounded-2xl border border-ink-700 bg-ink-850/60 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                      <BarChart3 size={15} className="text-ink-500" />
                      Scenario Report
                    </h2>
                    <ReportExport results={afterResults} params={params} baseline={baseline} />
                  </div>
                  <p className="text-xs text-slate-500 mb-4">
                    Full simulation summary. Export a text file for offline reference or training records.
                  </p>

                  <ExplanationPanel results={afterResults} params={params} />

                  <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-ink-700 bg-ink-900/50 overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-ink-700 bg-ink-850/50 flex items-center gap-2">
                        <Lightbulb size={14} className="text-amber-400" />
                        <h4 className="text-xs uppercase tracking-wide text-slate-300 font-semibold">Current Parameters</h4>
                      </div>
                      <div className="p-4 space-y-2 text-sm">
                        <ParamRow label="Rainfall Intensity" value={`${params.rainfall}`} />
                        <ParamRow label="Hazard Severity" value={`${params.hazardSeverity}`} />
                        <ParamRow label="Available Capacity" value={`${params.availableCapacityPct}%`} />
                        <ParamRow label="Road Accessibility" value={`${params.accessibilityPct}%`} />
                      </div>
                    </div>

                    <div className="rounded-xl border border-ink-700 bg-ink-900/50 overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-ink-700 bg-ink-850/50 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-red-400" />
                        <h4 className="text-xs uppercase tracking-wide text-slate-300 font-semibold">Scenario Outcome</h4>
                      </div>
                      <div className="p-4 space-y-2 text-sm">
                        <ParamRow label="Average Risk" value={`${afterResults.avgRisk}/100`} />
                        <ParamRow label="Red Zones" value={`${afterResults.redZoneCount} / ${afterResults.zones.length}`} />
                        <ParamRow label="Red Zone Population" value={afterResults.redZonePopulation.toLocaleString()} />
                        <ParamRow label="People to Relocate" value={afterResults.totalEvacNeeded.toLocaleString()} />
                        <ParamRow label="Sheltered" value={afterResults.totalAllocated.toLocaleString()} />
                        <ParamRow label="Unsheltered" value={afterResults.unallocated.toLocaleString()} highlight={afterResults.unallocated > 0} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                    <p className="text-[12px] text-amber-200/80">
                      <span className="font-semibold">Disclaimer:</span> This report is generated from a hypothetical simulation model. It does not represent real-time conditions or official emergency guidance. Use for planning and training purposes only.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="border-t border-ink-800 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-[11px] text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Disaster GIS Scenario Simulation — for planning & training only.</span>
          <span className="flex items-center gap-1.5">
            <AlertTriangle size={11} className="text-amber-500/70" />
            Not a substitute for official emergency warnings.
          </span>
        </div>
      </footer>
    </div>
  );
}

function BaselineChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between bg-ink-900/50 border border-ink-700 rounded-lg px-2 py-1">
      <span className="text-slate-500">{label}</span>
      <span className="font-mono text-slate-300 tabular-nums">{value}</span>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone: 'ok' | 'warn' | 'danger';
}) {
  const tones = {
    ok: 'text-emerald-400',
    warn: 'text-amber-400',
    danger: 'text-red-400',
  };
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-4">
      <div className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={`text-2xl font-bold tabular-nums ${tones[tone]}`}>{value}</span>
        {sub && <span className="text-[11px] text-slate-500">{sub}</span>}
      </div>
    </div>
  );
}

function ParamRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <span className={`font-mono tabular-nums font-medium ${highlight ? 'text-red-400' : 'text-slate-200'}`}>{value}</span>
    </div>
  );
}
