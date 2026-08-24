/*
# SafeHabitat AI — Core PostGIS Domain Schema

1. Purpose
   Creates the durable domain tables for regions, habitations, hazards, population, disaster
   history, risk results, relocation sites, capacity, recommendations, alerts, scenarios,
   audit records, and configurable risk weights.

2. Spatial data
   Geometry uses WGS84 (SRID 4326), with GIST spatial indexes for map and proximity queries.

3. Data integrity
   Foreign keys connect all domain records. Scores are constrained to 0-100. Capacity data
   stores explicit surplus/deficit and violation status.

4. Security
   RLS and role-based policies are applied in migration 0002 after these tables exist.
   Synthetic records are identified with source_type='synthetic' and region is_demo=true.
*/

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, state_name text NOT NULL,
  district_name text, code text UNIQUE NOT NULL, boundary geometry(POLYGON,4326),
  is_demo boolean NOT NULL DEFAULT true, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_regions_boundary ON regions USING GIST(boundary);
CREATE INDEX IF NOT EXISTS idx_regions_code ON regions(code);

CREATE TABLE IF NOT EXISTS habitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), region_id uuid NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  name text NOT NULL, habitation_code text NOT NULL, location geometry(POINT,4326) NOT NULL,
  boundary geometry(POLYGON,4326), elevation_m numeric, population_total integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_habitations_region ON habitations(region_id);
CREATE INDEX IF NOT EXISTS idx_habitations_location ON habitations USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_habitations_boundary ON habitations USING GIST(boundary);
CREATE INDEX IF NOT EXISTS idx_habitations_code ON habitations(habitation_code);

CREATE TABLE IF NOT EXISTS population (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), habitation_id uuid NOT NULL REFERENCES habitations(id) ON DELETE CASCADE,
  total_count integer NOT NULL DEFAULT 0, children_count integer NOT NULL DEFAULT 0, elderly_count integer NOT NULL DEFAULT 0,
  disability_count integer NOT NULL DEFAULT 0, medical_vulnerability_count integer NOT NULL DEFAULT 0,
  female_headed_household_count integer NOT NULL DEFAULT 0, density_per_sq_km numeric,
  source_type text NOT NULL DEFAULT 'synthetic', created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_population_habitation ON population(habitation_id);

CREATE TABLE IF NOT EXISTS vulnerable_population (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), habitation_id uuid NOT NULL REFERENCES habitations(id) ON DELETE CASCADE,
  children_count integer NOT NULL DEFAULT 0, elderly_count integer NOT NULL DEFAULT 0, disability_count integer NOT NULL DEFAULT 0,
  medical_vulnerability_count integer NOT NULL DEFAULT 0, road_access_score numeric NOT NULL DEFAULT 0,
  hospital_access_score numeric NOT NULL DEFAULT 0, infrastructure_condition_score numeric NOT NULL DEFAULT 0,
  vulnerability_score numeric NOT NULL DEFAULT 0, calculation_version text NOT NULL DEFAULT 'v1', created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vulnerable_population_habitation ON vulnerable_population(habitation_id);

CREATE TABLE IF NOT EXISTS hazards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), region_id uuid NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  hazard_type text NOT NULL CHECK (hazard_type IN ('flood','landslide','cloudburst','coastal_erosion')),
  name text NOT NULL, severity numeric NOT NULL DEFAULT 50 CHECK (severity BETWEEN 0 AND 100),
  geometry geometry(MULTIPOLYGON,4326), source_type text NOT NULL DEFAULT 'synthetic', is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hazards_region ON hazards(region_id);
CREATE INDEX IF NOT EXISTS idx_hazards_geometry ON hazards USING GIST(geometry);
CREATE INDEX IF NOT EXISTS idx_hazards_type ON hazards(hazard_type);

CREATE TABLE IF NOT EXISTS hazard_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), region_id uuid NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  hazard_id uuid REFERENCES hazards(id) ON DELETE SET NULL, event_date date NOT NULL,
  severity numeric NOT NULL DEFAULT 50 CHECK (severity BETWEEN 0 AND 100), affected_area_sq_km numeric,
  rainfall_mm numeric, estimated_affected_population integer, geometry geometry(POLYGON,4326),
  source_type text NOT NULL DEFAULT 'synthetic', created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hazard_events_region ON hazard_events(region_id);
CREATE INDEX IF NOT EXISTS idx_hazard_events_geometry ON hazard_events USING GIST(geometry);
CREATE INDEX IF NOT EXISTS idx_hazard_events_date ON hazard_events(event_date);

CREATE TABLE IF NOT EXISTS disaster_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), region_id uuid NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  habitation_id uuid REFERENCES habitations(id) ON DELETE SET NULL, event_type text NOT NULL, event_date date NOT NULL,
  deaths integer NOT NULL DEFAULT 0, injuries integer NOT NULL DEFAULT 0, houses_damaged integer NOT NULL DEFAULT 0,
  infrastructure_damage_score numeric NOT NULL DEFAULT 0 CHECK (infrastructure_damage_score BETWEEN 0 AND 100),
  impact_score numeric NOT NULL DEFAULT 0 CHECK (impact_score BETWEEN 0 AND 100), geometry geometry(POINT,4326), created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_disaster_history_region ON disaster_history(region_id);
CREATE INDEX IF NOT EXISTS idx_disaster_history_habitation ON disaster_history(habitation_id);
CREATE INDEX IF NOT EXISTS idx_disaster_history_geometry ON disaster_history USING GIST(geometry);
CREATE INDEX IF NOT EXISTS idx_disaster_history_date ON disaster_history(event_date);

CREATE TABLE IF NOT EXISTS scenario_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), region_id uuid NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, scenario_name text NOT NULL,
  rainfall_intensity_multiplier numeric NOT NULL DEFAULT 1, hazard_severity_multiplier numeric NOT NULL DEFAULT 1,
  available_capacity_multiplier numeric NOT NULL DEFAULT 1, road_accessibility_multiplier numeric NOT NULL DEFAULT 1,
  affected_population_multiplier numeric NOT NULL DEFAULT 1, before_results jsonb, after_results jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','completed','failed')), created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_scenario_runs_region ON scenario_runs(region_id);
CREATE INDEX IF NOT EXISTS idx_scenario_runs_status ON scenario_runs(status);

CREATE TABLE IF NOT EXISTS risk_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), habitation_id uuid NOT NULL REFERENCES habitations(id) ON DELETE CASCADE,
  scenario_run_id uuid REFERENCES scenario_runs(id) ON DELETE SET NULL, flood_risk numeric NOT NULL DEFAULT 0,
  landslide_risk numeric NOT NULL DEFAULT 0, cloudburst_risk numeric NOT NULL DEFAULT 0, coastal_erosion_risk numeric NOT NULL DEFAULT 0,
  historical_impact numeric NOT NULL DEFAULT 0, population_exposure numeric NOT NULL DEFAULT 0,
  geographic_vulnerability numeric NOT NULL DEFAULT 0, final_risk_score numeric NOT NULL DEFAULT 0 CHECK (final_risk_score BETWEEN 0 AND 100),
  risk_class text NOT NULL DEFAULT 'Low', weight_configuration jsonb, calculation_version text NOT NULL DEFAULT 'v1', created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_habitation ON risk_assessments(habitation_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_scenario ON risk_assessments(scenario_run_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_class ON risk_assessments(risk_class);

CREATE TABLE IF NOT EXISTS red_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), region_id uuid NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  habitation_id uuid NOT NULL REFERENCES habitations(id) ON DELETE CASCADE, risk_assessment_id uuid REFERENCES risk_assessments(id) ON DELETE SET NULL,
  threshold_used numeric NOT NULL DEFAULT 80, risk_score numeric NOT NULL DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
  risk_class text NOT NULL DEFAULT 'Critical', geometry geometry(POLYGON,4326), created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_red_zones_region ON red_zones(region_id);
CREATE INDEX IF NOT EXISTS idx_red_zones_habitation ON red_zones(habitation_id);
CREATE INDEX IF NOT EXISTS idx_red_zones_geometry ON red_zones USING GIST(geometry);

CREATE TABLE IF NOT EXISTS relocation_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), region_id uuid NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  name text NOT NULL, site_code text NOT NULL, location geometry(POINT,4326) NOT NULL, boundary geometry(POLYGON,4326),
  total_capacity integer NOT NULL DEFAULT 0, existing_population integer NOT NULL DEFAULT 0, available_capacity integer NOT NULL DEFAULT 0,
  hazard_exposure_score numeric NOT NULL DEFAULT 0 CHECK (hazard_exposure_score BETWEEN 0 AND 100),
  road_access_score numeric NOT NULL DEFAULT 0 CHECK (road_access_score BETWEEN 0 AND 100),
  healthcare_score numeric NOT NULL DEFAULT 0 CHECK (healthcare_score BETWEEN 0 AND 100),
  water_score numeric NOT NULL DEFAULT 0 CHECK (water_score BETWEEN 0 AND 100),
  electricity_score numeric NOT NULL DEFAULT 0 CHECK (electricity_score BETWEEN 0 AND 100),
  sanitation_score numeric NOT NULL DEFAULT 0 CHECK (sanitation_score BETWEEN 0 AND 100),
  emergency_services_score numeric NOT NULL DEFAULT 0 CHECK (emergency_services_score BETWEEN 0 AND 100),
  existing_population_score numeric NOT NULL DEFAULT 0 CHECK (existing_population_score BETWEEN 0 AND 100),
  is_approved boolean NOT NULL DEFAULT false, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_relocation_sites_region ON relocation_sites(region_id);
CREATE INDEX IF NOT EXISTS idx_relocation_sites_location ON relocation_sites USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_relocation_sites_boundary ON relocation_sites USING GIST(boundary);

CREATE TABLE IF NOT EXISTS infrastructure (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), region_id uuid NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  asset_type text NOT NULL, name text NOT NULL, condition_score numeric NOT NULL DEFAULT 50 CHECK (condition_score BETWEEN 0 AND 100),
  location geometry(POINT,4326), capacity integer, is_operational boolean NOT NULL DEFAULT true, created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_infrastructure_region ON infrastructure(region_id);
CREATE INDEX IF NOT EXISTS idx_infrastructure_location ON infrastructure USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_infrastructure_type ON infrastructure(asset_type);

CREATE TABLE IF NOT EXISTS roads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), region_id uuid NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  name text NOT NULL, road_class text NOT NULL DEFAULT 'district', condition_score numeric NOT NULL DEFAULT 50 CHECK (condition_score BETWEEN 0 AND 100),
  accessibility_score numeric NOT NULL DEFAULT 50 CHECK (accessibility_score BETWEEN 0 AND 100), geometry geometry(LINESTRING,4326),
  is_operational boolean NOT NULL DEFAULT true, created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_roads_region ON roads(region_id);
CREATE INDEX IF NOT EXISTS idx_roads_geometry ON roads USING GIST(geometry);

CREATE TABLE IF NOT EXISTS hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), region_id uuid NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  name text NOT NULL, location geometry(POINT,4326) NOT NULL, bed_capacity integer NOT NULL DEFAULT 0,
  emergency_capacity integer NOT NULL DEFAULT 0, accessibility_score numeric NOT NULL DEFAULT 50 CHECK (accessibility_score BETWEEN 0 AND 100),
  is_operational boolean NOT NULL DEFAULT true, created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hospitals_region ON hospitals(region_id);
CREATE INDEX IF NOT EXISTS idx_hospitals_location ON hospitals USING GIST(location);

CREATE TABLE IF NOT EXISTS shelters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), region_id uuid NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  name text NOT NULL, location geometry(POINT,4326) NOT NULL, capacity integer NOT NULL DEFAULT 0,
  current_occupancy integer NOT NULL DEFAULT 0, condition_score numeric NOT NULL DEFAULT 50 CHECK (condition_score BETWEEN 0 AND 100),
  is_operational boolean NOT NULL DEFAULT true, created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_shelters_region ON shelters(region_id);
CREATE INDEX IF NOT EXISTS idx_shelters_location ON shelters USING GIST(location);

CREATE TABLE IF NOT EXISTS capacity_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), relocation_site_id uuid NOT NULL REFERENCES relocation_sites(id) ON DELETE CASCADE,
  scenario_run_id uuid REFERENCES scenario_runs(id) ON DELETE SET NULL, total_capacity integer NOT NULL DEFAULT 0,
  existing_population integer NOT NULL DEFAULT 0, required_population integer NOT NULL DEFAULT 0, available_capacity integer NOT NULL DEFAULT 0,
  remaining_capacity integer NOT NULL DEFAULT 0, capacity_surplus_deficit integer NOT NULL DEFAULT 0, capacity_violation boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_capacity_assessments_site ON capacity_assessments(relocation_site_id);
CREATE INDEX IF NOT EXISTS idx_capacity_assessments_scenario ON capacity_assessments(scenario_run_id);

CREATE TABLE IF NOT EXISTS relocation_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), habitation_id uuid NOT NULL REFERENCES habitations(id) ON DELETE CASCADE,
  relocation_site_id uuid NOT NULL REFERENCES relocation_sites(id) ON DELETE CASCADE, scenario_run_id uuid REFERENCES scenario_runs(id) ON DELETE SET NULL,
  allocated_population integer NOT NULL DEFAULT 0, suitability_score numeric NOT NULL DEFAULT 0 CHECK (suitability_score BETWEEN 0 AND 100),
  priority_class text NOT NULL DEFAULT 'MEDIUM-TERM', travel_distance_km numeric, recommendation_rank integer NOT NULL DEFAULT 1,
  explanation text, important_factors jsonb, is_official_decision boolean NOT NULL DEFAULT false, created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_relocation_recommendations_habitation ON relocation_recommendations(habitation_id);
CREATE INDEX IF NOT EXISTS idx_relocation_recommendations_site ON relocation_recommendations(relocation_site_id);
CREATE INDEX IF NOT EXISTS idx_relocation_recommendations_scenario ON relocation_recommendations(scenario_run_id);

CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), region_id uuid NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  alert_type text NOT NULL, severity text NOT NULL CHECK (severity IN ('info','warning','critical')), title text NOT NULL, message text NOT NULL,
  related_habitation_id uuid REFERENCES habitations(id) ON DELETE SET NULL, related_site_id uuid REFERENCES relocation_sites(id) ON DELETE SET NULL,
  is_acknowledged boolean NOT NULL DEFAULT false, created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_alerts_region ON alerts(region_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(is_acknowledged);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL, resource_type text NOT NULL, resource_id text, metadata jsonb, created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type,resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

CREATE TABLE IF NOT EXISTS risk_configuration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), region_id uuid REFERENCES regions(id) ON DELETE CASCADE,
  flood_weight numeric NOT NULL DEFAULT 0.25 CHECK (flood_weight BETWEEN 0 AND 1), landslide_weight numeric NOT NULL DEFAULT 0.20 CHECK (landslide_weight BETWEEN 0 AND 1),
  cloudburst_weight numeric NOT NULL DEFAULT 0.15 CHECK (cloudburst_weight BETWEEN 0 AND 1), coastal_erosion_weight numeric NOT NULL DEFAULT 0.10 CHECK (coastal_erosion_weight BETWEEN 0 AND 1),
  historical_impact_weight numeric NOT NULL DEFAULT 0.10 CHECK (historical_impact_weight BETWEEN 0 AND 1), population_exposure_weight numeric NOT NULL DEFAULT 0.10 CHECK (population_exposure_weight BETWEEN 0 AND 1),
  geographic_vulnerability_weight numeric NOT NULL DEFAULT 0.10 CHECK (geographic_vulnerability_weight BETWEEN 0 AND 1), red_zone_threshold numeric NOT NULL DEFAULT 80 CHECK (red_zone_threshold BETWEEN 0 AND 100),
  low_threshold numeric NOT NULL DEFAULT 30 CHECK (low_threshold BETWEEN 0 AND 100), moderate_threshold numeric NOT NULL DEFAULT 60 CHECK (moderate_threshold BETWEEN 0 AND 100),
  high_threshold numeric NOT NULL DEFAULT 80 CHECK (high_threshold BETWEEN 0 AND 100), config_version text NOT NULL DEFAULT 'v1', effective_date timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_risk_configuration_region ON risk_configuration(region_id);
