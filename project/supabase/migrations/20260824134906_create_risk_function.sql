/*
# Disaster Management GIS Platform — Risk Calculation Function

## Purpose
Creates a PL/pgSQL function that computes real risk and vulnerability scores for every
habitation based on proximity to hazard zones, demographic vulnerability, and distance
to response facilities.

## Notes
1. Function uses SET search_path to public for reliable table resolution
2. Depends on tables created in the create_gis_tables migration
*/

CREATE OR REPLACE FUNCTION compute_habitation_risk()
RETURNS TABLE (
  habitation_id uuid,
  name text,
  district text,
  risk_score numeric,
  risk_category text,
  red_zone boolean,
  exposure_score numeric,
  vulnerability_score numeric,
  response_score numeric,
  nearest_hospital_m numeric,
  nearest_shelter_m numeric,
  affected_hazards text[]
)
LANGUAGE plpgsql
SET search_path TO public
AS $$
BEGIN
  RETURN QUERY
  WITH hab_exposure AS (
    SELECT
      h.id AS habitation_id,
      h.name,
      h.district,
      h.population,
      h.children,
      h.elderly,
      h.disabled,
      h.location,
      COALESCE(SUM(
        CASE
          WHEN ST_DWithin(h.location, z.boundary, 5000)
          THEN (z.severity::numeric / 5.0) *
               (1.0 - (ST_Distance(h.location, z.boundary) / 5000.0))
          ELSE 0
        END
      ), 0) AS exposure_raw,
      COALESCE(ARRAY_AGG(
        DISTINCT z.hazard_type
      ) FILTER (WHERE z.hazard_type IS NOT NULL AND ST_DWithin(h.location, z.boundary, 5000)),
      ARRAY[]::text[]
      ) AS affected_hazards
    FROM habitations h
    LEFT JOIN hazard_zones z ON ST_DWithin(h.location, z.boundary, 5000)
    GROUP BY h.id, h.name, h.district, h.population, h.children, h.elderly, h.disabled, h.location
  ),
  hab_response AS (
    SELECT
      he.habitation_id,
      he.name,
      he.district,
      he.population,
      he.children,
      he.elderly,
      he.disabled,
      he.location,
      he.exposure_raw,
      he.affected_hazards,
      (
        SELECT MIN(ST_Distance(he.location, hosp.location))
        FROM hospitals hosp
      ) AS nearest_hospital_m,
      (
        SELECT MIN(ST_Distance(he.location, sh.location))
        FROM shelters sh
      ) AS nearest_shelter_m
    FROM hab_exposure he
  )
  SELECT
    hr.habitation_id,
    hr.name,
    hr.district,
    LEAST(hr.exposure_raw * 100.0, 100.0) AS exposure_score,
    (
      LEAST((hr.children::numeric / NULLIF(hr.population, 0)) * 100.0 * 1.5, 50.0) +
      LEAST((hr.elderly::numeric / NULLIF(hr.population, 0)) * 100.0 * 2.0, 30.0) +
      LEAST((hr.disabled::numeric / NULLIF(hr.population, 0)) * 100.0 * 2.0, 20.0)
    ) AS vulnerability_score,
    LEAST(
      COALESCE(hr.nearest_hospital_m, 50000) / 500.0 +
      COALESCE(hr.nearest_shelter_m, 50000) / 500.0,
      100.0
    ) AS response_score,
    hr.nearest_hospital_m,
    hr.nearest_shelter_m,
    hr.affected_hazards
  FROM hab_response hr;
END;
$$;
