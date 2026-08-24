/*
# Disaster Management GIS Platform — Fix Risk Function Types

## Purpose
Fixes the compute_habitation_risk function so all return columns match the declared
numeric type. ST_Distance returns double precision, which must be cast to numeric.

## Changes
1. Drops and recreates compute_habitation_risk() with explicit ::numeric casts on
   all ST_Distance and ST_DWithin-derived values.
*/

DROP FUNCTION IF EXISTS compute_habitation_risk();

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
               (1.0::numeric - (ST_Distance(h.location, z.boundary)::numeric / 5000.0::numeric))
          ELSE 0::numeric
        END
      ), 0::numeric) AS exposure_raw,
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
        SELECT MIN(ST_Distance(he.location, hosp.location))::numeric
        FROM hospitals hosp
      ) AS nearest_hospital_m,
      (
        SELECT MIN(ST_Distance(he.location, sh.location))::numeric
        FROM shelters sh
      ) AS nearest_shelter_m
    FROM hab_exposure he
  )
  SELECT
    hr.habitation_id,
    hr.name,
    hr.district,
    LEAST(hr.exposure_raw * 100.0::numeric, 100.0::numeric) AS exposure_score,
    (
      LEAST((hr.children::numeric / NULLIF(hr.population, 0)) * 100.0::numeric * 1.5::numeric, 50.0::numeric) +
      LEAST((hr.elderly::numeric / NULLIF(hr.population, 0)) * 100.0::numeric * 2.0::numeric, 30.0::numeric) +
      LEAST((hr.disabled::numeric / NULLIF(hr.population, 0)) * 100.0::numeric * 2.0::numeric, 20.0::numeric)
    ) AS vulnerability_score,
    LEAST(
      COALESCE(hr.nearest_hospital_m, 50000::numeric) / 500.0::numeric +
      COALESCE(hr.nearest_shelter_m, 50000::numeric) / 500.0::numeric,
      100.0::numeric
    ) AS response_score,
    hr.nearest_hospital_m,
    hr.nearest_shelter_m,
    hr.affected_hazards
  FROM hab_response hr;
END;
$$;
