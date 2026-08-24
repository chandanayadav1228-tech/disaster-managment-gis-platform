import { describe, expect, it } from 'vitest';
import { calculateHistoricalImpact, calculatePriority, calculateRisk, calculateVulnerability, type RiskWeights } from '@/lib/intelligence';

const weights: RiskWeights = {
  flood: 0.25, landslide: 0.2, cloudburst: 0.15, coastalErosion: 0.1,
  historicalImpact: 0.1, populationExposure: 0.1, geographicVulnerability: 0.1,
  redZoneThreshold: 80, lowThreshold: 30, moderateThreshold: 60, highThreshold: 80,
};

describe('multi-hazard risk engine', () => {
  it('calculates a weighted score and exposes the contribution by factor', () => {
    const result = calculateRisk({ flood: 100, landslide: 50, cloudburst: 0, coastalErosion: 0, historicalImpact: 0, populationExposure: 0, geographicVulnerability: 0 }, weights);
    expect(result.score).toBe(35);
    expect(result.contributions.flood).toBe(25);
    expect(result.contributions.landslide).toBe(10);
    expect(result.riskClass).toBe('Moderate');
  });

  it('keeps the configured boundary at high until the critical band begins', () => {
    const result = calculateRisk({ flood: 100, landslide: 100, cloudburst: 100, coastalErosion: 100, historicalImpact: 100, populationExposure: 100, geographicVulnerability: 0 }, weights);
    expect(result.score).toBe(90);
    expect(result.riskClass).toBe('Critical');
    const boundary = calculateRisk({ flood: 100, landslide: 100, cloudburst: 100, coastalErosion: 0, historicalImpact: 0, populationExposure: 0, geographicVulnerability: 0 }, weights);
    expect(boundary.score).toBe(60);
    expect(boundary.riskClass).toBe('Moderate');
  });

  it('clamps invalid factor values into the supported range', () => {
    const result = calculateRisk({ flood: 200, landslide: -50, cloudburst: 0, coastalErosion: 0, historicalImpact: 0, populationExposure: 0, geographicVulnerability: 0 }, weights);
    expect(result.score).toBe(25);
    expect(result.contributions.landslide).toBe(0);
  });
});

describe('historical disaster analysis', () => {
  it('returns a safe empty result when no events exist', () => {
    expect(calculateHistoricalImpact([])).toMatchObject({ score: 0, eventCount: 0, averageImpact: 0 });
  });

  it('combines event impact and event count', () => {
    const result = calculateHistoricalImpact([{ impactScore: 80, eventType: 'flood' }, { impactScore: 40, eventType: 'landslide' }]);
    expect(result.eventCount).toBe(2);
    expect(result.averageImpact).toBe(60);
    expect(result.score).toBe(52);
    expect(result.hazardMix).toContain('flood');
  });
});

describe('vulnerability engine', () => {
  it('produces a bounded score and named factors', () => {
    const result = calculateVulnerability({ totalPopulation: 1000, children: 200, elderly: 100, disability: 30, medical: 50, roadAccess: 40, hospitalAccess: 50, infrastructure: 60, historicalImpact: 70 });
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.factors).toHaveLength(8);
    expect(result.factors.map((factor) => factor.label)).toContain('Road access gap');
  });

  it('does not divide by zero for missing population', () => {
    const result = calculateVulnerability({ totalPopulation: 0, children: 20, elderly: 10, disability: 5, medical: 5, roadAccess: 0, hospitalAccess: 0, infrastructure: 0, historicalImpact: 0 });
    expect(result.score).toBe(28);
  });
});

describe('relocation priority engine', () => {
  it('marks high combined exposure as immediate', () => {
    const result = calculatePriority({ risk: 90, vulnerability: 90, populationExposure: 80, historicalImpact: 75, accessibility: 20 });
    expect(result.priority).toBe('IMMEDIATE');
    expect(result.score).toBeGreaterThanOrEqual(70);
  });

  it('keeps low exposure in the medium-term queue', () => {
    const result = calculatePriority({ risk: 25, vulnerability: 20, populationExposure: 15, historicalImpact: 10, accessibility: 90 });
    expect(result.priority).toBe('MEDIUM-TERM');
  });
});
