import { useState } from "react";
import { Search, Map as MapIcon, Filter } from "lucide-react";
import { useScenario } from "@/context/ScenarioContext";
import { HABITATIONS, habitationById } from "@/data/gisData";
import GisMap from "@/components/GisMap";
import LayerControl, { DEFAULT_LAYERS, type LayerState } from "@/components/LayerControl";
import { Card, CardHeader, PageHeader, RiskBadge, PriorityBadge } from "@/components/ui";
import { effectiveRisk, priorityTier } from "@/lib/simulation";

export default function GisMapPage() {
  const { scenario } = useScenario();
  const [layers, setLayers] = useState<LayerState>(DEFAULT_LAYERS);
  const [search, setSearch] = useState("");
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);

  const toggle = (key: keyof LayerState) => setLayers((p) => ({ ...p, [key]: !p[key] }));
  const setAll = (v: boolean) => setLayers({
    redZones: v, flood: v, landslide: v, cloudburst: v, coastal: v, historical: v,
    habitations: v, vulnerable: v, relocation: v, shelters: v, hospitals: v, roads: v, rivers: v, infrastructure: v,
  });

  const results = search
    ? HABITATIONS.filter((h) => h.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  const legend = [
    { label: "Severe", color: "bg-red-500" },
    { label: "High", color: "bg-orange-500" },
    { label: "Moderate", color: "bg-yellow-400" },
    { label: "Safe", color: "bg-green-500" },
  ];

  return (
    <div>
      <PageHeader title="GIS Risk Map" subtitle="Interactive hazard, infrastructure and population overlay." />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <Card>
            <CardHeader title="Search Location" icon={<Search className="w-4 h-4 text-blue-600" />} />
            <div className="p-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search habitations…"
                className="text-[12px] px-3 py-1.5 border border-slate-200 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              {results.length > 0 && (
                <div className="mt-2 border border-slate-100 rounded max-h-48 overflow-y-auto">
                  {results.map((h) => {
                    const risk = effectiveRisk(h, scenario);
                    return (
                      <button
                        key={h.id}
                        onClick={() => { setFlyTo([h.lat, h.lng]); }}
                        className="w-full text-left px-2 py-1.5 hover:bg-slate-50 border-b border-slate-50 flex items-center justify-between"
                      >
                        <span className="text-[12px] text-slate-800">{h.name}</span>
                        <RiskBadge score={risk} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

          <LayerControl layers={layers} toggle={toggle} setAll={setAll} />

          <Card>
            <CardHeader title="Legend" icon={<Filter className="w-4 h-4 text-blue-600" />} />
            <div className="p-3 space-y-1.5">
              {legend.map((l) => (
                <div key={l.label} className="flex items-center gap-2 text-[11px] text-slate-700">
                  <span className={`w-3 h-3 rounded-full ${l.color}`} /> {l.label}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-9">
          <Card className="overflow-hidden">
            <div className="h-[680px]">
              <GisMap scenario={scenario} layers={layers} flyTo={flyTo} height="680px" />
            </div>
          </Card>
          <p className="text-[10px] text-slate-400 mt-2 px-1">Base map: OpenStreetMap. Click markers for detailed popups. Use the layer toggle (top-right on map) or the panel (left) to toggle layers.</p>
        </div>
      </div>
    </div>
  );
}
