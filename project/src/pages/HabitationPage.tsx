import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Home, Search, X, Info } from "lucide-react";
import { useScenario } from "@/context/ScenarioContext";
import { HABITATIONS, riskClassFromScore, riskBarColor } from "@/data/gisData";
import { effectiveRisk, populationAtRisk, vulnerablePopulation, priorityScore, priorityTier, historicalImpactScore } from "@/lib/simulation";
import { Card, CardHeader, CardBody, PageHeader, RiskBadge, PriorityBadge, Select, SearchInput } from "@/components/ui";

export default function HabitationPage() {
  const { scenario } = useScenario();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const selectedId = params.get("id");
  const selected = HABITATIONS.find((h) => h.id === selectedId) ?? null;

  const filtered = HABITATIONS.filter((h) => {
    if (search && !h.name.toLowerCase().includes(search.toLowerCase())) return false;
    const risk = effectiveRisk(h, scenario);
    if (riskFilter !== "all") {
      const cls = riskClassFromScore(risk);
      if (cls.toLowerCase() !== riskFilter) return false;
    }
    if (priorityFilter !== "all" && priorityTier(h, scenario) !== priorityFilter) return false;
    return true;
  });

  const rows = filtered.map((h) => ({
    id: h.id, name: h.name, pop: h.population, risk: effectiveRisk(h, scenario),
    vuln: h.vulnerability, hist: h.historicalEvents,
    atRisk: populationAtRisk(h, scenario), tier: priorityTier(h, scenario),
  })).sort((a, b) => b.risk - a.risk);

  return (
    <div>
      <PageHeader title="Habitation & Vulnerability" subtitle="Population demographics, risk and vulnerability profiles." />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-7">
          <Card>
            <CardHeader title={`Habitations (${rows.length})`} icon={<Home className="w-4 h-4 text-blue-600" />} />
            <CardBody className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <SearchInput value={search} onChange={setSearch} placeholder="Search habitations…" />
                <Select value={riskFilter} onChange={setRiskFilter} options={[{ value: "all", label: "All risk levels" }, { value: "severe", label: "Severe" }, { value: "high", label: "High" }, { value: "moderate", label: "Moderate" }, { value: "safe", label: "Safe" }]} />
                <Select value={priorityFilter} onChange={setPriorityFilter} options={[{ value: "all", label: "All priorities" }, { value: "IMMEDIATE", label: "Immediate" }, { value: "SHORT-TERM", label: "Short-term" }, { value: "MEDIUM-TERM", label: "Medium-term" }, { value: "LOW", label: "Low" }]} />
              </div>
              <div className="overflow-x-auto max-h-[520px] overflow-y-auto border border-slate-100 rounded">
                <table className="w-full text-[11px]">
                  <thead className="bg-slate-50 text-slate-600 sticky top-0">
                    <tr>
                      <th className="text-left px-2 py-1.5 font-semibold">Habitation</th>
                      <th className="text-right px-2 py-1.5 font-semibold">Pop.</th>
                      <th className="text-left px-2 py-1.5 font-semibold">Risk</th>
                      <th className="text-right px-2 py-1.5 font-semibold">Vuln.</th>
                      <th className="text-right px-2 py-1.5 font-semibold">Hist.</th>
                      <th className="text-left px-2 py-1.5 font-semibold">Priority</th>
                      <th className="text-right px-2 py-1.5 font-semibold">At Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id} onClick={() => setParams({ id: r.id })} className={`border-t border-slate-100 cursor-pointer hover:bg-blue-50 ${selectedId === r.id ? "bg-blue-50" : ""}`}>
                        <td className="px-2 py-1.5 text-slate-800 font-medium">{r.name}</td>
                        <td className="px-2 py-1.5 text-right tabular-nums">{r.pop.toLocaleString()}</td>
                        <td className="px-2 py-1.5"><RiskBadge score={r.risk} /></td>
                        <td className="px-2 py-1.5 text-right tabular-nums">{r.vuln}</td>
                        <td className="px-2 py-1.5 text-right tabular-nums">{r.hist}</td>
                        <td className="px-2 py-1.5"><PriorityBadge priority={r.tier} /></td>
                        <td className="px-2 py-1.5 text-right tabular-nums">{r.atRisk.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-5">
          {!selected ? (
            <Card><CardBody><div className="text-center text-[12px] text-slate-400 py-12"><Search className="w-6 h-6 mx-auto mb-2 text-slate-300" />Select a habitation to view its profile.</div></CardBody></Card>
          ) : (
            <Card>
              <CardHeader title={selected.name} icon={<Home className="w-4 h-4 text-blue-600" />} action={
                <button onClick={() => setParams({})} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
              } />
              <CardBody className="space-y-4">
                {(() => {
                  const risk = effectiveRisk(selected, scenario);
                  const pscore = priorityScore(selected, scenario);
                  const tier = priorityTier(selected, scenario);
                  const histImpact = historicalImpactScore(selected);
                  const vulnPop = vulnerablePopulation(selected);
                  return (
                    <>
                      <div className="flex items-center gap-2">
                        <RiskBadge score={risk} />
                        <PriorityBadge priority={tier} />
                        <span className="text-[11px] text-slate-500">Priority score {pscore}/100</span>
                      </div>

                      <div>
                        <div className="text-[10px] font-semibold text-slate-600 uppercase mb-1">Risk Score</div>
                        <div className="h-3 bg-slate-100 rounded overflow-hidden"><div className={`h-full ${riskBarColor(risk)}`} style={{ width: `${risk}%` }} /></div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{risk}/100</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <Field label="Population" value={selected.population.toLocaleString()} />
                        <Field label="Households" value={selected.households.toLocaleString()} />
                        <Field label="Children" value={selected.children.toLocaleString()} />
                        <Field label="Elderly" value={selected.elderly.toLocaleString()} />
                        <Field label="Persons with Disabilities" value={selected.pwd.toLocaleString()} />
                        <Field label="Medically Vulnerable" value={selected.medicallyVulnerable.toLocaleString()} />
                        <Field label="Vulnerable Pop. (calc.)" value={vulnPop.toLocaleString()} />
                        <Field label="Healthcare Access" value={`${selected.healthcareAccess}/100`} />
                        <Field label="Road Accessibility" value={`${selected.roadAccess}/100`} />
                        <Field label="Infrastructure" value={`${selected.infrastructure}/100`} />
                        <Field label="Vulnerability Score" value={`${selected.vulnerability}/100`} />
                        <Field label="Historical Disasters" value={selected.historicalEvents.toString()} />
                        <Field label="Historical Impact Score" value={`${histImpact}/100`} />
                        <Field label="Relocation Priority" value={tier} />
                      </div>

                      <div className="bg-blue-50 border border-blue-100 rounded p-3">
                        <div className="flex items-start gap-2">
                          <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                          <p className="text-[11px] text-slate-700 leading-relaxed">
                            <span className="font-semibold">Vulnerability score</span> combines population sensitivity
                            (children, elderly, persons with disabilities, medically vulnerable) and access constraints
                            (healthcare, roads, infrastructure). A higher score means the community is less able to
                            cope with and recover from a hazard event.
                          </p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded p-2">
      <div className="text-[9px] text-slate-500 uppercase tracking-wide">{label}</div>
      <div className="text-[12px] font-semibold text-slate-800">{value}</div>
    </div>
  );
}
