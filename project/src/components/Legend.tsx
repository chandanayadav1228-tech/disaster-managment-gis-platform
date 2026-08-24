import { RISK_COLORS, HAZARD_COLORS, HAZARD_FILL_COLORS } from '@/lib/constants';
import type { HazardType } from '@/lib/types';

const HAZARD_TYPES: HazardType[] = ['flood', 'landslide', 'earthquake', 'cyclone'];

export default function Legend() {
  return (
    <div className="bg-slate-800/95 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-200">Legend</h3>
      </div>
      <div className="p-4 space-y-4">
        {/* Risk levels */}
        <div>
          <p className="text-xs font-medium text-slate-400 mb-2">Habitation Risk Level</p>
          <div className="space-y-1.5">
            {(Object.keys(RISK_COLORS) as (keyof typeof RISK_COLORS)[]).map((category) => (
              <div key={category} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full border border-white/50"
                  style={{ background: RISK_COLORS[category] }}
                />
                <span className="text-xs text-slate-300">{category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Red zone */}
        <div>
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-3 rounded border-2 border-red-600"
              style={{ borderStyle: 'dashed' }}
            />
            <span className="text-xs text-slate-300">Red Zone (evacuation priority)</span>
          </div>
        </div>

        {/* Hazard zones */}
        <div>
          <p className="text-xs font-medium text-slate-400 mb-2">Hazard Zones</p>
          <div className="space-y-1.5">
            {HAZARD_TYPES.map((type) => (
              <div key={type} className="flex items-center gap-2">
                <div
                  className="w-4 h-3 rounded border"
                  style={{
                    background: HAZARD_FILL_COLORS[type] + '40',
                    borderColor: HAZARD_COLORS[type],
                  }}
                />
                <span className="text-xs text-slate-300 capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Facilities */}
        <div>
          <p className="text-xs font-medium text-slate-400 mb-2">Facilities</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-red-600 border-2 border-white" />
              <span className="text-xs text-slate-300">Hospital</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white" />
              <span className="text-xs text-slate-300">Shelter</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-green-600 border-2 border-white" />
              <span className="text-xs text-slate-300">Relocation Site</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
