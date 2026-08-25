import { SlidersHorizontal } from "lucide-react";
import { SCENARIO_PRESETS, type ScenarioParams, type ScenarioPreset } from "@/lib/simulation";

interface SliderRowProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint: string;
}

function SliderRow({ label, value, onChange, hint }: SliderRowProps) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">{label}</label>
        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded tabular-nums">{value}</span>
      </div>
      <input type="range" min={0} max={100} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
      <p className="text-[10px] text-slate-500 mt-1">{hint}</p>
    </div>
  );
}

export interface ScenarioPanelProps {
  scenario: ScenarioParams;
  setScenario: (s: ScenarioParams) => void;
  showAfter: boolean;
  setShowAfter: (v: boolean) => void;
  activePreset: string | null;
  applyPreset: (p: ScenarioPreset) => void;
}

export default function ScenarioPanel({ scenario, setScenario, showAfter, setShowAfter, activePreset, applyPreset }: ScenarioPanelProps) {
  const set = (patch: Partial<ScenarioParams>) => setScenario({ ...scenario, ...patch });
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="w-4 h-4 text-blue-600" />
        <h2 className="text-sm font-bold text-slate-800">Scenario Controls</h2>
      </div>
      <div className="mb-4">
        <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-2">Presets</div>
        <div className="grid grid-cols-2 gap-2">
          {SCENARIO_PRESETS.map((p) => (
            <button key={p.id} onClick={() => applyPreset(p)} className={`text-[11px] px-2 py-1.5 rounded border text-left transition-colors ${activePreset === p.id ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50"}`}>
              <div className="font-semibold">{p.name}</div>
              <div className={`text-[9px] leading-tight mt-0.5 ${activePreset === p.id ? "text-blue-100" : "text-slate-500"}`}>{p.description}</div>
            </button>
          ))}
        </div>
      </div>
      <SliderRow label="Rainfall Intensity" value={scenario.rainfallIntensity} onChange={(v) => set({ rainfallIntensity: v })} hint="Drives flood and cloudburst activation." />
      <SliderRow label="Hazard Severity" value={scenario.hazardSeverity} onChange={(v) => set({ hazardSeverity: v })} hint="Multiplies across all hazard types." />
      <SliderRow label="Shelter Capacity" value={scenario.shelterCapacity} onChange={(v) => set({ shelterCapacity: v })} hint="Effective capacity at shelters and sites." />
      <SliderRow label="Road Accessibility" value={scenario.roadAccessibility} onChange={(v) => set({ roadAccessibility: v })} hint="Affects relocation feasibility." />
      <label className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 cursor-pointer">
        <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">Before / After View</span>
        <button onClick={() => setShowAfter(!showAfter)} className={`relative w-10 h-5 rounded-full transition-colors ${showAfter ? "bg-blue-600" : "bg-slate-300"}`}>
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${showAfter ? "translate-x-5" : ""}`} />
        </button>
      </label>
      <p className="text-[10px] text-slate-500 mt-1">{showAfter ? "Showing projected state after relocation allocation." : "Showing current baseline risk state."}</p>
    </div>
  );
}
