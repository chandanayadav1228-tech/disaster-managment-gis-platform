import type { Incident, IncidentSeverity, Resource } from '@/lib/supabase';

export type RiskBand = 'low' | 'guarded' | 'high' | 'red';
export type IntelligenceFactor = { label: string; value: string; contribution: number; explanation: string };
export type HazardRisk = { area: string; score: number; band: RiskBand; incidents: Incident[]; factors: IntelligenceFactor[]; hazardTypes: string[]; affectedPeople: number };
export type VulnerabilityScore = { area: string; score: number; band: RiskBand; factors: IntelligenceFactor[] };
export type HistoricalSummary = { total: number; resolved: number; active: number; byType: { label: string; count: number; share: number }[]; bySeverity: { label: string; count: number; share: number }[]; averageAffected: number };
export type RelocationPriority = { area: string; score: number; priority: 'immediate' | 'planned' | 'monitor'; reason: string; factors: IntelligenceFactor[]; affectedPeople: number; availableCapacity: number };

const severityPoints: Record<IncidentSeverity, number> = { low: 15, medium: 35, high: 60, critical: 85 };
const bandFor = (score: number): RiskBand => score >= 70 ? 'red' : score >= 45 ? 'high' : score >= 25 ? 'guarded' : 'low';
const titleCase = (value: string) => value.replace(/\b\w/g, (letter) => letter.toUpperCase());

export function areaForIncident(incident: Incident): string {
  const location = incident.location_name?.trim();
  if (location) return location.split(',')[0].trim();
  return incident.title.split(/[-–—]/)[0].trim();
}

export function scoreIncident(incident: Incident): { score: number; factors: IntelligenceFactor[] } {
  const severity = severityPoints[incident.severity];
  const people = Math.min(20, Math.round(Math.log10(Math.max(incident.affected_people, 0) + 1) * 5));
  const active = incident.status === 'active' ? 10 : incident.status === 'contained' ? 4 : 0;
  const factors: IntelligenceFactor[] = [
    { label: 'Hazard severity', value: titleCase(incident.severity), contribution: severity, explanation: `${titleCase(incident.severity)} incidents carry a ${severity}/85 base hazard weight.` },
    { label: 'Population exposure', value: `${incident.affected_people.toLocaleString()} people`, contribution: people, explanation: `Affected population contributes ${people} points using a logarithmic exposure curve.` },
    { label: 'Operational status', value: titleCase(incident.status), contribution: active, explanation: `${titleCase(incident.status)} incidents add ${active} points because response conditions are not yet stable.` },
  ];
  return { score: Math.min(100, severity + people + active), factors };
}

export function calculateHazardRisks(incidents: Incident[]): HazardRisk[] {
  const areas = new Map<string, Incident[]>();
  incidents.filter((incident) => incident.status !== 'resolved').forEach((incident) => {
    const area = areaForIncident(incident);
    areas.set(area, [...(areas.get(area) ?? []), incident]);
  });
  return [...areas.entries()].map(([area, areaIncidents]) => {
    const incidentScores = areaIncidents.map(scoreIncident);
    const highest = Math.max(...incidentScores.map((result) => result.score));
    const combined = Math.min(100, highest + Math.min(25, (areaIncidents.length - 1) * 8) + Math.min(15, new Set(areaIncidents.map((incident) => incident.type)).size * 5));
    const hazardTypes = [...new Set(areaIncidents.map((incident) => titleCase(incident.type.replace('_', ' '))))];
    const factors: IntelligenceFactor[] = [
      { label: 'Highest incident score', value: `${highest}/100`, contribution: highest, explanation: 'The most severe active incident sets the starting point for this area.' },
      { label: 'Incident concentration', value: `${areaIncidents.length} active`, contribution: Math.min(25, (areaIncidents.length - 1) * 8), explanation: 'Additional active incidents increase pressure on the same response area.' },
      { label: 'Hazard diversity', value: `${hazardTypes.length} hazard type${hazardTypes.length === 1 ? '' : 's'}`, contribution: Math.min(15, hazardTypes.length * 5), explanation: 'Different simultaneous hazards add coordination complexity.' },
    ];
    return { area, score: combined, band: bandFor(combined), incidents: areaIncidents, factors, hazardTypes, affectedPeople: areaIncidents.reduce((sum, incident) => sum + incident.affected_people, 0) };
  }).sort((a, b) => b.score - a.score);
}

export function calculateVulnerability(areaRisk: HazardRisk, resources: Resource[]): VulnerabilityScore {
  const nearbyResources = resources.filter((resource) => areaRisk.incidents.some((incident) => distanceKm(incident.latitude, incident.longitude, resource.latitude, resource.longitude) <= 80));
  const capacity = nearbyResources.reduce((sum, resource) => sum + Math.max(0, resource.capacity - resource.occupancy), 0);
  const exposure = Math.min(45, Math.round(Math.log10(areaRisk.affectedPeople + 1) * 12));
  const capacityGap = areaRisk.affectedPeople > 0 ? Math.min(30, Math.round(Math.max(0, 1 - capacity / areaRisk.affectedPeople) * 30)) : 0;
  const unavailable = nearbyResources.filter((resource) => resource.status !== 'available').length;
  const readinessGap = Math.min(25, unavailable * 8);
  const score = Math.min(100, Math.round(exposure + capacityGap + readinessGap));
  return { area: areaRisk.area, score, band: bandFor(score), factors: [
    { label: 'Population exposure', value: `${areaRisk.affectedPeople.toLocaleString()} people`, contribution: exposure, explanation: `Affected people contribute ${exposure} points, capped at 45 for this model.` },
    { label: 'Shelter capacity gap', value: `${capacity.toLocaleString()} places available`, contribution: capacityGap, explanation: `Nearby resource capacity covers ${Math.min(100, areaRisk.affectedPeople ? Math.round(capacity / areaRisk.affectedPeople * 100) : 100)}% of estimated exposure.` },
    { label: 'Response readiness gap', value: `${unavailable} unavailable`, contribution: readinessGap, explanation: 'Full, deployed, or maintenance resources increase vulnerability because response options are constrained.' },
  ] };
}

export function summarizeHistory(incidents: Incident[]): HistoricalSummary {
  const total = incidents.length;
  const group = (values: string[]) => [...new Set(values)].map((label) => ({ label: titleCase(label.replace('_', ' ')), count: values.filter((value) => value === label).length, share: total ? Math.round(values.filter((value) => value === label).length / total * 100) : 0 })).sort((a, b) => b.count - a.count);
  return { total, resolved: incidents.filter((incident) => incident.status === 'resolved').length, active: incidents.filter((incident) => incident.status !== 'resolved').length, byType: group(incidents.map((incident) => incident.type)), bySeverity: group(incidents.map((incident) => incident.severity)), averageAffected: total ? Math.round(incidents.reduce((sum, incident) => sum + incident.affected_people, 0) / total) : 0 };
}

export function calculateRelocationPriorities(risks: HazardRisk[], vulnerabilities: VulnerabilityScore[], resources: Resource[]): RelocationPriority[] {
  return risks.map((risk) => {
    const vulnerability = vulnerabilities.find((item) => item.area === risk.area);
    const nearby = resources.filter((resource) => risk.incidents.some((incident) => distanceKm(incident.latitude, incident.longitude, resource.latitude, resource.longitude) <= 80));
    const availableCapacity = nearby.reduce((sum, resource) => sum + Math.max(0, resource.capacity - resource.occupancy), 0);
    const urgency = Math.round(risk.score * .55 + (vulnerability?.score ?? 0) * .45);
    const priority: RelocationPriority['priority'] = urgency >= 70 ? 'immediate' : urgency >= 45 ? 'planned' : 'monitor';
    const reason = priority === 'immediate' ? 'Move exposed residents toward available safe capacity now.' : priority === 'planned' ? 'Prepare transport and receiving capacity while monitoring conditions.' : 'Continue monitoring; no immediate relocation trigger from current data.';
    return { area: risk.area, score: urgency, priority, reason, factors: [
      { label: 'Multi-hazard risk', value: `${risk.score}/100`, contribution: Math.round(risk.score * .55), explanation: 'Risk contributes 55% of the relocation decision.' },
      { label: 'Vulnerability', value: `${vulnerability?.score ?? 0}/100`, contribution: Math.round((vulnerability?.score ?? 0) * .45), explanation: 'Vulnerability contributes 45% of the relocation decision.' },
      { label: 'Receiving capacity', value: `${availableCapacity.toLocaleString()} places`, contribution: 0, explanation: 'Capacity is shown as an operational constraint and is not allowed to artificially reduce urgency.' },
    ], affectedPeople: risk.affectedPeople, availableCapacity };
  }).sort((a, b) => b.score - a.score);
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
