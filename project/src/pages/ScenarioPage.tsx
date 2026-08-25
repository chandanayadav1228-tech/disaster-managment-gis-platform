import { useState } from "react";
import { SlidersHorizontal, ArrowRight, Download } from "lucide-react";
import { useScenario } from "@/context/ScenarioContext";
import { DEFAULT_SCENARIO, SCENARIO_PRESETS, computeMetrics, computeAllocations, scenarioComparison, type ScenarioParams, type ScenarioPreset } from "@/lib/simulation";
import { Card, CardHeader, CardBody, PageHeader, PriorityBadge, downloadCsv } from "@/components/ui";

function SliderRow({ label, value, onChange, hint }: { label: string; value: number; onChange: (v: number) => void; hint: string }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">{label}</label>
        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded tabular-nums">{value}</span>
      </div>
      <input type="range" min={0} max={100} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
      <p className="text-[10px] text-slate-500 mt-1">{hint}</p>
    </div>
  );
}

export default function ScenarioPage() {
  const { scenario, setScenario } = useScenario();
  const [showAfter, setShowAfter] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>("heavy");

  const applyPreset = (p: ScenarioPreset) => { setScenario(p.params); setActivePreset(p.id); };
  const update = (s: ScenarioParams) => { setScenario(s); setActivePreset(null); };
  const set = (patch: Partial<ScenarioParams>) => update({ ...scenario, ...patch });

  const before = scenario;
  const afterScenario: ScenarioParams = showAfter
    ? { ...scenario, hazardSeverity: Math.max(0, scenario.hazardSeverity - 25), rainfallIntensity: Math.max(0, scenario.rainfallIntensity - 20) }
    : scenario;

  const beforeMetrics = computeMetrics(before);
  const afterMetrics = computeMetrics(afterScenario);
  const allocation = computeAllocations(scenario);
  const comparison = scenarioComparison(before, afterScenario);

  const exportCsv = () => {
    downloadCsv("scenario-comparison-report.csv", [
      ["Metric", "Before", "After", "Delta"],
      ...comparison.map((c) => [c.metric, c.before, c.after, c.delta]),
      [],
      ["Habitation", "Risk", "Priority", "To Move", "Assigned Site", "Assigned", "Unassigned"],
      ...allocation.allocations.map((a) => [a.habitationName, a.fromRisk, a.priority, a.populationToMove, a.toSiteName ?? "—", a.assigned, a.unassigned]),
    ]);
  };

  const displayMetrics = showAfter ? afterMetrics : beforeMetrics;

  return (
    <div>
      <PageHeader title="Scenario Simulation" subtitle="Adjust hazard parameters and compare before/after relocation outcomes." action={
        <button onClick={exportCsv} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"><Download className="w-3 h-3" /> Export CSV</button>
      } />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-3">
          <Card>
            <CardHeader title="Scenario Controls" icon={<SlidersHorizontal className="w-4 h-4 text-blue-600" />} />
            <CardBody>
              <div className="mb-4">
                <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-2">Presets</div>
                <div className="grid grid-cols-2 gap-2">
                  {SCENARIO_PRESETS.map((p) => (
                    <button key={p.id} onClick={() => applyPreset(p)} className={`text-[11px] px-2 py-1.5 rounded border text-left ${activePreset === p.id ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200 hover:bg-blue-50"}`}>
                      <div className="font-semibold">{p.name}</div>
                      <div className={`text-[9px] mt-0.5 ${activePreset === p.id ? "text-blue-100" : "text-slate-500"}`}>{p.description}</div>
                    </button>
                  ))}
                </div>
              </div>
              <SliderRow label="Rainfall Intensity" value={scenario.rainfallIntensity} onChange={(v) => set({ rainfallIntensity: v })} hint="Drives flood and cloudburst activation." />
              <SliderRow label="Hazard Severity" value={scenario.hazardSeverity} onChange={(v) => set({ hazardSeverity: v })} hint="Multiplies across all hazard types." />
              <SliderRow label="Shelter Capacity" value={scenario.shelterCapacity} onChange={(v) => set({ shelterCapacity: v })} hint="Effective capacity at sites." />
              <SliderRow label="Road Accessibility" value={scenario.roadAccessibility} onChange={(v) => set({ roadAccessibility: v })} hint="Affects relocation feasibility." />
              <label className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 cursor-pointer">
                <span className="text-[11px] font-semibold text-slate-700 uppercase">Before / After</span>
                <button onClick={() => setShowAfter(!showAfter)} className={`relative w-10 h-5 rounded-full transition-colors ${showAfter ? "bg-blue-600" : "bg-slate-300"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${showAfter ? "translate-x-5" : ""}`} />
                </button>
              </label>
              <p className="text-[10px] text-slate-500 mt-1">{showAfter ? "After relocation allocation." : "Baseline risk state."}</p>
            </CardBody>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-9 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Population at Risk", value: displayMetrics.populationAtRisk, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
              { label: "Vulnerable Pop.", value: displayMetrics.vulnerablePopulation, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
              { label: "Immediate Relocation", value: displayMetrics.immediateRelocation, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
              { label: "Capacity Deficit", value: displayMetrics.capacityDeficit, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
            ].map((c) => (
              <div key={c.label} className={`rounded-lg border ${c.border} ${c.bg} p-3`}>
                <div className={`text-lg font-bold ${c.color} tabular-nums`}>{c.value.toLocaleString()}</div>
                <div className="text-[10px] text-slate-600 uppercase">{c.label}</div>
              </div>
            ))}
          </div>

          {showAfter && (
            <Card>
              <CardHeader title="Before vs After Comparison" icon={<ArrowRight className="w-4 h-4 text-blue-600" />} />
              <CardBody>
                <table className="w-full text-[12px]">
                  <thead className="text-slate-600 border-b border-slate-100">
                    <tr><th className="text-left py-1.5">Metric</th><th className="text-right py-1.5">Before</th><th className="text-right py-1.5">After</th><th className="text-right py-1.5">Change</th></tr>
                  </thead>
                  <tbody>
                    {comparison.map((c) => (
                      <tr key={c.metric} className="border-b border-slate-50">
                        <td className="py-1.5 text-slate-700">{c.metric}</td>
                        <td className="py-1.5 text-right tabular-nums">{c.before.toLocaleString()}</td>
                        <td className="py-1.5 text-right tabular-nums">{c.after.toLocaleString()}</td>
                        <td className={`py-1.5 text-right tabular-nums font-semibold ${c.delta < 0 ? "text-green-600" : c.delta > 0 ? "text-red-600" : "text-slate-500"}`}>
                          {c.delta > 0 ? "+" : ""}{c.delta.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader title="Relocation Allocation" icon={<SlidersHorizontal className="w-4 h-4 text-blue-600" />} />
            <CardBody className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center"><div className="text-base font-bold text-blue-700 tabular-nums">{allocation.totalRelocated.toLocaleString()}</div><div className="text-[9px] text-slate-600 uppercase">Relocated</div></div>
                <div className="bg-orange-50 border border-orange-200 rounded p-2 text-center"><div className="text-base font-bold text-orange-700 tabular-nums">{allocation.totalUnassigned.toLocaleString()}</div><div className="text-[9px] text-slate-600 uppercase">Unassigned</div></div>
                <div className="bg-green-50 border border-green-200 rounded p-2 text-center"><div className="text-base font-bold text-green-700 tabular-nums">{allocation.siteUtilization.reduce((s, x) => s + x.capacity, 0).toLocaleString()}</div><div className="text-[9px] text-slate-600 uppercase">Total Capacity</div></div>
              </div>
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto border border-slate-100 rounded">
                <table className="w-full text-[11px]">
                  <thead className="bg-slate-50 text-slate-600 sticky top-0">
                    <tr><th className="text-left px-2 py-1.5 font-semibold">Habitation</th><th className="text-right px-2 py-1.5 font-semibold">Risk</th><th className="text-left px-2 py-1.5 font-semibold">Priority</th><th className="text-right px-2 py-1.5 font-semibold">Move</th><th className="text-right px-2 py-1.5 font-semibold">Assigned</th><th className="text-left px-2 py-1.5 font-semibold">Site</th></tr>
                  </thead>
                  <tbody>
                    {allocation.allocations.map((a) => (
                      <tr key={a.habitationId} className="border-t border-slate-100">
                        <td className="px-2 py-1.5 text-slate-800">{a.habitationName}</td>
                        <td className="px-2 py-1.5 text-right tabular-nums">{a.fromRisk}</td>
                        <td className="px-2 py-1.5"><PriorityBadge priority={a.priority} /></td>
                        <td className="px-2 py-1.5 text-right tabular-nums">{a.populationToMove.toLocaleString()}</td>
                        <td className="px-2 py-1.5 text-right tabular-nums">{a.assigned.toLocaleString()}</td>
                        <td className="px-2 py-1.5 text-slate-600">{a.toSiteName ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-600 uppercase mb-1.5">Site Utilization</div>
                <div className="space-y-1.5">
                  {allocation.siteUtilization.map((s) => {
                    const pct = s.capacity > 0 ? (s.assigned / s.capacity) * 100 : 0;
                    return (
                      <div key={s.siteId}>
                        <div className="flex justify-between text-[10px] text-slate-600 mb-0.5"><span>{s.siteName}</span><span className="tabular-nums">{s.assigned.toLocaleString()} / {s.capacity.toLocaleString()}</span></div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
