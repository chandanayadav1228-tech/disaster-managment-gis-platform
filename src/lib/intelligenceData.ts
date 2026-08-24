import { supabase } from '@/lib/supabase';
import { calculateHistoricalImpact, calculatePriority, calculateRisk, calculateVulnerability, type PriorityResult, type RiskResult, type RiskWeights, type VulnerabilityResult } from '@/lib/intelligence';

interface RawHabitation { id: string; name: string; habitation_code: string; population_total: number; elevation_m: number | null; }
interface RawPopulation { habitation_id: string; total_count: number; children_count: number; elderly_count: number; disability_count: number; medical_vulnerability_count: number; }
interface RawVulnerability { habitation_id: string; road_access_score: number; hospital_access_score: number; infrastructure_condition_score: number; }
interface RawRisk { habitation_id: string; flood_risk: number; landslide_risk: number; cloudburst_risk: number; coastal_erosion_risk: number; historical_impact: number; population_exposure: number; geographic_vulnerability: number; }
interface RawHistory { habitation_id: string; event_type: string; impact_score: number; }

export interface IntelligenceRecord {
  id: string;
  name: string;
  code: string;
  population: number;
  elevation: number;
  risk: RiskResult;
  vulnerability: VulnerabilityResult;
  historical: ReturnType<typeof calculateHistoricalImpact>;
  priority: PriorityResult;
}

export interface IntelligenceData {
  records: IntelligenceRecord[];
  weights: RiskWeights;
  regionName: string;
}

const defaultWeights: RiskWeights = {
  flood: 0.25, landslide: 0.2, cloudburst: 0.15, coastalErosion: 0.1,
  historicalImpact: 0.1, populationExposure: 0.1, geographicVulnerability: 0.1,
  redZoneThreshold: 80, lowThreshold: 30, moderateThreshold: 60, highThreshold: 80,
};

const asNumber = (value: number | null | undefined): number => Number(value ?? 0);

export async function loadIntelligenceData(): Promise<IntelligenceData> {
  const [regionResult, habitationsResult, populationResult, vulnerabilityResult, risksResult, historyResult, configResult] = await Promise.all([
    supabase.from('regions').select('name').eq('is_demo', true).limit(1).maybeSingle(),
    supabase.from('habitations').select('id, name, habitation_code, population_total, elevation_m').eq('is_active', true),
    supabase.from('population').select('habitation_id, total_count, children_count, elderly_count, disability_count, medical_vulnerability_count'),
    supabase.from('vulnerable_population').select('habitation_id, road_access_score, hospital_access_score, infrastructure_condition_score'),
    supabase.from('risk_assessments').select('habitation_id, flood_risk, landslide_risk, cloudburst_risk, coastal_erosion_risk, historical_impact, population_exposure, geographic_vulnerability').is('scenario_run_id', null),
    supabase.from('disaster_history').select('habitation_id, event_type, impact_score'),
    supabase.from('risk_configuration').select('flood_weight, landslide_weight, cloudburst_weight, coastal_erosion_weight, historical_impact_weight, population_exposure_weight, geographic_vulnerability_weight, red_zone_threshold, low_threshold, moderate_threshold, high_threshold').limit(1).maybeSingle(),
  ]);
  const failed = [regionResult, habitationsResult, populationResult, vulnerabilityResult, risksResult, historyResult, configResult].find((result) => result.error);
  if (failed?.error) {
    console.error('Intelligence data load failed', failed.error);
    throw new Error('Unable to load intelligence data.');
  }

  const config = configResult.data;
  const weights: RiskWeights = config ? {
    flood: asNumber(config.flood_weight), landslide: asNumber(config.landslide_weight), cloudburst: asNumber(config.cloudburst_weight), coastalErosion: asNumber(config.coastal_erosion_weight),
    historicalImpact: asNumber(config.historical_impact_weight), populationExposure: asNumber(config.population_exposure_weight), geographicVulnerability: asNumber(config.geographic_vulnerability_weight),
    redZoneThreshold: asNumber(config.red_zone_threshold), lowThreshold: asNumber(config.low_threshold), moderateThreshold: asNumber(config.moderate_threshold), highThreshold: asNumber(config.high_threshold),
  } : defaultWeights;
  const populations = new Map((populationResult.data as RawPopulation[] ?? []).map((item) => [item.habitation_id, item]));
  const vulnerabilities = new Map((vulnerabilityResult.data as RawVulnerability[] ?? []).map((item) => [item.habitation_id, item]));
  const risks = new Map((risksResult.data as RawRisk[] ?? []).map((item) => [item.habitation_id, item]));
  const history = new Map<string, RawHistory[]>();
  for (const event of (historyResult.data as RawHistory[] ?? [])) history.set(event.habitation_id, [...(history.get(event.habitation_id) ?? []), event]);

  const records = ((habitationsResult.data as RawHabitation[] ?? [])).map((habitation) => {
    const population = populations.get(habitation.id);
    const vulnerability = vulnerabilities.get(habitation.id);
    const rawRisk = risks.get(habitation.id);
    const historical = calculateHistoricalImpact((history.get(habitation.id) ?? []).map((event) => ({ impactScore: asNumber(event.impact_score), eventType: event.event_type })));
    const vulnerabilityResult = calculateVulnerability({
      totalPopulation: asNumber(population?.total_count || habitation.population_total), children: asNumber(population?.children_count), elderly: asNumber(population?.elderly_count), disability: asNumber(population?.disability_count), medical: asNumber(population?.medical_vulnerability_count),
      roadAccess: asNumber(vulnerability?.road_access_score), hospitalAccess: asNumber(vulnerability?.hospital_access_score), infrastructure: asNumber(vulnerability?.infrastructure_condition_score), historicalImpact: historical.score,
    });
    const risk = calculateRisk({
      flood: asNumber(rawRisk?.flood_risk), landslide: asNumber(rawRisk?.landslide_risk), cloudburst: asNumber(rawRisk?.cloudburst_risk), coastalErosion: asNumber(rawRisk?.coastal_erosion_risk), historicalImpact: historical.score, populationExposure: asNumber(rawRisk?.population_exposure), geographicVulnerability: vulnerabilityResult.score,
    }, weights);
    const priority = calculatePriority({ risk: risk.score, vulnerability: vulnerabilityResult.score, populationExposure: asNumber(rawRisk?.population_exposure), historicalImpact: historical.score, accessibility: (asNumber(vulnerability?.road_access_score) + asNumber(vulnerability?.hospital_access_score)) / 2 });
    return { id: habitation.id, name: habitation.name, code: habitation.habitation_code, population: asNumber(population?.total_count || habitation.population_total), elevation: asNumber(habitation.elevation_m), risk, vulnerability: vulnerabilityResult, historical, priority };
  });
  return { records, weights, regionName: regionResult.data?.name ?? 'Demo region' };
}
