export type RiskLevel = 'safe' | 'low' | 'moderate' | 'high' | 'severe' | 'extreme';

export interface Zone {
  id: string;
  name: string;
  population: number;
  baseHazard: number; // 0-100 inherent flood/landslide susceptibility
  elevation: number; // meters
  area: number; // sq km
  x: number; // map coordinate 0-100
  y: number; // map coordinate 0-100
  neighbors: string[]; // adjacent zone ids for evacuation routing
}

export interface Shelter {
  id: string;
  name: string;
  baseCapacity: number;
  accessibility: number; // 0-100 base road/access condition
  x: number;
  y: number;
  servesZones: string[]; // zone ids this shelter can accept
}

export interface SimParams {
  rainfall: number; // 0-100 intensity multiplier
  hazardSeverity: number; // 0-100 multiplier on base hazard
  availableCapacityPct: number; // 0-100 % of base capacity available
  accessibilityPct: number; // 0-100 % road/access network usable
}

export interface ZoneResult {
  id: string;
  name: string;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  evacNeeded: number; // people needing relocation
  redZone: boolean;
}

export interface ShelterResult {
  id: string;
  name: string;
  capacity: number;
  allocated: number;
  utilization: number; // 0-100 %
  incomingFrom: { zoneId: string; people: number }[];
}

export interface SimResults {
  zones: ZoneResult[];
  shelters: ShelterResult[];
  priorityZones: ZoneResult[]; // sorted by risk desc
  totalEvacNeeded: number;
  totalCapacity: number;
  totalAllocated: number;
  unallocated: number;
  redZoneCount: number;
  redZonePopulation: number;
  avgRisk: number;
}

export const RISK_LEVELS: { level: RiskLevel; label: string; color: string; max: number }[] = [
  { level: 'safe', label: 'Safe', color: '#10b981', max: 15 },
  { level: 'low', label: 'Low', color: '#84cc16', max: 30 },
  { level: 'moderate', label: 'Moderate', color: '#eab308', max: 50 },
  { level: 'high', label: 'High', color: '#f97316', max: 70 },
  { level: 'severe', label: 'Severe', color: '#ef4444', max: 85 },
  { level: 'extreme', label: 'Extreme', color: '#b91c1c', max: 100 },
];

export function riskLevelFromScore(score: number): RiskLevel {
  for (const r of RISK_LEVELS) {
    if (score <= r.max) return r.level;
  }
  return 'extreme';
}

export function colorForLevel(level: RiskLevel): string {
  return RISK_LEVELS.find((r) => r.level === level)?.color ?? '#38507f';
}

export function labelForLevel(level: RiskLevel): string {
  return RISK_LEVELS.find((r) => r.level === level)?.label ?? level;
}
