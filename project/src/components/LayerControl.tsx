import { Layers } from "lucide-react";

export interface LayerState {
  redZones: boolean;
  flood: boolean;
  landslide: boolean;
  cloudburst: boolean;
  coastal: boolean;
  historical: boolean;
  habitations: boolean;
  vulnerable: boolean;
  relocation: boolean;
  shelters: boolean;
  hospitals: boolean;
  roads: boolean;
  rivers: boolean;
  infrastructure: boolean;
}

export const DEFAULT_LAYERS: LayerState = {
  redZones: true,
  flood: true,
  landslide: true,
  cloudburst: true,
  coastal: true,
  historical: true,
  habitations: true,
  vulnerable: false,
  relocation: true,
  shelters: true,
  hospitals: true,
  roads: true,
  rivers: true,
  infrastructure: true,
};

const LAYER_META: { key: keyof LayerState; label: string; color: string }[] = [
  { key: "redZones", label: "Red Zones", color: "#dc2626" },
  { key: "flood", label: "Flood Risk", color: "#2563eb" },
  { key: "landslide", label: "Landslide Risk", color: "#ea580c" },
  { key: "cloudburst", label: "Cloudburst Risk", color: "#7c3aed" },
  { key: "coastal", label: "Coastal Erosion", color: "#0891b2" },
  { key: "historical", label: "Historical Disasters", color: "#b91c1c" },
  { key: "habitations", label: "Habitations", color: "#16a34a" },
  { key: "vulnerable", label: "Vulnerable Habitations", color: "#f43f5e" },
  { key: "relocation", label: "Safe Relocation Sites", color: "#2563eb" },
  { key: "shelters", label: "Shelters", color: "#475569" },
  { key: "hospitals", label: "Hospitals", color: "#0d9488" },
  { key: "roads", label: "Roads", color: "#3b82f6" },
  { key: "rivers", label: "Rivers", color: "#0ea5e9" },
  { key: "infrastructure", label: "Infrastructure", color: "#7c3aed" },
];

export interface LayerControlProps {
  layers: LayerState;
  toggle: (key: keyof LayerState) => void;
  setAll: (v: boolean) => void;
}

export default function LayerControl({ layers, toggle, setAll }: LayerControlProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-800">GIS Layers</h2>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setAll(true)} className="text-[10px] px-2 py-0.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50">All</button>
          <button onClick={() => setAll(false)} className="text-[10px] px-2 py-0.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50">None</button>
        </div>
      </div>
      <div className="space-y-1.5">
        {LAYER_META.map((l) => (
          <label key={l.key} className="flex items-center gap-2 cursor-pointer text-[12px] text-slate-700 hover:bg-slate-50 px-1.5 py-1 rounded">
            <input type="checkbox" checked={layers[l.key]} onChange={() => toggle(l.key)} className="w-3.5 h-3.5 accent-blue-600" />
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
            <span>{l.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
