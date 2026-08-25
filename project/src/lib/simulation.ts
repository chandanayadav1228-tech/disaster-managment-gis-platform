import {
  HABITATIONS,
  RELOCATION_SITES,
  HISTORICAL_DISASTERS,
  RED_ZONES,
  riskClassFromScore,
  priorityTierFromScore,
  siteAvailableCapacity,
  siteSuitability,
  siteById,
  habitationById,
  type Habitation,
  type RelocationSite,
  type PriorityTier,
  type CapacityStatus,
  capacityStatusFromRatio,
} from "@/data/gisData";

export interface ScenarioParams {
  rainfallIntensity: number; // 0-100
  hazardSeverity: number; // 0-100
  shelterCapacity: number; // 0-100 (effective-capacity multiplier on sites)
  roadAccessibility: number; // 0-100
}

export const DEFAULT_SCENARIO: ScenarioParams = {
  rainfallIntensity: 70,
  hazardSeverity: 65,
  shelterCapacity: 80,
  roadAccessibility: 75,
};

export interface ScenarioPreset {
  id: string;
  name: string;
  description: string;
  params: ScenarioParams;
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  { id: "normal", name: "Normal Monsoon", description: "Typical seasonal rainfall, limited hazard activation.", params: { rainfallIntensity: 35, hazardSeverity: 30, shelterCapacity: 90, roadAccessibility: 85 } },
  { id: "heavy", name: "Heavy Rainfall", description: "Sustained heavy precipitation, elevated flood risk.", params: { rainfallIntensity: 65, hazardSeverity: 55, shelterCapacity: 75, roadAccessibility: 65 } },
  { id: "cloudburst", name: "Cloudburst Event", description: "Extreme short-duration rainfall, severe multi-hazard impact.", params: { rainfallIntensity: 95, hazardSeverity: 90, shelterCapacity: 50, roadAccessibility: 35 } },
  { id: "post", name: "Post-Disaster", description: "Recovery phase with degraded infrastructure.", params: { rainfallIntensity: 25, hazardSeverity: 40, shelterCapacity: 40, roadAccessibility: 45 } },
];

// ---- Core risk / vulnerability calculations ----

export function effectiveRisk(h: Habitation, s: ScenarioParams): number {
  const rainfallFactor = 0.5 + (s.rainfallIntensity / 100) * 0.8;
  const hazardFactor = 0.4 + (s.hazardSeverity / 100) * 0.9;
  const base = h.baseRisk;
  const scenarioAdjusted = base * rainfallFactor * 0.6 + base * hazardFactor * 0.4;
  return Math.min(100, Math.round(scenarioAdjusted));
}

export function populationAtRisk(h: Habitation, s: ScenarioParams): number {
  const risk = effectiveRisk(h, s);
  const exposureRatio = (risk / 100) * (0.6 + (s.hazardSeverity / 100) * 0.4);
  return Math.round(h.population * Math.min(1, exposureRatio));
}

export function vulnerablePopulation(h: Habitation): number {
  return Math.round(h.population * (h.vulnerability / 100) * 0.55);
}

// Historical impact score for a habitation (0-100) — drives priority.
export function historicalImpactScore(h: Habitation): number {
  const events = h.historicalEvents;
  const affectedTotal = HISTORICAL_DISASTERS.filter((d) => d.affectedHabitationIds.includes(h.id))
    .reduce((sum, d) => sum + d.severity, 0);
  return Math.min(100, Math.round(events * 9 + affectedTotal * 4));
}

// Composite priority score combining risk, vulnerability, historical impact and exposure.
export function priorityScore(h: Habitation, s: ScenarioParams): number {
  const risk = effectiveRisk(h, s);
  const hist = historicalImpactScore(h);
  const popWeight = Math.min(1, h.population / 6000) * 100;
  return Math.min(100, Math.round(risk * 0.45 + h.vulnerability * 0.2 + hist * 0.2 + popWeight * 0.15));
}

export function priorityTier(h: Habitation, s: ScenarioParams): PriorityTier {
  return priorityTierFromScore(priorityScore(h, s));
}

export function priorityReasons(h: Habitation, s: ScenarioParams): string[] {
  const reasons: string[] = [];
  const risk = effectiveRisk(h, s);
  if (risk >= 80) reasons.push(`Critical risk score (${risk}/100)`);
  if (h.vulnerability >= 75) reasons.push(`High vulnerability (${h.vulnerability}/100)`);
  if (h.historicalEvents >= 4) reasons.push(`Repeated disasters (${h.historicalEvents} historical events)`);
  if (h.population >= 4000) reasons.push(`High population exposure (${h.population.toLocaleString()} residents)`);
  if (populationAtRisk(h, s) >= 2000) reasons.push(`Large population at risk (${populationAtRisk(h, s).toLocaleString()})`);
  if (reasons.length === 0) reasons.push("Lower composite priority — monitor and reassess seasonally.");
  return reasons;
}

// ---- Allocation engine ----

export interface Allocation {
  habitationId: string;
  habitationName: string;
  fromRisk: number;
  priorityScore: number;
  priority: PriorityTier;
  populationToMove: number;
  toSiteId: string | null;
  toSiteName: string | null;
  assigned: number;
  unassigned: number;
}

export interface AllocationResult {
  allocations: Allocation[];
  totalRelocated: number;
  totalUnassigned: number;
  totalToMove: number;
  siteUtilization: { siteId: string; siteName: string; assigned: number; capacity: number }[];
}

// Effective available site capacity under a scenario (shelter capacity multiplier).
export function effectiveSiteCapacity(site: RelocationSite, s: ScenarioParams): number {
  const base = siteAvailableCapacity(site);
  return Math.round(base * (0.5 + (s.shelterCapacity / 100) * 0.5));
}

export function computeAllocations(s: ScenarioParams): AllocationResult {
  const scored = HABITATIONS.map((h) => {
    const risk = effectiveRisk(h, s);
    const pscore = priorityScore(h, s);
    const tier = priorityTierFromScore(pscore);
    const toMove = Math.round(populationAtRisk(h, s) * 0.7);
    return { h, risk, pscore, tier, toMove };
  }).sort((a, b) => b.pscore - a.pscore);

  const remaining = new Map<string, number>();
  RELOCATION_SITES.forEach((site) => remaining.set(site.id, effectiveSiteCapacity(site, s)));

  const allocations: Allocation[] = [];
  let totalRelocated = 0;
  let totalUnassigned = 0;
  let totalToMove = 0;

  for (const item of scored) {
    totalToMove += item.toMove;
    if (item.toMove <= 0) continue;
    const candidates: RelocationSite[] = [];
    if (item.h.recommendedRelocationId) {
      const rec = siteById(item.h.recommendedRelocationId);
      if (rec) candidates.push(rec);
    }
    [...RELOCATION_SITES].sort((a, b) => siteSuitability(b) - siteSuitability(a)).forEach((site) => {
      if (!candidates.find((c) => c.id === site.id)) candidates.push(site);
    });

    let assigned = 0;
    let chosenSite: RelocationSite | null = null;
    for (const site of candidates) {
      const cap = remaining.get(site.id) ?? 0;
      if (cap > 0) {
        const take = Math.min(item.toMove, cap);
        if (take > 0) {
          remaining.set(site.id, cap - take);
          assigned += take;
          chosenSite = site;
          break;
        }
      }
    }
    const leftover = item.toMove - assigned;
    totalRelocated += assigned;
    totalUnassigned += leftover;

    allocations.push({
      habitationId: item.h.id,
      habitationName: item.h.name,
      fromRisk: item.risk,
      priorityScore: item.pscore,
      priority: item.tier,
      populationToMove: item.toMove,
      toSiteId: chosenSite ? chosenSite.id : null,
      toSiteName: chosenSite ? chosenSite.name : null,
      assigned,
      unassigned: leftover,
    });
  }

  const siteUtilization = RELOCATION_SITES.map((site) => ({
    siteId: site.id,
    siteName: site.name,
    assigned: effectiveSiteCapacity(site, s) - (remaining.get(site.id) ?? 0),
    capacity: effectiveSiteCapacity(site, s),
  }));

  return { allocations, totalRelocated, totalUnassigned, totalToMove, siteUtilization };
}

// ---- Dashboard / carrying-capacity metrics ----

export interface DashboardMetrics {
  criticalHabitations: number;
  populationAtRisk: number;
  vulnerablePopulation: number;
  immediateRelocation: number;
  shortTermRelocation: number;
  mediumTermRelocation: number;
  availableSafeCapacity: number;
  capacityDeficit: number;
  recommendedSites: number;
  activeAlerts: number;
}

export function computeMetrics(s: ScenarioParams): DashboardMetrics {
  let critical = 0;
  let popAtRisk = 0;
  let vulnerable = 0;
  let immediate = 0;
  let shortTerm = 0;
  let mediumTerm = 0;

  HABITATIONS.forEach((h) => {
    const risk = effectiveRisk(h, s);
    const cls = riskClassFromScore(risk);
    if (cls === "Severe" || cls === "High") critical += 1;
    popAtRisk += populationAtRisk(h, s);
    vulnerable += vulnerablePopulation(h);
    const tier = priorityTier(h, s);
    const par = populationAtRisk(h, s);
    if (tier === "IMMEDIATE") immediate += par;
    else if (tier === "SHORT-TERM") shortTerm += par;
    else if (tier === "MEDIUM-TERM") mediumTerm += par;
  });

  const safeCapacity = totalEffectiveCapacity(s);
  const toMove = computeAllocations(s).totalToMove;
  const deficit = Math.max(0, toMove - safeCapacity);
  const alerts = HABITATIONS.filter((h) => effectiveRisk(h, s) >= 85).length;

  return {
    criticalHabitations: critical,
    populationAtRisk: popAtRisk,
    vulnerablePopulation: vulnerable,
    immediateRelocation: immediate,
    shortTermRelocation: shortTerm,
    mediumTermRelocation: mediumTerm,
    availableSafeCapacity: safeCapacity,
    capacityDeficit: deficit,
    recommendedSites: RELOCATION_SITES.length,
    activeAlerts: alerts,
  };
}

export function totalEffectiveCapacity(s: ScenarioParams): number {
  return RELOCATION_SITES.reduce((sum, site) => sum + effectiveSiteCapacity(site, s), 0);
}

// ---- Red Zone analytics ----

export interface RedZoneStats {
  id: string;
  name: string;
  riskScore: number;
  hazardTypes: string[];
  population: number;
  vulnerablePopulation: number;
  historicalEvents: number;
  priority: PriorityTier;
  habitationIds: string[];
}

export function redZoneStats(s: ScenarioParams): RedZoneStats[] {
  return RED_ZONES.map((rz) => {
    const habits = rz.habitationIds.map((id) => habitationById(id)).filter(Boolean) as Habitation[];
    const population = habits.reduce((sum, h) => sum + h.population, 0);
    const vulnerable = habits.reduce((sum, h) => sum + vulnerablePopulation(h), 0);
    const historicalEvents = habits.reduce((sum, h) => sum + h.historicalEvents, 0);
    const avgRisk = habits.length > 0 ? Math.round(habits.reduce((sum, h) => sum + effectiveRisk(h, s), 0) / habits.length) : 0;
    const priority = priorityTierFromScore(avgRisk);
    return {
      id: rz.id,
      name: rz.name,
      riskScore: avgRisk,
      hazardTypes: rz.hazardTypes,
      population,
      vulnerablePopulation: vulnerable,
      historicalEvents,
      priority,
      habitationIds: rz.habitationIds,
    };
  });
}

// Approximate polygon area in km² (planar, good enough for demo at this scale).
export function polygonAreaKm2(coords: [number, number][]): number {
  if (coords.length < 3) return 0;
  let area = 0;
  const R = 6371;
  for (let i = 0; i < coords.length; i++) {
    const [lat1, lng1] = coords[i];
    const [lat2, lng2] = coords[(i + 1) % coords.length];
    area += ((lng2 - lng1) * Math.PI) / 180 * (2 + Math.sin((lat1 * Math.PI) / 180) + Math.sin((lat2 * Math.PI) / 180));
  }
  area = Math.abs((area * R * R) / 2);
  return Math.round(area * 100) / 100;
}

// ---- Historical disaster analytics ----

export interface HistoricalStats {
  totalEvents: number;
  byType: Record<string, number>;
  byYear: { year: number; count: number }[];
  avgSeverity: number;
  historicalImpactScore: number;
  mostAffectedHabitations: { id: string; name: string; events: number }[];
}

export function historicalStats(): HistoricalStats {
  const byType: Record<string, number> = {};
  const byYearMap: Record<number, number> = {};
  let totalSeverity = 0;
  HISTORICAL_DISASTERS.forEach((d) => {
    byType[d.type] = (byType[d.type] ?? 0) + 1;
    byYearMap[d.year] = (byYearMap[d.year] ?? 0) + 1;
    totalSeverity += d.severity;
  });
  const byYear = Object.entries(byYearMap).map(([year, count]) => ({ year: Number(year), count })).sort((a, b) => a.year - b.year);
  const avgSeverity = HISTORICAL_DISASTERS.length > 0 ? Math.round((totalSeverity / HISTORICAL_DISASTERS.length) * 10) / 10 : 0;

  const affectedCount: Record<string, number> = {};
  HISTORICAL_DISASTERS.forEach((d) => d.affectedHabitationIds.forEach((id) => { affectedCount[id] = (affectedCount[id] ?? 0) + 1; }));
  const mostAffected = Object.entries(affectedCount)
    .map(([id, events]) => ({ id, name: habitationById(id)?.name ?? id, events }))
    .sort((a, b) => b.events - a.events)
    .slice(0, 5);

  const histImpact = HABITATIONS.reduce((sum, h) => sum + historicalImpactScore(h), 0);

  return { totalEvents: HISTORICAL_DISASTERS.length, byType, byYear, avgSeverity, historicalImpactScore: histImpact, mostAffectedHabitations: mostAffected };
}

// ---- AI relocation planner ----

export interface SiteCandidate {
  site: RelocationSite;
  suitability: number;
  available: number;
  distanceKm: number;
}

export interface AIRecommendation {
  habitation: Habitation;
  risk: number;
  vulnerability: number;
  historicalImpact: number;
  population: number;
  priority: PriorityTier;
  priorityScore: number;
  reasons: string[];
  candidates: SiteCandidate[];
  best: SiteCandidate | null;
  rationale: string;
  recommendedAllocation: number;
}

export function aiRecommendation(habitationId: string, s: ScenarioParams): AIRecommendation | null {
  const h = habitationById(habitationId);
  if (!h) return null;
  const risk = effectiveRisk(h, s);
  const histImpact = historicalImpactScore(h);
  const pscore = priorityScore(h, s);
  const tier = priorityTierFromScore(pscore);
  const reasons = priorityReasons(h, s);

  const candidates: SiteCandidate[] = RELOCATION_SITES.map((site) => ({
    site,
    suitability: siteSuitability(site),
    available: effectiveSiteCapacity(site, s),
    distanceKm: site.distanceKm,
  })).sort((a, b) => b.suitability - a.suitability);

  const best = candidates[0] ?? null;
  const toMove = Math.round(populationAtRisk(h, s) * 0.7);
  const recommendedAllocation = best ? Math.min(toMove, best.available) : 0;

  const rationale = best
    ? `${best.site.name} is recommended because it has ${best.site.hazardSafety >= 90 ? "very low" : "low"} hazard exposure, ${best.available.toLocaleString()} available capacity, ${best.site.roadAccess >= 80 ? "strong" : "adequate"} road accessibility, ${best.site.healthcareAccess >= 70 ? "nearby" : "reachable"} healthcare and ${best.site.infrastructure >= 80 ? "robust" : "adequate"} infrastructure.`
    : "No suitable site with available capacity was identified.";

  return {
    habitation: h,
    risk,
    vulnerability: h.vulnerability,
    historicalImpact: histImpact,
    population: h.population,
    priority: tier,
    priorityScore: pscore,
    reasons,
    candidates,
    best,
    rationale,
    recommendedAllocation,
  };
}

// ---- Carrying capacity ----

export interface SiteCarryingCapacity {
  site: RelocationSite;
  capacity: number;
  existingPopulation: number;
  availableCapacity: number;
  allocated: number;
  remaining: number;
  waterCapacity: number;
  healthcareCapacity: number;
  housingCapacity: number;
  electricity: number;
  sanitation: number;
  emergencyServices: number;
  status: CapacityStatus;
}

export function carryingCapacity(s: ScenarioParams): {
  sites: SiteCarryingCapacity[];
  totalSafeCapacity: number;
  existingPopulation: number;
  availableCapacity: number;
  populationRequiringRelocation: number;
  allocatedPopulation: number;
  unassignedPopulation: number;
  capacityDeficit: number;
  overallStatus: CapacityStatus;
} {
  const allocation = computeAllocations(s);
  const sites: SiteCarryingCapacity[] = RELOCATION_SITES.map((site) => {
    const cap = effectiveSiteCapacity(site, s);
    const util = allocation.siteUtilization.find((u) => u.siteId === site.id);
    const allocated = util ? util.assigned : 0;
    const remaining = Math.max(0, cap - allocated);
    const ratio = cap > 0 ? remaining / cap : 0;
    return {
      site,
      capacity: cap,
      existingPopulation: site.existingPopulation,
      availableCapacity: cap,
      allocated,
      remaining,
      waterCapacity: site.waterCapacity,
      healthcareCapacity: site.healthcareCapacity,
      housingCapacity: site.housingCapacity,
      electricity: site.electricity,
      sanitation: site.sanitation,
      emergencyServices: site.emergencyServices,
      status: capacityStatusFromRatio(ratio),
    };
  });

  const totalSafeCapacity = sites.reduce((sum, x) => sum + x.capacity, 0);
  const existingPopulation = RELOCATION_SITES.reduce((sum, x) => sum + x.existingPopulation, 0);
  const availableCapacity = totalSafeCapacity;
  const populationRequiringRelocation = allocation.totalToMove;
  const allocatedPopulation = allocation.totalRelocated;
  const unassignedPopulation = allocation.totalUnassigned;
  const capacityDeficit = Math.max(0, populationRequiringRelocation - totalSafeCapacity);
  const overallRatio = totalSafeCapacity > 0 ? (totalSafeCapacity - allocatedPopulation) / totalSafeCapacity : 0;

  return {
    sites,
    totalSafeCapacity,
    existingPopulation,
    availableCapacity,
    populationRequiringRelocation,
    allocatedPopulation,
    unassignedPopulation,
    capacityDeficit,
    overallStatus: capacityStatusFromRatio(overallRatio),
  };
}

// ---- Before / After scenario comparison ----

export interface ScenarioComparison {
  metric: string;
  before: number;
  after: number;
  delta: number;
}

export function scenarioComparison(before: ScenarioParams, after: ScenarioParams): ScenarioComparison[] {
  const mb = computeMetrics(before);
  const ma = computeMetrics(after);
  return [
    { metric: "Population at Risk", before: mb.populationAtRisk, after: ma.populationAtRisk, delta: ma.populationAtRisk - mb.populationAtRisk },
    { metric: "Vulnerable Population", before: mb.vulnerablePopulation, after: ma.vulnerablePopulation, delta: ma.vulnerablePopulation - mb.vulnerablePopulation },
    { metric: "Immediate Relocation", before: mb.immediateRelocation, after: ma.immediateRelocation, delta: ma.immediateRelocation - mb.immediateRelocation },
    { metric: "Critical Habitations", before: mb.criticalHabitations, after: ma.criticalHabitations, delta: ma.criticalHabitations - mb.criticalHabitations },
    { metric: "Available Safe Capacity", before: mb.availableSafeCapacity, after: ma.availableSafeCapacity, delta: ma.availableSafeCapacity - mb.availableSafeCapacity },
    { metric: "Capacity Deficit", before: mb.capacityDeficit, after: ma.capacityDeficit, delta: ma.capacityDeficit - mb.capacityDeficit },
  ];
}
