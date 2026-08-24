import { useMemo } from 'react';
import type { SimResults } from '@/sim/types';
import { colorForLevel } from '@/sim/types';
import { ZONES, SHELTERS } from '@/sim/regions';

interface ZoneMapProps {
  results: SimResults;
  beforeResults?: SimResults;
  showBefore?: boolean;
}

const W = 100;
const H = 100;

export function ZoneMap({ results, beforeResults, showBefore }: ZoneMapProps) {
  const zoneMap = useMemo(() => new Map(results.zones.map((z) => [z.id, z])), [results]);
  const beforeMap = useMemo(
    () => new Map(beforeResults?.zones.map((z) => [z.id, z]) ?? []),
    [beforeResults],
  );

  // Draw evacuation flow lines from red zones to shelters they're allocated to.
  const flows = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; people: number; key: string }[] = [];
    for (const shelter of results.shelters) {
      const sShelter = SHELTERS.find((s) => s.id === shelter.id);
      if (!sShelter) continue;
      for (const inc of shelter.incomingFrom) {
        const zone = ZONES.find((z) => z.id === inc.zoneId);
        if (!zone) continue;
        lines.push({ x1: zone.x, y1: zone.y, x2: sShelter.x, y2: sShelter.y, people: inc.people, key: `${inc.zoneId}-${shelter.id}` });
      }
    }
    return lines;
  }, [results]);

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-xl" style={{ aspectRatio: `${W}/${H}` }}>
        <defs>
          <radialGradient id="bg-grad" cx="50%" cy="40%" r="75%">
            <stop offset="0%" stopColor="#0f1729" />
            <stop offset="100%" stopColor="#070b14" />
          </radialGradient>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#131c33" strokeWidth="0.3" />
          </pattern>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="0" y="0" width={W} height={H} fill="url(#bg-grad)" />
        <rect x="0" y="0" width={W} height={H} fill="url(#grid)" />

        {/* River / waterway decorative */}
        <path d="M 12 22 Q 28 34, 34 42 T 52 56 Q 64 66, 72 74 T 88 88" fill="none" stroke="#1c2842" strokeWidth="2.5" opacity="0.6" strokeLinecap="round" />
        <path d="M 12 22 Q 28 34, 34 42 T 52 56 Q 64 66, 72 74 T 88 88" fill="none" stroke="#38507f" strokeWidth="0.6" opacity="0.5" strokeLinecap="round" />

        {/* Evacuation flows */}
        {(() => {
          const maxPeople = Math.max(...flows.map((x) => x.people), 1);
          return flows.map((f) => {
          const opacity = 0.15 + (f.people / maxPeople) * 0.5;
          const width = 0.3 + (f.people / maxPeople) * 1.2;
          return (
            <line
              key={f.key}
              x1={f.x1}
              y1={f.y1}
              x2={f.x2}
              y2={f.y2}
              stroke="#38507f"
              strokeWidth={width}
              opacity={opacity}
              strokeDasharray="1.5 1.5"
            >
              <animate attributeName="stroke-dashoffset" from="0" to="-6" dur="1.2s" repeatCount="indefinite" />
            </line>
          );
          });
        })()}

        {/* Zone markers */}
        {ZONES.map((zone) => {
          const zr = zoneMap.get(zone.id);
          const zrBefore = beforeMap.get(zone.id);
          const color = zr ? colorForLevel(zr.riskLevel) : '#38507f';
          const isRed = zr?.redZone;
          const r = 2.6 + Math.sqrt(zone.population) / 28;
          const beforeColor = showBefore && zrBefore ? colorForLevel(zrBefore.riskLevel) : null;

          return (
            <g key={zone.id} filter={isRed ? 'url(#glow)' : undefined}>
              {/* before-state ghost ring */}
              {beforeColor && beforeColor !== color && (
                <circle cx={zone.x} cy={zone.y} r={r + 1.4} fill="none" stroke={beforeColor} strokeWidth="0.6" strokeDasharray="1 1" opacity="0.7" />
              )}
              {isRed && <circle cx={zone.x} cy={zone.y} r={r + 1.2} fill="none" stroke={color} strokeWidth="0.5" opacity="0.5">
                <animate attributeName="r" values={`${r + 0.8};${r + 2.6};${r + 0.8}`} dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
              </circle>}
              <circle cx={zone.x} cy={zone.y} r={r} fill={color} opacity={0.85} stroke="#070b14" strokeWidth="0.4" />
              <text x={zone.x} y={zone.y + r + 2.2} textAnchor="middle" fontSize="1.8" fill="#94a3b8" className="font-mono">
                {zone.id}
              </text>
            </g>
          );
        })}

        {/* Shelter markers */}
        {SHELTERS.map((s) => {
          const sr = results.shelters.find((x) => x.id === s.id);
          const util = sr?.utilization ?? 0;
          const full = util >= 95;
          return (
            <g key={s.id}>
              <rect x={s.x - 1.8} y={s.y - 1.8} width="3.6" height="3.6" rx="0.6" fill="#0b1220" stroke={full ? '#f97316' : '#e2e8f0'} strokeWidth="0.5" />
              <rect x={s.x - 1.8} y={s.y - 1.8} width="3.6" height="3.6" rx="0.6" fill="none" stroke={full ? '#f97316' : '#38507f'} strokeWidth="0.3" opacity="0.6" />
              <text x={s.x} y={s.y + 0.7} textAnchor="middle" fontSize="1.7" fill="#e2e8f0" className="font-mono">
                {s.id}
              </text>
              <text x={s.x} y={s.y + 3.6} textAnchor="middle" fontSize="1.6" fill="#64748b" className="font-mono">
                {sr?.allocated ?? 0}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-400">
        {(['safe', 'low', 'moderate', 'high', 'severe', 'extreme'] as const).map((lvl) => (
          <div key={lvl} className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: colorForLevel(lvl) }} />
            <span className="capitalize">{lvl}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm border border-slate-200 bg-ink-900" />
          <span>Shelter</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-px border-t border-dashed border-ink-500" />
          <span>Evacuation flow</span>
        </div>
      </div>
    </div>
  );
}
