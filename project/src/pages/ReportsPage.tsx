import { FileBarChart, Download, Printer } from "lucide-react";
import { useScenario } from "@/context/ScenarioContext";
import { HABITATIONS, RELOCATION_SITES, RED_ZONES, HISTORICAL_DISASTERS, siteSuitability, siteAvailableCapacity } from "@/data/gisData";
import { computeMetrics, computeAllocations, carryingCapacity, redZoneStats, historicalStats, aiRecommendation, effectiveRisk, priorityScore, priorityTier, polygonAreaKm2 } from "@/lib/simulation";
import { Card, CardHeader, CardBody, PageHeader, downloadCsv } from "@/components/ui";

export default function ReportsPage() {
  const { scenario } = useScenario();
  const metrics = computeMetrics(scenario);
  const allocation = computeAllocations(scenario);
  const cc = carryingCapacity(scenario);
  const rzStats = redZoneStats(scenario);
  const histStats = historicalStats();

  const reports = [
    { id: "risk", name: "Risk Report", desc: "Per-habitation risk scores and classifications." },
    { id: "redzone", name: "Red Zone Report", desc: "Zone-level exposure and priority." },
    { id: "vulnerability", name: "Vulnerability Report", desc: "Demographic vulnerability breakdown." },
    { id: "priority", name: "Relocation Priority Report", desc: "Ranked priority with reasons." },
    { id: "sites", name: "Safe Site Report", desc: "Site suitability and capacity." },
    { id: "capacity", name: "Carrying Capacity Report", desc: "Capacity vs demand accounting." },
    { id: "ai", name: "AI Recommendation Report", desc: "Planner recommendations per habitation." },
    { id: "scenario", name: "Scenario Comparison Report", desc: "Before/after scenario deltas." },
  ];

  const exportAll = () => {
    const lines: string[] = [];
    lines.push("DISASTER GIS — CONSOLIDATED REPORT");
    lines.push(`Scenario: Rainfall ${scenario.rainfallIntensity}, Hazard ${scenario.hazardSeverity}, Shelter ${scenario.shelterCapacity}, Road ${scenario.roadAccessibility}`);
    lines.push("");
    lines.push("=== DASHBOARD METRICS ===");
    lines.push(`Critical Habitations: ${metrics.criticalHabitations}`);
    lines.push(`Population at Risk: ${metrics.populationAtRisk}`);
    lines.push(`Vulnerable Population: ${metrics.vulnerablePopulation}`);
    lines.push(`Immediate Relocation: ${metrics.immediateRelocation}`);
    lines.push(`Available Safe Capacity: ${metrics.availableSafeCapacity}`);
    lines.push(`Capacity Deficit: ${metrics.capacityDeficit}`);
    lines.push("");
    lines.push("=== RISK REPORT ===");
    HABITATIONS.forEach((h) => lines.push(`${h.name}: risk=${effectiveRisk(h, scenario)}, vuln=${h.vulnerability}, pop=${h.population}`));
    lines.push("");
    lines.push("=== RED ZONE REPORT ===");
    rzStats.forEach((z) => lines.push(`${z.name}: risk=${z.riskScore}, pop=${z.population}, priority=${z.priority}`));
    lines.push("");
    lines.push("=== RELOCATION PRIORITY ===");
    HABITATIONS.map((h) => ({ h, s: priorityScore(h, scenario) })).sort((a, b) => b.s - a.s).forEach(({ h, s }) => lines.push(`${h.name}: score=${s}, tier=${priorityTier(h, scenario)}`));
    lines.push("");
    lines.push("=== SAFE SITES ===");
    RELOCATION_SITES.forEach((s) => lines.push(`${s.name}: suitability=${siteSuitability(s)}, available=${siteAvailableCapacity(s)}`));
    lines.push("");
    lines.push("=== CARRYING CAPACITY ===");
    cc.sites.forEach((s) => lines.push(`${s.site.name}: cap=${s.capacity}, allocated=${s.allocated}, remaining=${s.remaining}, status=${s.status}`));
    lines.push("");
    lines.push("=== AI RECOMMENDATIONS ===");
    HABITATIONS.forEach((h) => { const r = aiRecommendation(h.id, scenario); if (r && r.best) lines.push(`${h.name} -> ${r.best.site.name} (${r.best.suitability}/100), alloc=${r.recommendedAllocation}`); });
    lines.push("");
    lines.push("=== HISTORICAL ===");
    HISTORICAL_DISASTERS.forEach((d) => lines.push(`${d.year} ${d.name}: ${d.type}, severity=${d.severity}, affected=${d.affectedPopulation}`));

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "disaster-gis-full-report.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const exportReport = (id: string) => {
    switch (id) {
      case "risk":
        downloadCsv("risk-report.csv", [["Habitation", "Risk", "Vulnerability", "Population", "At Risk", "Priority"], ...HABITATIONS.map((h) => [h.name, effectiveRisk(h, scenario), h.vulnerability, h.population, h.population, priorityTier(h, scenario)])]);
        break;
      case "redzone":
        downloadCsv("red-zone-report.csv", [["Zone", "Risk", "Hazards", "Population", "Vulnerable", "Historical", "Priority"], ...rzStats.map((z) => [z.name, z.riskScore, z.hazardTypes.join("; "), z.population, z.vulnerablePopulation, z.historicalEvents, z.priority])]);
        break;
      case "vulnerability":
        downloadCsv("vulnerability-report.csv", [["Habitation", "Population", "Children", "Elderly", "PWD", "Medically Vulnerable", "Vulnerability Score"], ...HABITATIONS.map((h) => [h.name, h.population, h.children, h.elderly, h.pwd, h.medicallyVulnerable, h.vulnerability])]);
        break;
      case "priority":
        downloadCsv("priority-report.csv", [["Habitation", "Risk", "Vulnerability", "Historical", "Priority Score", "Tier", "Recommended Site"], ...HABITATIONS.map((h) => [h.name, effectiveRisk(h, scenario), h.vulnerability, h.historicalEvents, priorityScore(h, scenario), priorityTier(h, scenario), h.recommendedRelocationId ?? "—"])]);
        break;
      case "sites":
        downloadCsv("safe-sites-report.csv", [["Site", "Suitability", "Total", "Existing", "Available", "Distance"], ...RELOCATION_SITES.map((s) => [s.name, siteSuitability(s), s.totalCapacity, s.existingPopulation, siteAvailableCapacity(s), s.distanceKm])]);
        break;
      case "capacity":
        downloadCsv("carrying-capacity-report.csv", [["Site", "Capacity", "Allocated", "Remaining", "Status"], ...cc.sites.map((s) => [s.site.name, s.capacity, s.allocated, s.remaining, s.status])]);
        break;
      case "ai":
        downloadCsv("ai-recommendation-report.csv", [["Habitation", "Recommended Site", "Suitability", "Allocation"], ...HABITATIONS.map((h) => { const r = aiRecommendation(h.id, scenario); return [h.name, r?.best?.site.name ?? "—", r?.best?.suitability ?? 0, r?.recommendedAllocation ?? 0]; })]);
        break;
      case "scenario":
        downloadCsv("scenario-comparison.csv", [["Metric", "Value"], ["Population at Risk", metrics.populationAtRisk], ["Immediate Relocation", metrics.immediateRelocation], ["Capacity Deficit", metrics.capacityDeficit], ["Total Relocated", allocation.totalRelocated], ["Unassigned", allocation.totalUnassigned]]);
        break;
    }
  };

  return (
    <div>
      <PageHeader title="Reports & Analytics" subtitle="Generate, export and print reports across all modules." action={
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"><Printer className="w-3 h-3" /> Print</button>
          <button onClick={exportAll} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"><Download className="w-3 h-3" /> Full Report</button>
        </div>
      } />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {reports.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <FileBarChart className="w-5 h-5 text-blue-600" />
              <button onClick={() => exportReport(r.id)} className="text-[10px] px-2 py-0.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1"><Download className="w-3 h-3" /> CSV</button>
            </div>
            <div className="text-[13px] font-bold text-slate-800">{r.name}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{r.desc}</div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="Summary Snapshot" icon={<FileBarChart className="w-4 h-4 text-blue-600" />} />
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
            <Field label="Total Habitations" value={HABITATIONS.length.toString()} />
            <Field label="Total Red Zones" value={RED_ZONES.length.toString()} />
            <Field label="Red Zone Area" value={`${RED_ZONES.reduce((s, rz) => s + polygonAreaKm2(rz.coords), 0).toFixed(2)} km²`} />
            <Field label="Historical Events" value={histStats.totalEvents.toString()} />
            <Field label="Population at Risk" value={metrics.populationAtRisk.toLocaleString()} />
            <Field label="Immediate Relocation" value={metrics.immediateRelocation.toLocaleString()} />
            <Field label="Total Relocated" value={allocation.totalRelocated.toLocaleString()} />
            <Field label="Capacity Deficit" value={metrics.capacityDeficit.toLocaleString()} />
            <Field label="Safe Sites" value={RELOCATION_SITES.length.toString()} />
            <Field label="Total Safe Capacity" value={cc.totalSafeCapacity.toLocaleString()} />
            <Field label="Allocated" value={cc.allocatedPopulation.toLocaleString()} />
            <Field label="Unassigned" value={cc.unassignedPopulation.toLocaleString()} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return <div className="bg-slate-50 rounded p-2"><div className="text-[9px] text-slate-500 uppercase">{label}</div><div className="text-[13px] font-semibold text-slate-800">{value}</div></div>;
}
