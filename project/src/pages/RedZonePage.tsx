import { useState } from "react";
import { AlertOctagon, Filter, Download } from "lucide-react";
import { useScenario } from "@/context/ScenarioContext";
import { RED_ZONES, habitationById, type PriorityTier } from "@/data/gisData";
import { redZoneStats, polygonAreaKm2, effectiveRisk, vulnerablePopulation } from "@/lib/simulation";
import { Card, CardHeader, CardBody, PageHeader, RiskBadge, PriorityBadge, Select, downloadCsv } from "@/components/ui";
import GisMap from "@/components/GisMap";
import { DEFAULT_LAYERS, type LayerState } from "@/components/LayerControl";

const ALL_HAZARDS = ["flood", "landslide", "cloudburst", "coastal"];

export default function RedZonePage() {
  const { scenario } = useScenario();
  const [riskFilter, setRiskFilter] = useState("all");
  const [hazardFilter, setHazardFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [minPop, setMinPop] = useState("0");
  const [layers, setLayers] = useState<LayerState>({ ...DEFAULT_LAYERS, habitations: true, redZones: true, flood: true, landslide: true, cloudburst: true, coastal: true });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const stats = redZoneStats(scenario);
  const totalArea = RED_ZONES.reduce((s, rz) => s + polygonAreaKm2(rz.coords), 0);
  const totalPop = stats.reduce((s, z) => s + z.population, 0);
  const totalVuln = stats.reduce((s, z) => s + z.vulnerablePopulation, 0);

  const filtered = stats.filter((z) => {
    if (riskFilter !== "all") {
      const r = z.riskScore;
      if (riskFilter === "severe" && r < 80) return false;
      if (riskFilter === "high" && (r < 60 || r >= 80)) return false;
      if (riskFilter === "moderate" && (r < 40 || r >= 60)) return false;
    }
    if (hazardFilter !== "all" && !z.hazardTypes.includes(hazardFilter)) return false;
    if (priorityFilter !== "all" && z.priority !== priorityFilter) return false;
    if (z.population < Number(minPop)) return false;
    return true;
  });

  const exportCsv = () => {
    downloadCsv("red-zone-report.csv", [
      ["Zone", "Risk Score", "Hazard Types", "Population", "Vulnerable Population", "Historical Events", "Priority"],
      ...filtered.map((z) => [z.name, z.riskScore, z.hazardTypes.join("; "), z.population, z.vulnerablePopulation, z.historicalEvents, z.priority]),
    ]);
  };

  const selectedZone = selectedId ? RED_ZONES.find((r) => r.id === selectedId) : null;
  const selectedStats = selectedId ? stats.find((s) => s.id === selectedId) : null;

  return (
    <div>
      <PageHeader title="Red Zone Analysis" subtitle="Geographic hazard zones with exposed-population breakdown." action={
        <button onClick={exportCsv} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"><Download className="w-3 h-3" /> Export CSV</button>
      } />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className="p-3"><div className="text-xl font-bold text-red-600">{RED_ZONES.length}</div><div className="text-[10px] text-slate-600 uppercase">Total Red Zones</div></Card>
        <Card className="p-3"><div className="text-xl font-bold text-orange-600">{totalArea.toFixed(2)} km²</div><div className="text-[10px] text-slate-600 uppercase">Area Affected</div></Card>
        <Card className="p-3"><div className="text-xl font-bold text-amber-600">{totalPop.toLocaleString()}</div><div className="text-[10px] text-slate-600 uppercase">Population Exposed</div></Card>
        <Card className="p-3"><div className="text-xl font-bold text-rose-600">{totalVuln.toLocaleString()}</div><div className="text-[10px] text-slate-600 uppercase">Vulnerable Population</div></Card>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-5">
          <Card>
            <CardHeader title="Filters" icon={<Filter className="w-4 h-4 text-blue-600" />} />
            <CardBody className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-600 uppercase">Risk</label>
                <Select value={riskFilter} onChange={setRiskFilter} options={[{ value: "all", label: "All" }, { value: "severe", label: "Severe" }, { value: "high", label: "High" }, { value: "moderate", label: "Moderate" }]} />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600 uppercase">Hazard Type</label>
                <Select value={hazardFilter} onChange={setHazardFilter} options={[{ value: "all", label: "All" }, ...ALL_HAZARDS.map((h) => ({ value: h, label: h.charAt(0).toUpperCase() + h.slice(1) }))]} />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600 uppercase">Priority</label>
                <Select value={priorityFilter} onChange={setPriorityFilter} options={[{ value: "all", label: "All" }, { value: "IMMEDIATE", label: "Immediate" }, { value: "SHORT-TERM", label: "Short-term" }, { value: "MEDIUM-TERM", label: "Medium-term" }]} />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600 uppercase">Min Population</label>
                <input type="number" value={minPop} onChange={(e) => setMinPop(e.target.value)} className="text-[12px] px-2 py-1.5 border border-slate-200 rounded-md w-full" />
              </div>
            </CardBody>
          </Card>

          <Card className="mt-4">
            <CardHeader title={`Red Zones (${filtered.length})`} icon={<AlertOctagon className="w-4 h-4 text-red-600" />} />
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-[11px]">
                <thead className="bg-slate-50 text-slate-600 sticky top-0">
                  <tr>
                    <th className="text-left px-2 py-1.5 font-semibold">Zone</th>
                    <th className="text-left px-2 py-1.5 font-semibold">Risk</th>
                    <th className="text-left px-2 py-1.5 font-semibold">Hazards</th>
                    <th className="text-right px-2 py-1.5 font-semibold">Pop.</th>
                    <th className="text-right px-2 py-1.5 font-semibold">Vuln.</th>
                    <th className="text-left px-2 py-1.5 font-semibold">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((z) => (
                    <tr key={z.id} onClick={() => setSelectedId(z.id)} className={`border-t border-slate-100 cursor-pointer hover:bg-blue-50 ${selectedId === z.id ? "bg-blue-50" : ""}`}>
                      <td className="px-2 py-1.5 text-slate-800">{z.name}</td>
                      <td className="px-2 py-1.5"><RiskBadge score={z.riskScore} /></td>
                      <td className="px-2 py-1.5 text-slate-600 capitalize">{z.hazardTypes.join(", ")}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{z.population.toLocaleString()}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{z.vulnerablePopulation.toLocaleString()}</td>
                      <td className="px-2 py-1.5"><PriorityBadge priority={z.priority} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-7 space-y-4">
          <Card className="overflow-hidden">
            <CardHeader title="Red Zone Map" icon={<AlertOctagon className="w-4 h-4 text-red-600" />} />
            <div className="h-[400px]">
              <GisMap scenario={scenario} layers={layers} height="400px" />
            </div>
          </Card>

          {selectedStats && selectedZone && (
            <Card>
              <CardHeader title={selectedZone.name} icon={<AlertOctagon className="w-4 h-4 text-red-600" />} />
              <CardBody>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-slate-50 rounded p-2"><div className="text-[10px] text-slate-500 uppercase">Risk Score</div><div className="text-base font-bold text-slate-800">{selectedStats.riskScore}/100</div></div>
                  <div className="bg-slate-50 rounded p-2"><div className="text-[10px] text-slate-500 uppercase">Priority</div><div className="mt-1"><PriorityBadge priority={selectedStats.priority} /></div></div>
                </div>
                <div className="text-[11px] font-semibold text-slate-700 uppercase mb-1">Habitations Inside Zone</div>
                <div className="space-y-1.5">
                  {selectedStats.habitationIds.map((hid) => {
                    const h = habitationById(hid);
                    if (!h) return null;
                    const risk = effectiveRisk(h, scenario);
                    return (
                      <div key={hid} className="flex items-center justify-between text-[12px] py-1 border-b border-slate-50">
                        <span className="text-slate-800">{h.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 tabular-nums">{h.population.toLocaleString()}</span>
                          <RiskBadge score={risk} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
