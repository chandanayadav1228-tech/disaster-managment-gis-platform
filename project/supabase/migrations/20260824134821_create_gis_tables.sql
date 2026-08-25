/*
# Disaster Management GIS Platform — Core Tables

## Purpose
Creates the core spatial database tables for a disaster management GIS platform covering the
Uttarakhand Himalayan region (floods, landslides, earthquakes). All geographic features are
stored as PostGIS geography columns for accurate spatial calculations.

## New Tables
1. `habitations` — settlements/villages with population and vulnerable-group counts
2. `hazard_zones` — polygon areas of known hazard exposure (flood/landslide/earthquake/cyclone)
3. `roads` — transport network lines (highway/main/local)
4. `hospitals` — medical facilities
5. `shelters` — emergency shelter sites
6. `relocation_sites` — designated relocation grounds

## Security
- RLS enabled on all tables with public read access (TO anon, authenticated)
- This is a shared public dashboard with no login required

## Notes
1. Requires the postgis extension for geography types and spatial functions
2. Coordinates use SRID 4326 (WGS84 lat/lng)
*/

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- Habitations (villages / settlements)
-- ============================================================
CREATE TABLE IF NOT EXISTS habitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  district text NOT NULL,
  population integer NOT NULL DEFAULT 0,
  children integer NOT NULL DEFAULT 0,
  elderly integer NOT NULL DEFAULT 0,
  disabled integer NOT NULL DEFAULT 0,
  location geography(Point, 4326) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- Hazard Zones (polygon areas)
-- ============================================================
CREATE TABLE IF NOT EXISTS hazard_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  hazard_type text NOT NULL CHECK (hazard_type IN ('flood','landslide','earthquake','cyclone')),
  severity integer NOT NULL CHECK (severity BETWEEN 1 AND 5),
  description text,
  boundary geography(Polygon, 4326) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- Roads (transport network)
-- ============================================================
CREATE TABLE IF NOT EXISTS roads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  road_type text NOT NULL CHECK (road_type IN ('highway','main','local')),
  path geography(LineString, 4326) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- Hospitals
-- ============================================================
CREATE TABLE IF NOT EXISTS hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  capacity integer NOT NULL DEFAULT 0,
  location geography(Point, 4326) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- Shelters
-- ============================================================
CREATE TABLE IF NOT EXISTS shelters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  capacity integer NOT NULL DEFAULT 0,
  location geography(Point, 4326) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- Relocation Sites
-- ============================================================
CREATE TABLE IF NOT EXISTS relocation_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  capacity integer NOT NULL DEFAULT 0,
  location geography(Point, 4326) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- Row Level Security — public read (shared dashboard, no login)
-- ============================================================
ALTER TABLE habitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hazard_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE roads ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE relocation_sites ENABLE ROW LEVEL SECURITY;

-- Public read policies
DROP POLICY IF EXISTS "public_read_habitations" ON habitations;
CREATE POLICY "public_read_habitations" ON habitations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_hazard_zones" ON hazard_zones;
CREATE POLICY "public_read_hazard_zones" ON hazard_zones FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_roads" ON roads;
CREATE POLICY "public_read_read_roads" ON roads FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_hospitals" ON hospitals;
CREATE POLICY "public_read_hospitals" ON hospitals FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_shelters" ON shelters;
CREATE POLICY "public_read_shelters" ON shelters FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_relocation_sites" ON relocation_sites;
CREATE POLICY "public_read_relocation_sites" ON relocation_sites FOR SELECT
  TO anon, authenticated USING (true);
