export type HazardType = 'flood' | 'landslide' | 'earthquake' | 'cyclone';
export type RoadType = 'highway' | 'main' | 'local';
export type RiskCategory = 'Severe' | 'High' | 'Moderate' | 'Low';

export interface HabitationRisk {
  id: string;
  name: string;
  district: string;
  population: number;
  children: number;
  elderly: number;
  disabled: number;
  lat: number;
  lng: number;
  risk_score: number;
  risk_category: RiskCategory;
  red_zone: boolean;
  exposure_score: number;
  vulnerability_score: number;
  response_score: number;
  nearest_hospital_m: number;
  nearest_shelter_m: number;
  affected_hazards: HazardType[];
}

export interface HazardZone {
  id: string;
  name: string;
  hazard_type: HazardType;
  severity: number;
  description: string;
  geojson: string;
}

export interface RoadFeature {
  id: string;
  name: string;
  road_type: RoadType;
  geojson: string;
}

export interface Facility {
  id: string;
  name: string;
  capacity: number;
  lat: number;
  lng: number;
}

export interface RiskSummary {
  total: number;
  severe: number;
  high: number;
  moderate: number;
  low: number;
  redZones: number;
  totalPopulation: number;
  vulnerablePopulation: number;
}
