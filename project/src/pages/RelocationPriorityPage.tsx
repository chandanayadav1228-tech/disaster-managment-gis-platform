import { useState } from "react";
import { ListOrdered, X, Info } from "lucide-react";
import { useScenario } from "@/context/ScenarioContext";
import { HABITATIONS, habitationNameById, riskBarColor } from "@/data/gisData";
import { effectiveRisk, populationAtRisk, priorityScore, priorityTier, historicalImpactScore, priorityReasons } from "@/lib/simulation";
import { Card, CardHeader, CardBody, PageHeader, RiskBadge, PriorityBadge } from "@/components/ui";

const TIERS = ["IMMEDIATE", "SHORT-TERM", "MEDIUM-TERM", "LOW"] as const;

export default function RelocationPriorityPage() {
  const { scenario } = useScenario();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const ranked = HABITATIONS.map((h) => ({
    id: h.id, name: h.name, pop: h.population, vuln: h.vulnerability, hist: h.historicalEvents,
    risk: effectiveRisk(h, scenario), atRisk: populationAtRisk(h, scenario),
    pscore: priorityScore(h, scenario), tier: priorityTier(h, scenario),
    recSite: habitationNameById(h.recommendedRelocationId), h,
  })).sort((a, b) => b.pscore - a.pscore);

  const selected = selectedId ? ranked.find((r) => r.id === selectedId) : null;

  return (
    <div>
      <PageHeader title="Relocation Priority" subtitle="Habitations ranked by composite risk, vulnerability and historical impact." />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-7 space-y-4">
          {TIERS.map((tier) => {
            const items = ranked.filter((r) => r.tier === tier);
            if (items.length === 0) return null;
            return (
              <Card key={tier}>
                <CardHeader title={`${tier} (${items.length})`} icon={<PriorityBadge priority={tier} />} />
                <CardBody className="space-y-2">
                  {items.map((r) => (
                    <div key={r.id} onClick={() => setSelectedId(r.id)} className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-slate-50 ${selectedId === r.id ? "bg-blue-50" : ""}`}>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-medium text-slate-800 truncate">{r.name}</div>
                        <div className="h-1.5 bg-slate-100 rounded mt-1 overflow-hidden"><div className={`h-full ${riskBarColor(r.risk)}`} style={{ width: `${r.pscore}%` }} /></div>
                      </div>
                      <div className="text-right shrink-0 text-[10px] text-slate-500">
                        <div className="font-bold text-slate-700 tabular-nums">{r.pscore}</div>
                        <div>score</div>
                      </div>
                      <div className="text-right shrink-0 text-[10px] text-slate-500 w-16">
                        <div className="font-semibold text-slate-700 tabular-nums">{r.pop.toLocaleString()}</div>
                        <div>pop.</div>
                      </div>
                      <RiskBadge score={r.risk} />
                    </div>
                  ))}
                </CardBody>
              </Card>
            );
          })}

          <Card>
            <CardHeader title="Full Ranking" icon={<ListOrdered className="w-4 h-4 text-blue-600" />} />
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-[11px]">
                <thead className="bg-slate-50 text-slate-600 sticky top-0">
                  <tr>
                    <th className="text-left px-2 py-1.5 font-semibold">#</th>
                    <th className="text-left px-2 py-1.5 font-semibold">Habitation</th>
                    <th className="text-right px-2 py-1.5 font-semibold">Risk</th>
                    <th className="text-right px-2 py-1.5 font-semibold">Vuln.</th>
                    <th className="text-right px-2 py-1.5 font-semibold">Pop.</th>
                    <th className="text-right px-2 py-1.5 font-semibold">Hist.</th>
                    <th className="text-right px-2 py-1.5 font-semibold">Score</th>
                    <th className="text-left px-2 py-1.5 font-semibold">Priority</th>
                    <th className="text-left px-2 py-1.5 font-semibold">Recommended Site</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((r, i) => (
                    <tr key={r.id} onClick={() => setSelectedId(r.id)} className={`border-t border-slate-100 cursor-pointer hover:bg-blue-50 ${selectedId === r.id ? "bg-blue-50" : ""}`}>
                      <td className="px-2 py-1.5 font-bold text-slate-400">{i + 1}</td>
                      <td className="px-2 py-1.5 text-slate-800 font-medium">{r.name}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{r.risk}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{r.vuln}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{r.pop.toLocaleString()}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{r.hist}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums font-semibold">{r.pscore}</td>
                      <td className="px-2 py-1.5"><PriorityBadge priority={r.tier} /></td>
                      <td className="px-2 py-1.5 text-slate-600">{r.recSite ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-5">
          {!selected ? (
            <Card><CardBody><div className="text-center text-[12px] text-slate-400 py-12">Select a habitation to see why it received its priority.</div></CardBody></Card>
          ) : (
            <Card>
              <CardHeader title={selected.name} icon={<ListOrdered className="w-4 h-4 text-blue-600" />} action={
                <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
              } />
              <CardBody className="space-y-4">
                <div className="flex items-center gap-2">
                  <RiskBadge score={selected.risk} />
                  <PriorityBadge priority={selected.tier} />
                  <span className="text-[11px] text-slate-500">Score {selected.pscore}/100</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-50 rounded p-2"><div className="text-[9px] text-slate-500 uppercase">Risk Score</div><div className="font-semibold text-slate-800">{selected.risk}/100</div></div>
                  <div className="bg-slate-50 rounded p-2"><div className="text-[9px] text-slate-500 uppercase">Vulnerability</div><div className="font-semibold text-slate-800">{selected.vuln}/100</div></div>
                  <div className="bg-slate-50 rounded p-2"><div className="text-[9px] text-slate-500 uppercase">Population</div><div className="font-semibold text-slate-800">{selected.pop.toLocaleString()}</div></div>
                  <div className="bg-slate-50 rounded p-2"><div className="text-[9px] text-slate-500 uppercase">Historical Impact</div><div className="font-semibold text-slate-800">{historicalImpactScore(selected.h)}/100</div></div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded p-3">
                  <div className="flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[11px] font-semibold text-slate-700 mb-1">{selected.tier} because:</div>
                      <ul className="text-[11px] text-slate-700 space-y-0.5 list-disc list-inside">
                        {priorityReasons(selected.h, scenario).map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-semibold text-slate-600 uppercase mb-1">Recommended Relocation Site</div>
                  <div className="text-[12px] text-slate-800 font-medium">{selected.recSite ?? "In-place mitigation recommended"}</div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
