import { CloudRain, AlertTriangle, Building2, Route, RotateCcw } from 'lucide-react';
import type { SimParams } from '@/sim/types';
import { DEFAULT_PARAMS } from '@/sim/regions';

interface ParamControlsProps {
  params: SimParams;
  onChange: (params: SimParams) => void;
  onReset: () => void;
}

interface SliderConfig {
  key: keyof SimParams;
  label: string;
  icon: typeof CloudRain;
  hint: string;
  color: string;
  unit?: string;
}

const SLIDERS: SliderConfig[] = [
  { key: 'rainfall', label: 'Rainfall Intensity', icon: CloudRain, hint: 'Simulated precipitation volume over the region', color: '#38507f', unit: 'mm' },
  { key: 'hazardSeverity', label: 'Hazard Severity', icon: AlertTriangle, hint: 'Multiplier applied to each zone base susceptibility', color: '#f97316' },
  { key: 'availableCapacityPct', label: 'Available Shelter Capacity', icon: Building2, hint: 'Percentage of shelter beds currently operational', color: '#10b981', unit: '%' },
  { key: 'accessibilityPct', label: 'Road Accessibility', icon: Route, hint: 'Usable road & access network for evacuation', color: '#84cc16', unit: '%' },
];

export function ParamControls({ params, onChange, onReset }: ParamControlsProps) {
  const update = (key: keyof SimParams, value: number) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-850/80 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">Simulation Parameters</h3>
          <p className="text-xs text-slate-500 mt-0.5">Adjust conditions to model hypothetical scenarios</p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100 px-2.5 py-1.5 rounded-lg border border-ink-700 hover:border-ink-500 transition-colors"
        >
          <RotateCcw size={13} />
          Reset
        </button>
      </div>

      <div className="space-y-5">
        {SLIDERS.map((s) => {
          const Icon = s.icon;
          const value = params[s.key];
          const progress = `${value}%`;
          return (
            <div key={s.key}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon size={15} style={{ color: s.color }} />
                  <label className="text-sm text-slate-200 font-medium">{s.label}</label>
                </div>
                <span className="text-sm font-mono font-semibold text-slate-100 tabular-nums">
                  {value}
                  <span className="text-slate-500 text-xs ml-0.5">{s.unit}</span>
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={value}
                onChange={(e) => update(s.key, Number(e.target.value))}
                className="w-full"
                style={{ ['--range-progress' as string]: progress }}
              />
              <p className="text-[11px] text-slate-500 mt-1">{s.hint}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-ink-700">
        <div className="grid grid-cols-2 gap-2">
          <PresetButton label="Drizzle" params={{ ...DEFAULT_PARAMS, rainfall: 20, hazardSeverity: 30 }} current={params} onClick={onChange} />
          <PresetButton label="Monsoon" params={{ ...DEFAULT_PARAMS, rainfall: 70, hazardSeverity: 60 }} current={params} onClick={onChange} />
          <PresetButton label="Cyclone" params={{ ...DEFAULT_PARAMS, rainfall: 92, hazardSeverity: 85, accessibilityPct: 45 }} current={params} onClick={onChange} />
          <PresetButton label="Post-disaster" params={{ ...DEFAULT_PARAMS, rainfall: 55, hazardSeverity: 70, availableCapacityPct: 35, accessibilityPct: 40 }} current={params} onClick={onChange} />
        </div>
      </div>
    </div>
  );
}

function PresetButton({
  label,
  params,
  current,
  onClick,
}: {
  label: string;
  params: SimParams;
  current: SimParams;
  onClick: (p: SimParams) => void;
}) {
  const active =
    current.rainfall === params.rainfall &&
    current.hazardSeverity === params.hazardSeverity &&
    current.availableCapacityPct === params.availableCapacityPct &&
    current.accessibilityPct === params.accessibilityPct;
  return (
    <button
      onClick={() => onClick(params)}
      className={`text-xs py-2 px-3 rounded-lg border transition-all ${
        active
          ? 'bg-ink-500/30 border-ink-500 text-slate-100'
          : 'bg-ink-900/50 border-ink-700 text-slate-400 hover:border-ink-600 hover:text-slate-200'
      }`}
    >
      {label}
    </button>
  );
}
