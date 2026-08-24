import { calculateHazardRisks, calculateRelocationPriorities, calculateVulnerability, scoreIncident, summarizeHistory } from '@/lib/intelligence';
import type { Incident, Resource } from '@/lib/supabase';

const incident = (overrides: Partial<Incident> = {}): Incident => ({ id: '1', title: 'Test', description: null, type: 'fire', severity: 'critical', status: 'active', latitude: 0, longitude: 0, location_name: 'Test Area', affected_people: 1000, reported_by: null, contact_phone: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...overrides });
const resource = (overrides: Partial<Resource> = {}): Resource => ({ id: 'r1', name: 'Shelter', type: 'shelter', status: 'available', latitude: 0, longitude: 0, address: null, capacity: 500, occupancy: 0, contact_name: null, contact_phone: null, notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...overrides });

export function runIntelligenceTests(): void {
  const critical = scoreIncident(incident());
  console.assert(critical.score === 100, 'Incident scores are capped at 100');
  console.assert(scoreIncident(incident({ severity: 'low', status: 'resolved', affected_people: 0 })).score === 15, 'Low resolved incident uses base severity only');
  const risks = calculateHazardRisks([incident(), incident({ id: '2', type: 'flood', location_name: 'Test Area', severity: 'high', affected_people: 50 })]);
  console.assert(risks[0].area === 'Test Area' && risks[0].hazardTypes.length === 2, 'Multi-hazard areas combine incident types');
  const vulnerability = calculateVulnerability(risks[0], [resource()]);
  console.assert(vulnerability.score > 0 && vulnerability.factors.length === 3, 'Vulnerability exposes three calculated factors');
  const history = summarizeHistory([incident(), incident({ id: '2', status: 'resolved', type: 'flood', severity: 'low' })]);
  console.assert(history.total === 2 && history.resolved === 1 && history.byType.length === 2, 'History aggregates totals, statuses, and types');
  const priorities = calculateRelocationPriorities(risks, [vulnerability], [resource()]);
  console.assert(priorities[0].score > 0 && priorities[0].factors.length === 3, 'Relocation priority combines risk and vulnerability');
}

runIntelligenceTests();
