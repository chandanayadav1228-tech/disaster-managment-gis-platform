import type { Zone, Shelter, SimParams, SimResults, ZoneResult, ShelterResult, RiskLevel } from './types';
import { riskLevelFromScore } from './types';
import { ZONES, SHELTERS } from './regions';

const RED_ZONE_THRESHOLD = 65;

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

export function computeRiskScore(zone: Zone, params: SimParams): number {
  // Base hazard weighted by rainfall intensity and overall hazard severity multiplier.
  const rainfallFactor = 0.55 + (params.rainfall / 100) * 0.9; // 0.55x .. 1.45x
  const severityFactor = 0.5 + (params.hazardSeverity / 100) * 1.0; // 0.5x .. 1.5x
  let score = zone.baseHazard * rainfallFactor * severityFactor;

  // Lower elevation zones are more vulnerable to flooding.
  const elevFactor = clamp(1.25 - zone.elevation / 1000, 0.7, 1.3);
  score *= elevFactor;

  // Poor accessibility hampers evacuation, slightly raising effective risk.
  const accessFactor = 1 + (100 - params.accessibilityPct) / 400; // 1.0 .. 1.25
  score *= accessFactor;

  return clamp(Math.round(score));
}

function evacNeeded(zone: Zone, riskScore: number, accessibilityPct: number): number {
  if (riskScore < 30) return 0;
  // Fraction of population that must relocate scales with risk and inversely with accessibility.
  const riskFraction = ((riskScore - 30) / 70) * 0.85; // up to 85%
  const accessPenalty = (100 - accessibilityPct) / 200; // up to 0.5 extra
  const fraction = clamp(riskFraction + accessPenalty, 0, 0.95);
  return Math.round(zone.population * fraction);
}

function shelterCapacity(shelter: Shelter, params: SimParams): number {
  const availFactor = params.availableCapacityPct / 100;
  // Blend global road network accessibility with the shelter's own access rating.
  const effectiveAccess = (params.accessibilityPct * 0.6 + shelter.accessibility * 0.4) / 100;
  const accessFactor = 0.5 + effectiveAccess * 0.5; // 0.5x .. 1.0x
  return Math.round(shelter.baseCapacity * availFactor * accessFactor);
}

export function runSimulation(params: SimParams): SimResults {
  const zoneResults: ZoneResult[] = ZONES.map((zone) => {
    const riskScore = computeRiskScore(zone, params);
    const riskLevel: RiskLevel = riskLevelFromScore(riskScore);
    const evac = evacNeeded(zone, riskScore, params.accessibilityPct);
    return {
      id: zone.id,
      name: zone.name,
      riskScore,
      riskLevel,
      evacNeeded: evac,
      redZone: riskScore >= RED_ZONE_THRESHOLD,
    };
  });

  // Relocation allocation: greedy by priority (highest risk first).
  const priority = [...zoneResults].sort((a, b) => b.riskScore - a.riskScore);

  const shelterResults: ShelterResult[] = SHELTERS.map((s) => ({
    id: s.id,
    name: s.name,
    capacity: shelterCapacity(s, params),
    allocated: 0,
    utilization: 0,
    incomingFrom: [],
  }));

  const shelterMap = new Map(shelterResults.map((s) => [s.id, s]));
  const shelterZoneMap = new Map<string, Shelter[]>();
  for (const s of SHELTERS) {
    for (const zid of s.servesZones) {
      if (!shelterZoneMap.has(zid)) shelterZoneMap.set(zid, []);
      shelterZoneMap.get(zid)!.push(s);
    }
  }

  let totalAllocated = 0;
  let unallocated = 0;

  for (const zr of priority) {
    if (zr.evacNeeded <= 0) continue;
    let remaining = zr.evacNeeded;

    const candidateShelters = (shelterZoneMap.get(zr.id) ?? []).slice().sort((a, b) => {
      const ra = shelterMap.get(a.id)!;
      const rb = shelterMap.get(b.id)!;
      // prefer shelters with more remaining headroom
      return rb.capacity - rb.allocated - (ra.capacity - ra.allocated);
    });

    for (const s of candidateShelters) {
      if (remaining <= 0) break;
      const sr = shelterMap.get(s.id)!;
      const headroom = sr.capacity - sr.allocated;
      if (headroom <= 0) continue;
      const assigned = Math.min(remaining, headroom);
      sr.allocated += assigned;
      sr.incomingFrom.push({ zoneId: zr.id, people: assigned });
      remaining -= assigned;
      totalAllocated += assigned;
    }

    if (remaining > 0) {
      unallocated += remaining;
    }
  }

  for (const sr of shelterResults) {
    sr.utilization = sr.capacity > 0 ? Math.round((sr.allocated / sr.capacity) * 100) : 0;
  }

  const totalEvacNeeded = zoneResults.reduce((sum, z) => sum + z.evacNeeded, 0);
  const totalCapacity = shelterResults.reduce((sum, s) => sum + s.capacity, 0);
  const redZones = zoneResults.filter((z) => z.redZone);
  const redZonePopulation = ZONES.filter((z) => zoneResults.find((zr) => zr.id === z.id && zr.redZone)).reduce(
    (sum, z) => sum + z.population,
    0,
  );
  const avgRisk = Math.round(zoneResults.reduce((sum, z) => sum + z.riskScore, 0) / zoneResults.length);

  return {
    zones: zoneResults,
    shelters: shelterResults,
    priorityZones: priority.filter((z) => z.evacNeeded > 0),
    totalEvacNeeded,
    totalCapacity,
    totalAllocated,
    unallocated,
    redZoneCount: redZones.length,
    redZonePopulation,
    avgRisk,
  };
}

export { RED_ZONE_THRESHOLD };
