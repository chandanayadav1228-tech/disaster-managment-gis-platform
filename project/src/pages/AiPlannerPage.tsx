import { useState } from "react";
import { Brain, Sparkles, CheckCircle2 } from "lucide-react";
import { useScenario } from "@/context/ScenarioContext";
import { HABITATIONS, riskBarColor } from "@/data/gisData";
import { aiRecommendation, type AIRecommendation } from "@/lib/simulation";
import { Card, CardHeader, CardBody, PageHeader, RiskBadge, PriorityBadge, Select } from "@/components/ui";

export default function AiPlannerPage() {
  const { scenario } = useScenario();
  const [habitationId, setHabitationId] = useState(HABITATIONS[0].id);
  const rec = aiRecommendation(habitationId, scenario) as AIRecommendation | null;

  return (
    <div>
      <PageHeader title="AI Relocation Planner" subtitle="Decision-support engine: analyzes risk, vulnerability and capacity to recommend relocation." />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-4">
          <Card>
            <CardHeader title="Select Habitation" icon={<Brain className="w-4 h-4 text-blue-600" />} />
            <CardBody>
              <label className="text-[10px] font-semibold text-slate-600 uppercase block mb-1">Habitation</label>
              <Select value={habitationId} onChange={setHabitationId} options={HABITATIONS.map((h) => ({ value: h.id, label: h.name }))} />
              {rec && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <RiskBadge score={rec.risk} />
                    <PriorityBadge priority={rec.priority} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-50 rounded p-2"><div className="text-[9px] text-slate-500 uppercase">Risk Score</div><div className="font-semibold">{rec.risk}/100</div></div>
                    <div className="bg-slate-50 rounded p-2"><div className="text-[9px] text-slate-500 uppercase">Vulnerability</div><div className="font-semibold">{rec.vulnerability}/100</div></div>
                    <div className="bg-slate-50 rounded p-2"><div className="text-[9px] text-slate-500 uppercase">Population</div><div className="font-semibold">{rec.population.toLocaleString()}</div></div>
                    <div className="bg-slate-50 rounded p-2"><div className="text-[9px] text-slate-500 uppercase">Hist. Impact</div><div className="font-semibold">{rec.historicalImpact}/100</div></div>
                    <div className="bg-slate-50 rounded p-2"><div className="text-[9px] text-slate-500 uppercase">Priority Score</div><div className="font-semibold">{rec.priorityScore}/100</div></div>
                    <div className="bg-slate-50 rounded p-2"><div className="text-[9px] text-slate-500 uppercase">Priority</div><div className="font-semibold">{rec.priority}</div></div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {rec && (
            <Card className="mt-4">
              <CardHeader title="Why this priority?" icon={<Sparkles className="w-4 h-4 text-blue-600" />} />
              <CardBody>
                <ul className="text-[11px] text-slate-700 space-y-1 list-disc list-inside">
                  {rec.reasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </CardBody>
            </Card>
          )}
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-4">
          {rec && rec.best && (
            <Card className="border-blue-300">
              <CardHeader title="Recommended Site" icon={<CheckCircle2 className="w-4 h-4 text-green-600" />} />
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="text-base font-bold text-slate-800">{rec.best.site.name}</div>
                    <div className="text-[11px] text-slate-500">Suitability {rec.best.suitability}/100 • {rec.best.distanceKm} km away</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-slate-500">Recommended Allocation</div>
                    <div className="text-xl font-bold text-blue-700 tabular-nums">{rec.recommendedAllocation.toLocaleString()}</div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded p-3">
                  <p className="text-[12px] text-slate-700 leading-relaxed">{rec.rationale}</p>
                </div>
              </CardBody>
            </Card>
          )}

          {rec && (
            <Card>
              <CardHeader title="Candidate Site Ranking" icon={<Brain className="w-4 h-4 text-blue-600" />} />
              <CardBody className="space-y-2">
                {rec.candidates.map((c, i) => (
                  <div key={c.site.id} className={`flex items-center gap-3 p-2 rounded border ${i === 0 ? "border-blue-300 bg-blue-50" : "border-slate-200"}`}>
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-slate-800 truncate">{c.site.name}</div>
                      <div className="h-1.5 bg-slate-100 rounded mt-1 overflow-hidden"><div className={`h-full ${riskBarColor(c.suitability)}`} style={{ width: `${c.suitability}%` }} /></div>
                    </div>
                    <div className="text-right text-[10px] text-slate-500 shrink-0">
                      <div className="font-bold text-blue-700 tabular-nums text-[13px]">{c.suitability}</div>
                      <div>{c.available.toLocaleString()} avail</div>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {rec && !rec.best && (
            <Card><CardBody><div className="text-center text-[12px] text-slate-400 py-8">No suitable site with available capacity was identified.</div></CardBody></Card>
          )}
        </div>
      </div>
    </div>
  );
}
