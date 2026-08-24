/*
# Disaster Management GIS Platform - Core Schema

## Overview
Creates the foundational schema for a single-tenant disaster management GIS platform.
No authentication required - this is a shared emergency operations dashboard where
multiple operators view and update the same incident/resource data.

## New Tables

### incidents
Disaster incidents reported by operators or citizens.
- id (uuid, PK)
- title (text, not null) - short description of the incident
- description (text) - detailed description
- type (text, not null) - category: flood, fire, earthquake, hurricane, landslide, chemical_spill, power_outage, medical, structural_collapse, other
- severity (text, not null) - low, medium, high, critical
- status (text, not null) - active, contained, resolved
- latitude (numeric, not null) - incident location lat
- longitude (numeric, not null) - incident location lng
- location_name (text) - human-readable location
- affected_people (int) - estimated number of people affected
- reported_by (text) - name of person reporting
- contact_phone (text) - contact phone number
- created_at (timestamptz, default now)
- updated_at (timestamptz, default now)

### resources
Emergency resources like shelters, hospitals, supply depots, rescue teams.
- id (uuid, PK)
- name (text, not null) - resource name
- type (text, not null) - shelter, hospital, supply_depot, rescue_team, fire_station, police_station, water_source, helipad
- status (text, not null) - available, full, deployed, maintenance
- latitude (numeric, not null)
- longitude (numeric, not null)
- address (text) - physical address
- capacity (int) - total capacity
- occupancy (int) - current occupancy
- contact_name (text)
- contact_phone (text)
- notes (text)
- created_at (timestamptz, default now)
- updated_at (timestamptz, default now)

### alerts
Emergency alert messages broadcast to the public or operators.
- id (uuid, PK)
- title (text, not null) - alert headline
- message (text, not null) - alert body
- severity (text, not null) - info, warning, severe, critical
- area (text) - affected area description
- is_active (boolean, default true) - whether alert is currently active
- expires_at (timestamptz) - when the alert expires
- created_at (timestamptz, default now)

## Security
- RLS enabled on all tables.
- Single-tenant (no auth): policies use TO anon, authenticated with USING (true)
  because all data is intentionally shared across operators.
- All four CRUD policies per table (select/insert/update/delete).
*/

-- Incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('flood', 'fire', 'earthquake', 'hurricane', 'landslide', 'chemical_spill', 'power_outage', 'medical', 'structural_collapse', 'other')),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL CHECK (status IN ('active', 'contained', 'resolved')),
  latitude numeric NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude numeric NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  location_name text,
  affected_people int DEFAULT 0,
  reported_by text,
  contact_phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_incidents" ON incidents;
CREATE POLICY "anon_select_incidents" ON incidents FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_incidents" ON incidents;
CREATE POLICY "anon_insert_incidents" ON incidents FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_incidents" ON incidents;
CREATE POLICY "anon_update_incidents" ON incidents FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_incidents" ON incidents;
CREATE POLICY "anon_delete_incidents" ON incidents FOR DELETE
  TO anon, authenticated USING (true);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('shelter', 'hospital', 'supply_depot', 'rescue_team', 'fire_station', 'police_station', 'water_source', 'helipad')),
  status text NOT NULL CHECK (status IN ('available', 'full', 'deployed', 'maintenance')),
  latitude numeric NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude numeric NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  address text,
  capacity int DEFAULT 0,
  occupancy int DEFAULT 0,
  contact_name text,
  contact_phone text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_resources" ON resources;
CREATE POLICY "anon_select_resources" ON resources FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_resources" ON resources;
CREATE POLICY "anon_insert_resources" ON resources FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_resources" ON resources;
CREATE POLICY "anon_update_resources" ON resources FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_resources" ON resources;
CREATE POLICY "anon_delete_resources" ON resources FOR DELETE
  TO anon, authenticated USING (true);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'severe', 'critical')),
  area text,
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_alerts" ON alerts;
CREATE POLICY "anon_select_alerts" ON alerts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_alerts" ON alerts;
CREATE POLICY "anon_insert_alerts" ON alerts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_alerts" ON alerts;
CREATE POLICY "anon_update_alerts" ON alerts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_alerts" ON alerts;
CREATE POLICY "anon_delete_alerts" ON alerts FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_type ON incidents(type);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);

CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);

-- updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_incidents_updated_at ON incidents;
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();