import { X, Users, Baby, Accessibility, HeartPulse, Shield, Building2, Waves, AlertTriangle } from 'lucide-react';
import type { HabitationRisk } from '@/lib/types';
import { RISK_COLORS, RISK_BG_COLORS, HAZARD_LABELS, formatDistance, formatScore } from '@/lib/constants';

interface DetailPanelProps {
  habitation: HabitationRisk | null;
  onClose: () => void;
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        <span className="text-xs font-semibold text-slate-200">{formatScore(value)}/100</span>
      </div>
      <div className="h-2 rounded-full bg-slate-700/50 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function DetailPanel({ habitation, onClose }: DetailPanelProps) {
  if (!habitation) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-700/30 flex items-center justify-center mb-4">
          <MapPinIcon />
        </div>
        <p className="text-sm text-slate-400 max-w-[200px]">
          Click a habitation marker on the map to view its detailed risk and vulnerability assessment.
        </p>
      </div>
    );
  }

  const riskColor = RISK_COLORS[habitation.risk_category];
  const riskBg = RISK_BG_COLORS[habitation.risk_category];
  const vulnerableTotal = habitation.children + habitation.elderly + habitation.disabled;
  const vulnerablePct = ((vulnerableTotal / habitation.population) * 100).toFixed(1);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div
        className="px-5 py-4 border-b border-slate-700/50"
        style={{ background: riskBg }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{habitation.name}</h2>
            <p className="text-sm text-slate-600">{habitation.district} District</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-slate-900/10 transition-colors"
            aria-label="Close panel"
          >
            <X className="w-5 h-5 text-slate-700" />
          </button>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <span
            className="px-3 py-1 rounded-full text-xs font-bold text-white"
            style={{ background: riskColor }}
          >
            {habitation.risk_category} RISK
          </span>
          <span className="text-sm font-bold text-slate-700">
            Score: {formatScore(habitation.risk_score)}/100
          </span>
          {habitation.red_zone && (
            <span className="px-2 py-1 rounded-full text-xs font-bold text-white bg-red-600 animate-pulse">
              RED ZONE
            </span>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Risk Score Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Risk Score Breakdown
          </h3>
          <ScoreBar label="Exposure (hazards nearby)" value={Number(habitation.exposure_score)} color="#dc2626" />
          <ScoreBar label="Vulnerability (demographics)" value={Number(habitation.vulnerability_score)} color="#ea580c" />
          <ScoreBar label="Response Gap (distance to facilities)" value={Number(habitation.response_score)} color="#ca8a04" />
        </div>

        {/* Population & Vulnerability */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Population &amp; Vulnerability
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-700/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400">Total Population</span>
              </div>
              <p className="text-xl font-bold text-slate-100">{habitation.population.toLocaleString()}</p>
            </div>
            <div className="bg-red-900/20 rounded-lg p-3 border border-red-800/30">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-400">Vulnerable Groups</span>
              </div>
              <p className="text-xl font-bold text-red-300">
                {vulnerableTotal.toLocaleString()} ({vulnerablePct}%)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-700/20 rounded-lg p-3 text-center">
              <Baby className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-slate-200">{habitation.children}</p>
              <p className="text-[10px] text-slate-500">Children</p>
            </div>
            <div className="bg-slate-700/20 rounded-lg p-3 text-center">
              <Accessibility className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-slate-200">{habitation.elderly}</p>
              <p className="text-[10px] text-slate-500">Elderly</p>
            </div>
            <div className="bg-slate-700/20 rounded-lg p-3 text-center">
              <HeartPulse className="w-4 h-4 text-rose-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-slate-200">{habitation.disabled}</p>
              <p className="text-[10px] text-slate-500">Disabled</p>
            </div>
          </div>
        </div>

        {/* Affected Hazards */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Affected Hazards
          </h3>
          {habitation.affected_hazards.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {habitation.affected_hazards.map((hazard) => (
                <span
                  key={hazard}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
                  style={{
                    background: hazard === 'flood' ? '#1e3a5f' : hazard === 'landslide' ? '#4a2c10' : hazard === 'earthquake' ? '#3a1a0a' : '#0a3a3a',
                    color: hazard === 'flood' ? '#60a5fa' : hazard === 'landslide' ? '#fbbf24' : hazard === 'earthquake' ? '#f97316' : '#22d3ee',
                  }}
                >
                  <Waves className="w-3 h-3" />
                  {HAZARD_LABELS[hazard]}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No hazards identified within 5km</p>
          )}
        </div>

        {/* Response Facilities */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Nearest Response Facilities
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-slate-700/20 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-900/30 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-red-400" />
                </div>
                <span className="text-sm text-slate-200">Nearest Hospital</span>
              </div>
              <span className="text-sm font-semibold text-slate-300">
                {formatDistance(habitation.nearest_hospital_m)}
              </span>
            </div>
            <div className="flex items-center justify-between bg-slate-700/20 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm text-slate-200">Nearest Shelter</span>
              </div>
              <span className="text-sm font-semibold text-slate-300">
                {formatDistance(habitation.nearest_shelter_m)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MapPinIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#64748b"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
