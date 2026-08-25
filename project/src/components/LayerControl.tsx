<<<<<<< HEAD
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
=======
import { Layers, MapPin, Triangle, Route, Building2, Shield, ArrowUpCircle, AlertCircle } from 'lucide-react';

export interface LayerVisibility {
  habitations: boolean;
  hazardZones: boolean;
  redZones: boolean;
  roads: boolean;
  hospitals: boolean;
  shelters: boolean;
  relocationSites: boolean;
}

interface LayerControlProps {
  visibility: LayerVisibility;
  onToggle: (key: keyof LayerVisibility) => void;
}

const LAYERS: { key: keyof LayerVisibility; label: string; icon: typeof MapPin; color: string }[] = [
  { key: 'habitations', label: 'Habitations', icon: MapPin, color: 'text-slate-300' },
  { key: 'hazardZones', label: 'Hazard Zones', icon: Triangle, color: 'text-orange-400' },
  { key: 'redZones', label: 'Red Zones', icon: AlertCircle, color: 'text-red-400' },
  { key: 'roads', label: 'Roads', icon: Route, color: 'text-slate-400' },
  { key: 'hospitals', label: 'Hospitals', icon: Building2, color: 'text-red-300' },
  { key: 'shelters', label: 'Shelters', icon: Shield, color: 'text-blue-300' },
  { key: 'relocationSites', label: 'Relocation Sites', icon: ArrowUpCircle, color: 'text-green-300' },
];

export default function LayerControl({ visibility, onToggle }: LayerControlProps) {
  return (
    <div className="bg-slate-800/95 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-2">
        <Layers className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-200">Map Layers</h3>
      </div>
      <div className="p-2 space-y-0.5">
        {LAYERS.map((layer) => {
          const Icon = layer.icon;
          const active = visibility[layer.key];
          return (
            <button
              key={layer.key}
              onClick={() => onToggle(layer.key)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                active
                  ? 'bg-slate-700/40 hover:bg-slate-700/60'
                  : 'hover:bg-slate-700/20 opacity-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? layer.color : 'text-slate-500'}`} />
              <span className={`text-sm ${active ? 'text-slate-200' : 'text-slate-500'}`}>
                {layer.label}
              </span>
              <div
                className={`ml-auto w-9 h-5 rounded-full transition-colors ${
                  active ? 'bg-emerald-600' : 'bg-slate-600'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white mt-0.5 transition-transform ${
                    active ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </div>
            </button>
          );
        })}
>>>>>>> c371220be1b8f4e7f0eb130df9a55ecbfb279c8f
      </div>
    </div>
  );
}
