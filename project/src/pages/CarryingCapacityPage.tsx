import { Gauge, Download } from "lucide-react";
import { useScenario } from "@/context/ScenarioContext";
import { carryingCapacity } from "@/lib/simulation";
import { Card, CardHeader, CardBody, PageHeader, downloadCsv } from "@/components/ui";
import { capacityStatusClass } from "@/data/gisData";

export default function CarryingCapacityPage() {
  const { scenario } = useScenario();
  const cc = carryingCapacity(scenario);

  const exportCsv = () => {
    downloadCsv("carrying-capacity-report.csv", [
      ["Site", "Capacity", "Existing", "Available", "Allocated", "Remaining", "Water", "Healthcare", "Housing", "Electricity", "Sanitation", "Emergency", "Status"],
      ...cc.sites.map((s) => [s.site.name, s.capacity, s.existingPopulation, s.availableCapacity, s.allocated, s.remaining, s.waterCapacity, s.healthcareCapacity, s.housingCapacity, s.electricity, s.sanitation, s.emergencyServices, s.status]),
    ]);
  };

  const summaryCards = [
    { label: "Total Safe Capacity", value: cc.totalSafeCapacity, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
    { label: "Existing Population", value: cc.existingPopulation, color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200" },
    { label: "Available Capacity", value: cc.availableCapacity, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    { label: "Requiring Relocation", value: cc.populationRequiringRelocation, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
    { label: "Allocated", value: cc.allocatedPopulation, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
    { label: "Unassigned", value: cc.unassignedPopulation, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
    { label: "Capacity Deficit", value: cc.capacityDeficit, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
    { label: "Overall Status", value: cc.overallStatus, color: "text-slate-800", bg: "bg-slate-50", border: "border-slate-200" },
  ];

  return (
    <div>
      <PageHeader title="Carrying Capacity" subtitle="Centralized capacity accounting — allocations never exceed available capacity." action={
        <button onClick={exportCsv} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"><Download className="w-3 h-3" /> Export CSV</button>
      } />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {summaryCards.map((c) => (
          <div key={c.label} className={`rounded-lg border ${c.border} ${c.bg} p-3`}>
            <div className={`text-lg font-bold ${c.color} tabular-nums`}>{typeof c.value === "number" ? c.value.toLocaleString() : c.value}</div>
            <div className="text-[10px] text-slate-600 uppercase tracking-wide mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader title="Site Carrying Capacity" icon={<Gauge className="w-4 h-4 text-blue-600" />} />
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-2 py-2 font-semibold">Site</th>
                <th className="text-right px-2 py-2 font-semibold">Capacity</th>
                <th className="text-right px-2 py-2 font-semibold">Existing</th>
                <th className="text-right px-2 py-2 font-semibold">Available</th>
                <th className="text-right px-2 py-2 font-semibold">Allocated</th>
                <th className="text-right px-2 py-2 font-semibold">Remaining</th>
                <th className="text-center px-2 py-2 font-semibold">Water</th>
                <th className="text-center px-2 py-2 font-semibold">Health</th>
                <th className="text-center px-2 py-2 font-semibold">Housing</th>
                <th className="text-center px-2 py-2 font-semibold">Elec.</th>
                <th className="text-center px-2 py-2 font-semibold">Sanit.</th>
                <th className="text-center px-2 py-2 font-semibold">Emerg.</th>
                <th className="text-left px-2 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {cc.sites.map((s) => (
                <tr key={s.site.id} className="border-t border-slate-100">
                  <td className="px-2 py-2 text-slate-800 font-medium">{s.site.name}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{s.capacity.toLocaleString()}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{s.existingPopulation.toLocaleString()}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{s.availableCapacity.toLocaleString()}</td>
                  <td className="px-2 py-2 text-right tabular-nums font-semibold text-blue-700">{s.allocated.toLocaleString()}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{s.remaining.toLocaleString()}</td>
                  <td className="px-2 py-2 text-center tabular-nums">{s.waterCapacity}</td>
                  <td className="px-2 py-2 text-center tabular-nums">{s.healthcareCapacity}</td>
                  <td className="px-2 py-2 text-center tabular-nums">{s.housingCapacity}</td>
                  <td className="px-2 py-2 text-center tabular-nums">{s.electricity}</td>
                  <td className="px-2 py-2 text-center tabular-nums">{s.sanitation}</td>
                  <td className="px-2 py-2 text-center tabular-nums">{s.emergencyServices}</td>
                  <td className="px-2 py-2"><span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${capacityStatusClass(s.status)}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-4">
        <CardHeader title="Capacity Formula" />
        <CardBody>
          <div className="text-[11px] text-slate-600 space-y-1 font-mono">
            <div>availableCapacity = totalCapacity − existingPopulation</div>
            <div>allocatedPopulation ≤ availableCapacity  (enforced by allocation engine)</div>
            <div>unassignedPopulation = populationRequiringRelocation − allocatedPopulation</div>
            <div>capacityDeficit = max(0, populationRequiringRelocation − totalSafeCapacity)</div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
