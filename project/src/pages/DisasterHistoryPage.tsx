import { useState } from "react";
import { History, Filter, Download } from "lucide-react";
import { HISTORICAL_DISASTERS } from "@/data/gisData";
import { historicalStats } from "@/lib/simulation";
import { Card, CardHeader, CardBody, PageHeader, Select, downloadCsv } from "@/components/ui";

export default function DisasterHistoryPage() {
  const [yearFilter, setYearFilter] = useState("all");
  const [hazardFilter, setHazardFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [locationSearch, setLocationSearch] = useState("all");

  const stats = historicalStats();
  const years = [...new Set(HISTORICAL_DISASTERS.map((d) => d.year))].sort();
  const types = [...new Set(HISTORICAL_DISASTERS.map((d) => d.type))];
  const locations = [...new Set(HISTORICAL_DISASTERS.flatMap((d) => d.affectedHabitationIds))];

  const filtered = HISTORICAL_DISASTERS.filter((d) => {
    if (yearFilter !== "all" && d.year !== Number(yearFilter)) return false;
    if (hazardFilter !== "all" && d.type !== hazardFilter) return false;
    if (severityFilter !== "all" && d.severity !== Number(severityFilter)) return false;
    if (locationSearch !== "all" && !d.affectedHabitationIds.includes(locationSearch)) return false;
    return true;
  }).sort((a, b) => b.year - a.year);

  const exportCsv = () => {
    downloadCsv("disaster-history-report.csv", [
      ["Year", "Name", "Hazard", "Severity", "Affected Population", "Affected Habitations"],
      ...filtered.map((d) => [d.year, d.name, d.type, d.severity, d.affectedPopulation, d.affectedHabitationIds.join("; ")]),
    ]);
  };

  return (
    <div>
      <PageHeader title="Disaster History" subtitle="Historical events that contribute to current risk and priority scores." action={
        <button onClick={exportCsv} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"><Download className="w-3 h-3" /> Export CSV</button>
      } />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <Card className="p-3"><div className="text-xl font-bold text-slate-800">{stats.totalEvents}</div><div className="text-[10px] text-slate-600 uppercase">Total Events</div></Card>
        <Card className="p-3"><div className="text-xl font-bold text-slate-800">{types.length}</div><div className="text-[10px] text-slate-600 uppercase">Hazard Types</div></Card>
        <Card className="p-3"><div className="text-xl font-bold text-slate-800">{stats.avgSeverity}</div><div className="text-[10px] text-slate-600 uppercase">Avg Severity /5</div></Card>
        <Card className="p-3"><div className="text-xl font-bold text-slate-800">{HISTORICAL_DISASTERS.reduce((s, d) => s + d.affectedPopulation, 0).toLocaleString()}</div><div className="text-[10px] text-slate-600 uppercase">Total Affected</div></Card>
        <Card className="p-3"><div className="text-xl font-bold text-slate-800">{stats.historicalImpactScore}</div><div className="text-[10px] text-slate-600 uppercase">Impact Score</div></Card>
        <Card className="p-3"><div className="text-xl font-bold text-slate-800">{stats.mostAffectedHabitations.length}</div><div className="text-[10px] text-slate-600 uppercase">Most Affected</div></Card>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8">
          <Card>
            <CardHeader title="Historical Event Timeline" icon={<History className="w-4 h-4 text-blue-600" />} />
            <CardBody className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Select value={yearFilter} onChange={setYearFilter} options={[{ value: "all", label: "All years" }, ...years.map((y) => ({ value: String(y), label: String(y) }))]} />
                <Select value={hazardFilter} onChange={setHazardFilter} options={[{ value: "all", label: "All hazards" }, ...types.map((t) => ({ value: t, label: t }))]} />
                <Select value={severityFilter} onChange={setSeverityFilter} options={[{ value: "all", label: "All severity" }, { value: "5", label: "5 — Extreme" }, { value: "4", label: "4 — Severe" }, { value: "3", label: "3 — Moderate" }]} />
                <Select value={locationSearch} onChange={setLocationSearch} options={[{ value: "all", label: "All locations" }, ...locations.map((l) => ({ value: l, label: l }))]} />
              </div>
              <div className="overflow-x-auto max-h-[440px] overflow-y-auto border border-slate-100 rounded">
                <table className="w-full text-[11px]">
                  <thead className="bg-slate-50 text-slate-600 sticky top-0">
                    <tr>
                      <th className="text-left px-2 py-1.5 font-semibold">Year</th>
                      <th className="text-left px-2 py-1.5 font-semibold">Event</th>
                      <th className="text-left px-2 py-1.5 font-semibold">Hazard</th>
                      <th className="text-center px-2 py-1.5 font-semibold">Severity</th>
                      <th className="text-right px-2 py-1.5 font-semibold">Affected</th>
                      <th className="text-left px-2 py-1.5 font-semibold">Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((d) => (
                      <tr key={d.id} className="border-t border-slate-100">
                        <td className="px-2 py-1.5 font-semibold text-slate-800">{d.year}</td>
                        <td className="px-2 py-1.5 text-slate-800">{d.name}</td>
                        <td className="px-2 py-1.5"><span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">{d.type}</span></td>
                        <td className="px-2 py-1.5 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${d.severity >= 5 ? "bg-red-600 text-white" : d.severity >= 4 ? "bg-orange-500 text-white" : "bg-yellow-400 text-yellow-900"}`}>{d.severity}/5</span>
                        </td>
                        <td className="px-2 py-1.5 text-right tabular-nums">{d.affectedPopulation.toLocaleString()}</td>
                        <td className="px-2 py-1.5 text-slate-600">{d.affectedHabitationIds.length} habitations</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-4">
          <Card>
            <CardHeader title="Events by Hazard Type" icon={<Filter className="w-4 h-4 text-blue-600" />} />
            <CardBody className="space-y-2">
              {Object.entries(stats.byType).map(([type, count]) => {
                const max = Math.max(...Object.values(stats.byType));
                return (
                  <div key={type}>
                    <div className="flex justify-between text-[11px] text-slate-700 mb-0.5"><span>{type}</span><span className="font-semibold tabular-nums">{count}</span></div>
                    <div className="h-2 bg-slate-100 rounded"><div className="h-full bg-blue-500 rounded" style={{ width: `${(count / max) * 100}%` }} /></div>
                  </div>
                );
              })}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Events by Year" />
            <CardBody className="space-y-2">
              {stats.byYear.map((y) => {
                const max = Math.max(...stats.byYear.map((x) => x.count));
                return (
                  <div key={y.year}>
                    <div className="flex justify-between text-[11px] text-slate-700 mb-0.5"><span>{y.year}</span><span className="font-semibold tabular-nums">{y.count}</span></div>
                    <div className="h-2 bg-slate-100 rounded"><div className="h-full bg-orange-500 rounded" style={{ width: `${(y.count / max) * 100}%` }} /></div>
                  </div>
                );
              })}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Most Affected Habitations" />
            <CardBody className="space-y-1">
              {stats.mostAffectedHabitations.map((h) => (
                <div key={h.id} className="flex justify-between text-[11px] text-slate-700 py-1 border-b border-slate-50">
                  <span>{h.name}</span><span className="font-semibold tabular-nums">{h.events} events</span>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
