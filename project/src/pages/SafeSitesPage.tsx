import { useState } from "react";
import { MapPin, X, Download } from "lucide-react";
import { RELOCATION_SITES, siteSuitability, siteAvailableCapacity, recommendedPopulation, riskBarColor } from "@/data/gisData";
import { Card, CardHeader, CardBody, PageHeader, downloadCsv } from "@/components/ui";

export default function SafeSitesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const ranked = RELOCATION_SITES.map((s) => ({
    site: s, suitability: siteSuitability(s), available: siteAvailableCapacity(s), recPop: recommendedPopulation(s),
  })).sort((a, b) => b.suitability - a.suitability);

  const selected = selectedId ? ranked.find((r) => r.site.id === selectedId) : null;

  const exportCsv = () => {
    downloadCsv("safe-sites-report.csv", [
      ["Rank", "Name", "Total Capacity", "Existing", "Available", "Hazard Safety", "Road Access", "Healthcare", "Water", "Electricity", "Sanitation", "Emergency", "Infrastructure", "Distance (km)", "Suitability"],
      ...ranked.map((r, i) => [i + 1, r.site.name, r.site.totalCapacity, r.site.existingPopulation, r.available, r.site.hazardSafety, r.site.roadAccess, r.site.healthcareAccess, r.site.waterAvailability, r.site.electricity, r.site.sanitation, r.site.emergencyServices, r.site.infrastructure, r.site.distanceKm, r.suitability]),
    ]);
  };

  return (
    <div>
      <PageHeader title="Safe Relocation Sites" subtitle="Ranked candidate sites for long-term relocation (distinct from emergency shelters)." action={
        <button onClick={exportCsv} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"><Download className="w-3 h-3" /> Export CSV</button>
      } />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-7">
          <Card>
            <CardHeader title="Ranked Safe Sites" icon={<MapPin className="w-4 h-4 text-blue-600" />} />
            <CardBody className="space-y-2">
              {ranked.map((r, i) => (
                <div key={r.site.id} onClick={() => setSelectedId(r.site.id)} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedId === r.site.id ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"}`}>
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[12px] font-bold shrink-0">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-slate-800 truncate">{r.site.name}</div>
                    <div className="text-[10px] text-slate-500">{r.available.toLocaleString()} available • {r.site.distanceKm} km</div>
                    <div className="h-1.5 bg-slate-100 rounded mt-1 overflow-hidden"><div className="h-full bg-blue-500 rounded" style={{ width: `${r.suitability}%` }} /></div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-blue-700 tabular-nums">{r.suitability}</div>
                    <div className="text-[9px] text-slate-500 uppercase">/100</div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-5">
          {!selected ? (
            <Card><CardBody><div className="text-center text-[12px] text-slate-400 py-12">Select a site to view its detailed profile.</div></CardBody></Card>
          ) : (
            <Card>
              <CardHeader title={selected.site.name} icon={<MapPin className="w-4 h-4 text-blue-600" />} action={
                <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
              } />
              <CardBody className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold border bg-blue-100 text-blue-700 border-blue-300">Suitability {selected.suitability}/100</span>
                  <span className="text-[11px] text-slate-500">{selected.site.distanceKm} km from population center</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <Field label="Total Capacity" value={selected.site.totalCapacity.toLocaleString()} />
                  <Field label="Existing Population" value={selected.site.existingPopulation.toLocaleString()} />
                  <Field label="Available Capacity" value={selected.available.toLocaleString()} />
                  <Field label="Recommended Pop." value={selected.recPop.toLocaleString()} />
                </div>

                <div className="space-y-2">
                  <ScoreBar label="Hazard Safety" value={selected.site.hazardSafety} />
                  <ScoreBar label="Road Accessibility" value={selected.site.roadAccess} />
                  <ScoreBar label="Healthcare Access" value={selected.site.healthcareAccess} />
                  <ScoreBar label="Water Availability" value={selected.site.waterAvailability} />
                  <ScoreBar label="Electricity" value={selected.site.electricity} />
                  <ScoreBar label="Sanitation" value={selected.site.sanitation} />
                  <ScoreBar label="Emergency Services" value={selected.site.emergencyServices} />
                  <ScoreBar label="Infrastructure" value={selected.site.infrastructure} />
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return <div className="bg-slate-50 rounded p-2"><div className="text-[9px] text-slate-500 uppercase">{label}</div><div className="text-[12px] font-semibold text-slate-800">{value}</div></div>;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] text-slate-700 mb-0.5"><span>{label}</span><span className="font-semibold tabular-nums">{value}/100</span></div>
      <div className="h-2 bg-slate-100 rounded overflow-hidden"><div className={`h-full ${riskBarColor(value)}`} style={{ width: `${value}%` }} /></div>
    </div>
  );
}
