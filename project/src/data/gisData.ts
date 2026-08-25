// Centralized GIS dataset for the Disaster Management Decision Support Platform.
// All modules consume this single source of truth — no per-page hard-coded datasets.
//
// Coordinates are centered on a Himalayan foothill river-valley region
// (approx. the Alaknanda / Mandakini watershed in Uttarakhand, India),
// which realistically exhibits flood, landslide, cloudburst and erosion hazards.

export type RiskClass = "Safe" | "Moderate" | "High" | "Severe";
export type PriorityTier = "IMMEDIATE" | "SHORT-TERM" | "MEDIUM-TERM" | "LOW";
export type CapacityStatus = "SUFFICIENT" | "LIMITED" | "INSUFFICIENT";

export interface Habitation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  population: number;
  baseRisk: number; // 0-100
  vulnerability: number; // 0-100
  historicalEvents: number;
  recommendedRelocationId: string | null;
  // Demographics (derived estimates stored for profile richness; driven from population + vulnerability)
  households: number;
  children: number;
  elderly: number;
  pwd: number; // persons with disabilities
  medicallyVulnerable: number;
  healthcareAccess: number; // 0-100
  roadAccess: number; // 0-100
  infrastructure: number; // 0-100
  // Which hazard types affect this habitation (drives Red Zone membership & filters)
  hazards: string[];
}

export interface RelocationSite {
  id: string;
  name: string;
  lat: number;
  lng: number;
  totalCapacity: number;
  existingPopulation: number;
  hazardSafety: number; // 0-100
  roadAccess: number; // 0-100
  healthcareAccess: number; // 0-100
  waterAvailability: number; // 0-100
  infrastructure: number; // 0-100
  // Carrying-capacity sub-scores (0-100)
  waterCapacity: number;
  healthcareCapacity: number;
  housingCapacity: number;
  electricity: number;
  sanitation: number;
  emergencyServices: number;
  // Approx distance (km) from the main population cluster
  distanceKm: number;
}

export interface HistoricalDisaster {
  id: string;
  name: string;
  type: string;
  year: number;
  lat: number;
  lng: number;
  severity: number; // 1-5
  affectedPopulation: number;
  affectedHabitationIds: string[];
}

export interface Hospital {
  id: string;
  name: string;
  lat: number;
  lng: number;
  beds: number;
}

export interface Shelter {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
}

export interface Road {
  id: string;
  name: string;
  points: [number, number][];
  type: "highway" | "major" | "minor";
}

export interface River {
  id: string;
  name: string;
  points: [number, number][];
}

export interface HazardPolygon {
  id: string;
  type: "flood" | "landslide" | "cloudburst" | "coastal";
  name: string;
  coords: [number, number][];
  severity: number; // 1-5
}

export interface RedZone {
  id: string;
  name: string;
  coords: [number, number][];
  hazardTypes: string[];
  habitationIds: string[];
}

export interface InfrastructureAsset {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "power" | "water" | "telecom" | "bridge";
}

export const REGION_NAME = "Alaknanda–Mandakini Valley";
export const MAP_CENTER: [number, number] = [30.46, 79.07];

export const HABITATIONS: Habitation[] = [
  { id: "h1", name: "Riverside North", lat: 30.485, lng: 79.052, population: 4200, baseRisk: 91, vulnerability: 88, historicalEvents: 6, recommendedRelocationId: "r2", households: 880, children: 920, elderly: 460, pwd: 130, medicallyVulnerable: 560, healthcareAccess: 35, roadAccess: 40, infrastructure: 45, hazards: ["flood", "cloudburst"] },
  { id: "h2", name: "Riverside South", lat: 30.452, lng: 79.068, population: 3800, baseRisk: 87, vulnerability: 82, historicalEvents: 5, recommendedRelocationId: "r2", households: 760, children: 830, elderly: 420, pwd: 110, medicallyVulnerable: 500, healthcareAccess: 40, roadAccess: 45, infrastructure: 50, hazards: ["flood", "coastal"] },
  { id: "h3", name: "Hilltop Devasthali", lat: 30.508, lng: 79.092, population: 2100, baseRisk: 74, vulnerability: 69, historicalEvents: 4, recommendedRelocationId: "r3", households: 430, children: 460, elderly: 240, pwd: 60, medicallyVulnerable: 280, healthcareAccess: 50, roadAccess: 55, infrastructure: 60, hazards: ["landslide"] },
  { id: "h4", name: "Old Market Ward", lat: 30.471, lng: 79.061, population: 5600, baseRisk: 82, vulnerability: 77, historicalEvents: 7, recommendedRelocationId: "r1", households: 1150, children: 1200, elderly: 620, pwd: 160, medicallyVulnerable: 720, healthcareAccess: 55, roadAccess: 60, infrastructure: 65, hazards: ["flood", "cloudburst"] },
  { id: "h5", name: "Ghat Village", lat: 30.444, lng: 79.055, population: 1900, baseRisk: 95, vulnerability: 91, historicalEvents: 8, recommendedRelocationId: "r2", households: 380, children: 420, elderly: 220, pwd: 70, medicallyVulnerable: 260, healthcareAccess: 25, roadAccess: 30, infrastructure: 35, hazards: ["flood", "cloudburst", "coastal"] },
  { id: "h6", name: "Forest Ridge", lat: 30.521, lng: 79.044, population: 1200, baseRisk: 41, vulnerability: 38, historicalEvents: 1, recommendedRelocationId: null, households: 240, children: 260, elderly: 130, pwd: 30, medicallyVulnerable: 150, healthcareAccess: 60, roadAccess: 65, infrastructure: 55, hazards: ["landslide"] },
  { id: "h7", name: "Terrace Farms", lat: 30.515, lng: 79.110, population: 2400, baseRisk: 63, vulnerability: 55, historicalEvents: 2, recommendedRelocationId: "r3", households: 480, children: 520, elderly: 270, pwd: 70, medicallyVulnerable: 300, healthcareAccess: 55, roadAccess: 60, infrastructure: 58, hazards: ["landslide"] },
  { id: "h8", name: "Cliff Edge Colony", lat: 30.532, lng: 79.083, population: 1500, baseRisk: 78, vulnerability: 84, historicalEvents: 4, recommendedRelocationId: "r3", households: 300, children: 330, elderly: 180, pwd: 55, medicallyVulnerable: 220, healthcareAccess: 45, roadAccess: 35, infrastructure: 48, hazards: ["landslide"] },
  { id: "h9", name: "Lowland Bazaar", lat: 30.438, lng: 79.078, population: 6100, baseRisk: 89, vulnerability: 73, historicalEvents: 6, recommendedRelocationId: "r1", households: 1250, children: 1320, elderly: 680, pwd: 180, medicallyVulnerable: 810, healthcareAccess: 50, roadAccess: 50, infrastructure: 62, hazards: ["flood"] },
  { id: "h10", name: "Plateau View", lat: 30.540, lng: 79.052, population: 800, baseRisk: 28, vulnerability: 22, historicalEvents: 0, recommendedRelocationId: null, households: 160, children: 170, elderly: 90, pwd: 20, medicallyVulnerable: 100, healthcareAccess: 70, roadAccess: 75, infrastructure: 70, hazards: [] },
];

export const RELOCATION_SITES: RelocationSite[] = [
  { id: "r1", name: "Upland Relief Campus", lat: 30.536, lng: 79.085, totalCapacity: 5000, existingPopulation: 800, hazardSafety: 94, roadAccess: 88, healthcareAccess: 76, waterAvailability: 82, infrastructure: 85, waterCapacity: 80, healthcareCapacity: 72, housingCapacity: 85, electricity: 90, sanitation: 84, emergencyServices: 78, distanceKm: 6.2 },
  { id: "r2", name: "Safe Ground Shelter Zone", lat: 30.510, lng: 79.026, totalCapacity: 4200, existingPopulation: 1100, hazardSafety: 90, roadAccess: 72, healthcareAccess: 64, waterAvailability: 78, infrastructure: 74, waterCapacity: 75, healthcareCapacity: 60, housingCapacity: 70, electricity: 82, sanitation: 70, emergencyServices: 62, distanceKm: 8.5 },
  { id: "r3", name: "Northern Plateau Site", lat: 30.555, lng: 79.098, totalCapacity: 6000, existingPopulation: 500, hazardSafety: 97, roadAccess: 80, healthcareAccess: 70, waterAvailability: 88, infrastructure: 81, waterCapacity: 86, healthcareCapacity: 66, housingCapacity: 88, electricity: 88, sanitation: 82, emergencyServices: 72, distanceKm: 11.0 },
];

export const HOSPITALS: Hospital[] = [
  { id: "hp1", name: "District General Hospital", lat: 30.470, lng: 79.072, beds: 220 },
  { id: "hp2", name: "Base Camp Medical Centre", lat: 30.504, lng: 79.040, beds: 80 },
  { id: "hp3", name: "Highland Community Clinic", lat: 30.542, lng: 79.092, beds: 40 },
];

export const SHELTERS: Shelter[] = [
  { id: "s1", name: "Central School Shelter", lat: 30.474, lng: 79.068, capacity: 600 },
  { id: "s2", name: "Community Hall Shelter", lat: 30.461, lng: 79.080, capacity: 400 },
  { id: "s3", name: "Ridge Top Camp", lat: 30.525, lng: 79.064, capacity: 350 },
  { id: "s4", name: "Plateau Emergency Camp", lat: 30.548, lng: 79.054, capacity: 500 },
];

export const ROADS: Road[] = [
  { id: "rd1", name: "Valley Highway", type: "highway", points: [[30.432, 79.035], [30.460, 79.060], [30.474, 79.072], [30.495, 79.090], [30.520, 79.105]] },
  { id: "rd2", name: "Riverside Road", type: "major", points: [[30.440, 79.048], [30.452, 79.068], [30.471, 79.061], [30.485, 79.052]] },
  { id: "rd3", name: "Hill Track", type: "minor", points: [[30.471, 79.061], [30.508, 79.092], [30.532, 79.083], [30.540, 79.052]] },
  { id: "rd4", name: "Northern Access Road", type: "major", points: [[30.495, 79.090], [30.536, 79.085], [30.555, 79.098]] },
  { id: "rd5", name: "Forest Path", type: "minor", points: [[30.508, 79.092], [30.521, 79.044], [30.540, 79.052]] },
];

export const RIVERS: River[] = [
  { id: "rv1", name: "Alaknanda River", points: [[30.430, 79.045], [30.445, 79.058], [30.460, 79.065], [30.475, 79.070], [30.490, 79.075], [30.505, 79.085], [30.520, 79.095]] },
  { id: "rv2", name: "Mandakini Tributary", points: [[30.500, 79.030], [30.485, 79.050], [30.470, 79.065]] },
];

export const HAZARD_POLYGONS: HazardPolygon[] = [
  { id: "fz1", type: "flood", name: "River Floodplain", severity: 5, coords: [[30.435, 79.040], [30.444, 79.055], [30.452, 79.068], [30.471, 79.061], [30.485, 79.052], [30.490, 79.060], [30.470, 79.072], [30.450, 79.078], [30.438, 79.078], [30.432, 79.060]] },
  { id: "fz2", type: "flood", name: "Lowland Basin", severity: 4, coords: [[30.438, 79.078], [30.450, 79.078], [30.460, 79.090], [30.444, 79.092], [30.430, 79.085]] },
  { id: "lz1", type: "landslide", name: "Hillside Slide Zone A", severity: 4, coords: [[30.500, 79.085], [30.512, 79.095], [30.520, 79.090], [30.515, 79.078], [30.504, 79.080]] },
  { id: "lz2", type: "landslide", name: "Cliff Slide Zone B", severity: 3, coords: [[30.528, 79.078], [30.535, 79.088], [30.540, 79.080], [30.534, 79.072]] },
  { id: "cb1", type: "cloudburst", name: "Cloudburst Corridor", severity: 5, coords: [[30.460, 79.040], [30.475, 79.055], [30.490, 79.050], [30.485, 79.035], [30.470, 79.030]] },
  { id: "co1", type: "coastal", name: "Riverside Erosion Belt", severity: 3, coords: [[30.445, 79.052], [30.455, 79.062], [30.462, 79.058], [30.455, 79.048]] },
];

export const RED_ZONES: RedZone[] = [
  { id: "rz1", name: "Red Zone A — Ghat Village", coords: [[30.440, 79.048], [30.450, 79.062], [30.448, 79.070], [30.434, 79.066], [30.432, 79.054]], hazardTypes: ["flood", "cloudburst", "coastal"], habitationIds: ["h5", "h2"] },
  { id: "rz2", name: "Red Zone B — Lowland Bazaar", coords: [[30.432, 79.072], [30.445, 79.082], [30.440, 79.090], [30.426, 79.084]], hazardTypes: ["flood"], habitationIds: ["h9", "h4"] },
  { id: "rz3", name: "Red Zone C — Cliff Edge", coords: [[30.524, 79.075], [30.538, 79.090], [30.542, 79.078], [30.530, 79.070]], hazardTypes: ["landslide"], habitationIds: ["h8", "h3"] },
];

export const HISTORICAL_DISASTERS: HistoricalDisaster[] = [
  { id: "d1", name: "2013 Flood Event", type: "Flood", year: 2013, lat: 30.448, lng: 79.058, severity: 5, affectedPopulation: 4800, affectedHabitationIds: ["h1", "h2", "h5", "h9"] },
  { id: "d2", name: "2016 Landslide", type: "Landslide", year: 2016, lat: 30.510, lng: 79.088, severity: 4, affectedPopulation: 2100, affectedHabitationIds: ["h3", "h7"] },
  { id: "d3", name: "2018 Cloudburst", type: "Cloudburst", year: 2018, lat: 30.475, lng: 79.048, severity: 5, affectedPopulation: 5200, affectedHabitationIds: ["h1", "h4", "h5"] },
  { id: "d4", name: "2020 Flood", type: "Flood", year: 2020, lat: 30.462, lng: 79.075, severity: 4, affectedPopulation: 3600, affectedHabitationIds: ["h2", "h4", "h9"] },
  { id: "d5", name: "2021 Erosion Surge", type: "Erosion", year: 2021, lat: 30.452, lng: 79.055, severity: 3, affectedPopulation: 1400, affectedHabitationIds: ["h2", "h5"] },
  { id: "d6", name: "2022 Landslide", type: "Landslide", year: 2022, lat: 30.533, lng: 79.083, severity: 3, affectedPopulation: 1100, affectedHabitationIds: ["h8", "h3"] },
];

export const INFRASTRUCTURE: InfrastructureAsset[] = [
  { id: "i1", name: "Valley Substation", lat: 30.478, lng: 79.066, type: "power" },
  { id: "i2", name: "Riverside Water Works", lat: 30.458, lng: 79.060, type: "water" },
  { id: "i3", name: "Hilltop Telecom Tower", lat: 30.518, lng: 79.088, type: "telecom" },
  { id: "i4", name: "Old Market Bridge", lat: 30.471, lng: 79.063, type: "bridge" },
  { id: "i5", name: "Ghat Crossing Bridge", lat: 30.446, lng: 79.056, type: "bridge" },
];

// ---- Pure classification helpers (shared by every module) ----

export function riskClassFromScore(score: number): RiskClass {
  if (score >= 80) return "Severe";
  if (score >= 60) return "High";
  if (score >= 40) return "Moderate";
  return "Safe";
}

export function riskBadgeClass(score: number): string {
  const cls = riskClassFromScore(score);
  if (cls === "Severe") return "bg-red-100 text-red-700 border-red-300";
  if (cls === "High") return "bg-orange-100 text-orange-700 border-orange-300";
  if (cls === "Moderate") return "bg-yellow-100 text-yellow-700 border-yellow-300";
  return "bg-green-100 text-green-700 border-green-300";
}

export function riskDotColor(score: number): string {
  if (score >= 80) return "#dc2626";
  if (score >= 60) return "#ea580c";
  if (score >= 40) return "#ca8a04";
  return "#16a34a";
}

export function riskBarColor(score: number): string {
  if (score >= 80) return "bg-red-500";
  if (score >= 60) return "bg-orange-500";
  if (score >= 40) return "bg-yellow-400";
  return "bg-green-500";
}

export function priorityTierFromScore(score: number): PriorityTier {
  if (score >= 85) return "IMMEDIATE";
  if (score >= 65) return "SHORT-TERM";
  if (score >= 45) return "MEDIUM-TERM";
  return "LOW";
}

export function priorityBadgeClass(priority: string): string {
  if (priority === "IMMEDIATE") return "bg-red-600 text-white";
  if (priority === "SHORT-TERM") return "bg-orange-500 text-white";
  if (priority === "MEDIUM-TERM") return "bg-yellow-400 text-yellow-900";
  return "bg-green-500 text-white";
}

export function capacityStatusFromRatio(ratio: number): CapacityStatus {
  if (ratio >= 1) return "SUFFICIENT";
  if (ratio >= 0.5) return "LIMITED";
  return "INSUFFICIENT";
}

export function capacityStatusClass(status: CapacityStatus): string {
  if (status === "SUFFICIENT") return "bg-green-100 text-green-700 border-green-300";
  if (status === "LIMITED") return "bg-yellow-100 text-yellow-700 border-yellow-300";
  return "bg-red-100 text-red-700 border-red-300";
}

// ---- Site helpers ----

export function siteSuitability(site: RelocationSite): number {
  return Math.round(
    site.hazardSafety * 0.3 +
      site.roadAccess * 0.2 +
      site.healthcareAccess * 0.15 +
      site.waterAvailability * 0.15 +
      site.infrastructure * 0.2
  );
}

export function siteAvailableCapacity(site: RelocationSite): number {
  return Math.max(0, site.totalCapacity - site.existingPopulation);
}

export function recommendedPopulation(site: RelocationSite): number {
  return Math.round(siteAvailableCapacity(site) * (siteSuitability(site) / 100));
}

export function habitationNameById(id: string | null): string | null {
  if (!id) return null;
  const h = HABITATIONS.find((x) => x.id === id);
  return h ? h.name : null;
}

export function siteById(id: string | null): RelocationSite | null {
  if (!id) return null;
  return RELOCATION_SITES.find((x) => x.id === id) ?? null;
}

export function habitationById(id: string | null): Habitation | null {
  if (!id) return null;
  return HABITATIONS.find((x) => x.id === id) ?? null;
}
