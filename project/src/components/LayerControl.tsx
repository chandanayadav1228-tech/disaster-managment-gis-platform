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
      </div>
    </div>
  );
}
