/*
# Disaster Management GIS Platform — Frontend Views

## Purpose
Creates database views that expose spatial data in a format the React frontend can
consume directly via the Supabase JS client. Point geometries are split into lat/lng
numeric columns; polygon and line geometries are returned as GeoJSON text.

## New Views
1. `v_habitations` — habitations with lat/lng instead of geography type
2. `v_habitation_risk` — risk data joined with habitation coordinates
3. `v_hazard_zones` — hazard zones with GeoJSON polygon text
4. `v_roads` — roads with GeoJSON linestring text
5. `v_hospitals` — hospitals with lat/lng
6. `v_shelters` — shelters with lat/lng
7. `v_relocation_sites` — relocation sites with lat/lng

## Notes
1. These views are read-only and inherit RLS from their base tables
2. GeoJSON is returned as text and parsed with JSON.parse() in the frontend
*/

-- Habitations with lat/lng
CREATE OR REPLACE VIEW v_habitations AS
SELECT
  id,
  name,
  district,
  population,
  children,
  elderly,
  disabled,
  ST_Y(location::geometry) AS lat,
  ST_X(location::geometry) AS lng
FROM habitations;

-- Habitation risk with coordinates
CREATE OR REPLACE VIEW v_habitation_risk AS
SELECT
  r.habitation_id AS id,
  h.name,
  h.district,
  h.population,
  h.children,
  h.elderly,
  h.disabled,
  ST_Y(h.location::geometry) AS lat,
  ST_X(h.location::geometry) AS lng,
  r.risk_score,
  r.risk_category,
  r.red_zone,
  r.exposure_score,
  r.vulnerability_score,
  r.response_score,
  r.nearest_hospital_m,
  r.nearest_shelter_m,
  r.affected_hazards
FROM habitation_risk r
JOIN habitations h ON h.id = r.habitation_id;

-- Hazard zones with GeoJSON
CREATE OR REPLACE VIEW v_hazard_zones AS
SELECT
  id,
  name,
  hazard_type,
  severity,
  description,
  ST_AsGeoJSON(boundary::geometry) AS geojson
FROM hazard_zones;

-- Roads with GeoJSON
CREATE OR REPLACE VIEW v_roads AS
SELECT
  id,
  name,
  road_type,
  ST_AsGeoJSON(path::geometry) AS geojson
FROM roads;

-- Hospitals with lat/lng
CREATE OR REPLACE VIEW v_hospitals AS
SELECT
  id,
  name,
  capacity,
  ST_Y(location::geometry) AS lat,
  ST_X(location::geometry) AS lng
FROM hospitals;

-- Shelters with lat/lng
CREATE OR REPLACE VIEW v_shelters AS
SELECT
  id,
  name,
  capacity,
  ST_Y(location::geometry) AS lat,
  ST_X(location::geometry) AS lng
FROM shelters;

-- Relocation sites with lat/lng
CREATE OR REPLACE VIEW v_relocation_sites AS
SELECT
  id,
  name,
  capacity,
  ST_Y(location::geometry) AS lat,
  ST_X(location::geometry) AS lng
FROM relocation_sites;
