import type { Zone, Shelter, SimParams } from './types';

export const DEFAULT_PARAMS: SimParams = {
  rainfall: 45,
  hazardSeverity: 50,
  availableCapacityPct: 80,
  accessibilityPct: 75,
};

export const ZONES: Zone[] = [
  { id: 'Z1', name: 'Riverside North', population: 4200, baseHazard: 62, elevation: 410, area: 3.2, x: 22, y: 28, neighbors: ['Z2', 'Z6'] },
  { id: 'Z2', name: 'Old Town Basin', population: 8600, baseHazard: 78, elevation: 380, area: 2.8, x: 35, y: 35, neighbors: ['Z1', 'Z3', 'Z7'] },
  { id: 'Z3', name: 'Industrial Flats', population: 5100, baseHazard: 71, elevation: 395, area: 4.1, x: 48, y: 40, neighbors: ['Z2', 'Z4', 'Z8'] },
  { id: 'Z4', name: 'Harbor District', population: 6300, baseHazard: 68, elevation: 360, area: 2.5, x: 62, y: 46, neighbors: ['Z3', 'Z5', 'Z9'] },
  { id: 'Z5', name: 'Coastal Reach', population: 3800, baseHazard: 84, elevation: 340, area: 3.6, x: 76, y: 52, neighbors: ['Z4', 'Z10'] },
  { id: 'Z6', name: 'Highland Ridge', population: 2900, baseHazard: 38, elevation: 720, area: 5.2, x: 18, y: 50, neighbors: ['Z1', 'Z7', 'Z11'] },
  { id: 'Z7', name: 'Central Slopes', population: 4700, baseHazard: 54, elevation: 560, area: 3.9, x: 32, y: 56, neighbors: ['Z2', 'Z6', 'Z8', 'Z12'] },
  { id: 'Z8', name: 'Green Valley', population: 5200, baseHazard: 46, elevation: 540, area: 4.4, x: 46, y: 60, neighbors: ['Z3', 'Z7', 'Z9', 'Z13'] },
  { id: 'Z9', name: 'East Plains', population: 6100, baseHazard: 35, elevation: 580, area: 5.8, x: 60, y: 64, neighbors: ['Z4', 'Z8', 'Z10', 'Z14'] },
  { id: 'Z10', name: 'South Bay Lowlands', population: 7400, baseHazard: 81, elevation: 350, area: 3.1, x: 74, y: 68, neighbors: ['Z5', 'Z9', 'Z15'] },
  { id: 'Z11', name: 'Mountain Crest', population: 1800, baseHazard: 29, elevation: 890, area: 6.1, x: 20, y: 72, neighbors: ['Z6', 'Z12'] },
  { id: 'Z12', name: 'Foothill Estates', population: 3400, baseHazard: 42, elevation: 650, area: 4.0, x: 34, y: 76, neighbors: ['Z7', 'Z11', 'Z13'] },
  { id: 'Z13', name: 'Riverbend South', population: 5600, baseHazard: 66, elevation: 420, area: 3.3, x: 48, y: 80, neighbors: ['Z8', 'Z12', 'Z14'] },
  { id: 'Z14', name: 'Lakeside', population: 4300, baseHazard: 58, elevation: 460, area: 3.7, x: 62, y: 82, neighbors: ['Z9', 'Z13', 'Z15'] },
  { id: 'Z15', name: 'Delta Marsh', population: 6900, baseHazard: 88, elevation: 320, area: 2.9, x: 76, y: 84, neighbors: ['Z10', 'Z14'] },
];

export const SHELTERS: Shelter[] = [
  { id: 'S1', name: 'Highland Shelter A', baseCapacity: 1200, accessibility: 88, x: 20, y: 52, servesZones: ['Z1', 'Z2', 'Z6'] },
  { id: 'S2', name: 'Central Civic Hall', baseCapacity: 2500, accessibility: 72, x: 38, y: 50, servesZones: ['Z2', 'Z3', 'Z7', 'Z8'] },
  { id: 'S3', name: 'East Plains School', baseCapacity: 1800, accessibility: 80, x: 58, y: 60, servesZones: ['Z4', 'Z8', 'Z9', 'Z14'] },
  { id: 'S4', name: 'Mountain Refuge Camp', baseCapacity: 900, accessibility: 64, x: 22, y: 74, servesZones: ['Z6', 'Z11', 'Z12'] },
  { id: 'S5', name: 'South Delta Relief Center', baseCapacity: 2200, accessibility: 58, x: 70, y: 76, servesZones: ['Z5', 'Z10', 'Z13', 'Z14', 'Z15'] },
  { id: 'S6', name: 'Riverbend Community Hall', baseCapacity: 1500, accessibility: 70, x: 50, y: 72, servesZones: ['Z12', 'Z13', 'Z14'] },
];
