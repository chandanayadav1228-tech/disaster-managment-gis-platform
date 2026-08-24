export type RiskClass = 'Low' | 'Moderate' | 'High' | 'Critical';
export type PriorityClass = 'IMMEDIATE' | 'SHORT-TERM' | 'MEDIUM-TERM';

export interface RiskWeights {
  flood: number;
  landslide: number;
  cloudburst: number;
  coastalErosion: number;
  historicalImpact: number;
  populationExposure: number;
  geographicVulnerability: number;
  redZoneThreshold: number;
  lowThreshold: number;
  moderateThreshold: number;
  highThreshold: number;
}

export interface RiskFactors {
  flood: number;
  landslide: number;
  cloudburst: number;
  coastalErosion: number;
  historicalImpact: number;
  populationExposure: number;
  geographicVulnerability: number;
}

export interface RiskResult {
  score: number;
  riskClass: RiskClass;
  contributions: Record<keyof RiskFactors, number>;
  explanation: string;
}

export interface VulnerabilityInput {
  totalPopulation: number;
  children: number;
  elderly: number;
  disability: number;
  medical: number;
  roadAccess: number;
  hospitalAccess: number;
  infrastructure: number;
  historicalImpact: number;
}

export interface VulnerabilityResult {
  score: number;
  factors: { label: string; value: number; weight: number; explanation: string }[];
  explanation: string;
}

export interface PriorityResult {
  score: number;
  priority: PriorityClass;
  explanation: string;
}

const clamp = (value: number): number => Math.max(0, Math.min(100, value));
const safeRatio = (value: number, total: number): number => total > 0 ? clamp((value / total) * 100) : 0;

export function classifyRisk(score: number, weights: RiskWeights): RiskClass {
  if (score > weights.highThreshold) return 'Critical';
  if (score >= weights.moderateThreshold + 1) return 'High';
  if (score >= weights.lowThreshold + 1) return 'Moderate';
  return 'Low';
}

export function calculateRisk(factors: RiskFactors, weights: RiskWeights): RiskResult {
  const contributions = {
    flood: clamp(factors.flood) * weights.flood,
    landslide: clamp(factors.landslide) * weights.landslide,
    cloudburst: clamp(factors.cloudburst) * weights.cloudburst,
    coastalErosion: clamp(factors.coastalErosion) * weights.coastalErosion,
    historicalImpact: clamp(factors.historicalImpact) * weights.historicalImpact,
    populationExposure: clamp(factors.populationExposure) * weights.populationExposure,
    geographicVulnerability: clamp(factors.geographicVulnerability) * weights.geographicVulnerability,
  };
  const score = clamp(Object.values(contributions).reduce((sum, value) => sum + value, 0));
  const riskClass = classifyRisk(score, weights);
  const ordered = Object.entries(contributions).sort(([, first], [, second]) => second - first);
  const drivers = ordered.slice(0, 3).map(([key]) => key.replace(/([A-Z])/g, ' $1').toLowerCase());
  return {
    score,
    riskClass,
    contributions,
    explanation: `${riskClass} risk is primarily driven by ${drivers.join(', ')}. The score combines seven normalized factors using the active regional weights.`,
  };
}

export function calculateHistoricalImpact(events: { impactScore: number; eventType: string }[]): { score: number; eventCount: number; averageImpact: number; hazardMix: string; explanation: string } {
  if (events.length === 0) return { score: 0, eventCount: 0, averageImpact: 0, hazardMix: 'No recorded events', explanation: 'No historical disaster events are linked to this habitation.' };
  const averageImpact = events.reduce((sum, event) => sum + clamp(event.impactScore), 0) / events.length;
  const recencyAdjusted = clamp(averageImpact * 0.7 + Math.min(events.length * 5, 30));
  const hazardMix = [...new Set(events.map((event) => event.eventType))].join(', ');
  return { score: recencyAdjusted, eventCount: events.length, averageImpact, hazardMix, explanation: `${events.length} historical event${events.length === 1 ? '' : 's'} recorded across ${hazardMix}. Average impact was ${Math.round(averageImpact)}/100.` };
}

export function calculateVulnerability(input: VulnerabilityInput): VulnerabilityResult {
  const factors = [
    { label: 'Children', value: safeRatio(input.children, input.totalPopulation), weight: 0.18, explanation: 'Share of residents under the child vulnerability band.' },
    { label: 'Elderly', value: safeRatio(input.elderly, input.totalPopulation), weight: 0.14, explanation: 'Share of residents requiring additional evacuation support.' },
    { label: 'Disability', value: safeRatio(input.disability, input.totalPopulation), weight: 0.14, explanation: 'Share of residents with mobility or accessibility needs.' },
    { label: 'Medical vulnerability', value: safeRatio(input.medical, input.totalPopulation), weight: 0.14, explanation: 'Share of residents with elevated medical support needs.' },
    { label: 'Road access gap', value: 100 - clamp(input.roadAccess), weight: 0.10, explanation: 'Reduced access increases evacuation and relief difficulty.' },
    { label: 'Hospital access gap', value: 100 - clamp(input.hospitalAccess), weight: 0.10, explanation: 'Distance or limited access to healthcare increases exposure.' },
    { label: 'Infrastructure gap', value: 100 - clamp(input.infrastructure), weight: 0.08, explanation: 'Lower infrastructure condition increases disruption risk.' },
    { label: 'Historical impact', value: clamp(input.historicalImpact), weight: 0.12, explanation: 'Previous disaster impact indicates local susceptibility.' },
  ];
  const score = clamp(factors.reduce((sum, factor) => sum + factor.value * factor.weight, 0));
  const drivers = [...factors].sort((first, second) => second.value * second.weight - first.value * first.weight).slice(0, 2).map((factor) => factor.label.toLowerCase());
  return { score, factors, explanation: `Vulnerability is ${Math.round(score)}/100, with the strongest contributors being ${drivers.join(' and ')}.` };
}

export function calculatePriority(input: { risk: number; vulnerability: number; populationExposure: number; historicalImpact: number; accessibility: number }): PriorityResult {
  const score = clamp(input.risk * 0.35 + input.vulnerability * 0.30 + input.populationExposure * 0.15 + input.historicalImpact * 0.10 + (100 - clamp(input.accessibility)) * 0.10);
  const priority: PriorityClass = score >= 70 ? 'IMMEDIATE' : score >= 48 ? 'SHORT-TERM' : 'MEDIUM-TERM';
  const action = priority === 'IMMEDIATE' ? 'requires immediate relocation planning' : priority === 'SHORT-TERM' ? 'should enter the short-term relocation pipeline' : 'should remain in medium-term preparedness planning';
  return { score, priority, explanation: `Priority score ${Math.round(score)}/100 means this habitation ${action}. Risk and vulnerability carry the greatest weight in the decision.` };
}
