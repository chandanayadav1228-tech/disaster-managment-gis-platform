import { supabase } from './supabase';
import type { HabitationRisk, HazardZone, RoadFeature, Facility, RiskSummary } from './types';

export async function fetchHabitationRisk(): Promise<HabitationRisk[]> {
  const { data, error } = await supabase
    .from('v_habitation_risk')
    .select('*')
    .order('risk_score', { ascending: false });

  if (error) throw new Error(`Failed to load habitation risk data: ${error.message}`);
  if (!data) return [];
  return data as HabitationRisk[];
}

export async function fetchHazardZones(): Promise<HazardZone[]> {
  const { data, error } = await supabase
    .from('v_hazard_zones')
    .select('*')
    .order('severity', { ascending: false });

  if (error) throw new Error(`Failed to load hazard zones: ${error.message}`);
  if (!data) return [];
  return data as HazardZone[];
}

export async function fetchRoads(): Promise<RoadFeature[]> {
  const { data, error } = await supabase
    .from('v_roads')
    .select('*');

  if (error) throw new Error(`Failed to load road network: ${error.message}`);
  if (!data) return [];
  return data as RoadFeature[];
}

export async function fetchHospitals(): Promise<Facility[]> {
  const { data, error } = await supabase
    .from('v_hospitals')
    .select('*');

  if (error) throw new Error(`Failed to load hospitals: ${error.message}`);
  if (!data) return [];
  return data as Facility[];
}

export async function fetchShelters(): Promise<Facility[]> {
  const { data, error } = await supabase
    .from('v_shelters')
    .select('*');

  if (error) throw new Error(`Failed to load shelters: ${error.message}`);
  if (!data) return [];
  return data as Facility[];
}

export async function fetchRelocationSites(): Promise<Facility[]> {
  const { data, error } = await supabase
    .from('v_relocation_sites')
    .select('*');

  if (error) throw new Error(`Failed to load relocation sites: ${error.message}`);
  if (!data) return [];
  return data as Facility[];
}

export function computeRiskSummary(habitations: HabitationRisk[]): RiskSummary {
  return {
    total: habitations.length,
    severe: habitations.filter((h) => h.risk_category === 'Severe').length,
    high: habitations.filter((h) => h.risk_category === 'High').length,
    moderate: habitations.filter((h) => h.risk_category === 'Moderate').length,
    low: habitations.filter((h) => h.risk_category === 'Low').length,
    redZones: habitations.filter((h) => h.red_zone).length,
    totalPopulation: habitations.reduce((sum, h) => sum + h.population, 0),
    vulnerablePopulation: habitations.reduce(
      (sum, h) => sum + h.children + h.elderly + h.disabled,
      0
    ),
  };
}
