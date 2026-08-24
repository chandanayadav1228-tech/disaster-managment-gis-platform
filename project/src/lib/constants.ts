import type { HazardType, RiskCategory, RoadType } from './types';

export const RISK_COLORS: Record<RiskCategory, string> = {
  Severe: '#dc2626',
  High: '#ea580c',
  Moderate: '#ca8a04',
  Low: '#16a34a',
};

export const RISK_BG_COLORS: Record<RiskCategory, string> = {
  Severe: '#fef2f2',
  High: '#fff7ed',
  Moderate: '#fefce8',
  Low: '#f0fdf4',
};

export const HAZARD_COLORS: Record<HazardType, string> = {
  flood: '#2563eb',
  landslide: '#b45309',
  earthquake: '#7c2d12',
  cyclone: '#0891b2',
};

export const HAZARD_FILL_COLORS: Record<HazardType, string> = {
  flood: '#3b82f6',
  landslide: '#d97706',
  earthquake: '#9a3412',
  cyclone: '#06b6d4',
};

export const HAZARD_ICONS: Record<HazardType, string> = {
  flood: 'Waves',
  landslide: 'Mountain',
  earthquake: 'Activity',
  cyclone: 'CloudWind',
};

export const ROAD_STYLES: Record<RoadType, { color: string; weight: number; dashArray?: string }> = {
  highway: { color: '#475569', weight: 4 },
  main: { color: '#64748b', weight: 3 },
  local: { color: '#94a3b8', weight: 2, dashArray: '6 4' },
};

export const SEVERITY_LABELS: Record<number, string> = {
  1: 'Very Low',
  2: 'Low',
  3: 'Moderate',
  4: 'High',
  5: 'Severe',
};

export const HAZARD_LABELS: Record<HazardType, string> = {
  flood: 'Flood',
  landslide: 'Landslide',
  earthquake: 'Earthquake',
  cyclone: 'Cyclone',
};

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatScore(score: number): string {
  return score.toFixed(1);
}
