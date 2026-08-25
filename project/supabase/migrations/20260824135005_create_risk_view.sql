/*
# Disaster Management GIS Platform — Risk Materialized View

## Purpose
Creates a materialized view exposing computed risk per habitation, plus a refresh function.
The composite risk_score, risk_category, and red_zone flag are computed here from the
component scores returned by compute_habitation_risk().

## New Objects
1. `habitation_risk` — materialized view with composite risk_score, risk_category, red_zone
2. `refresh_risk()` — function to refresh the materialized view concurrently
*/

CREATE MATERIALIZED VIEW IF NOT EXISTS habitation_risk AS
SELECT
  c.habitation_id,
  c.name,
  c.district,
  c.population,
  c.children,
  c.elderly,
  c.disabled,
  LEAST(
    (c.exposure_score * 0.50 + c.vulnerability_score * 0.30 + c.response_score * 0.20),
    100.0
  ) AS risk_score,
  CASE
    WHEN (c.exposure_score * 0.50 + c.vulnerability_score * 0.30 + c.response_score * 0.20) >= 75 THEN 'Severe'
    WHEN (c.exposure_score * 0.50 + c.vulnerability_score * 0.30 + c.response_score * 0.20) >= 50 THEN 'High'
    WHEN (c.exposure_score * 0.50 + c.vulnerability_score * 0.30 + c.response_score * 0.20) >= 25 THEN 'Moderate'
    ELSE 'Low'
  END AS risk_category,
  (
    c.exposure_score >= 60 AND
    (c.exposure_score * 0.50 + c.vulnerability_score * 0.30 + c.response_score * 0.20) >= 65
  ) AS red_zone,
  c.exposure_score,
  c.vulnerability_score,
  c.response_score,
  c.nearest_hospital_m,
  c.nearest_shelter_m,
  c.affected_hazards
FROM compute_habitation_risk() c;

CREATE UNIQUE INDEX IF NOT EXISTS idx_habitation_risk_id ON habitation_risk(habitation_id);

CREATE OR REPLACE FUNCTION refresh_risk()
RETURNS void
LANGUAGE sql
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY habitation_risk;
$$;
