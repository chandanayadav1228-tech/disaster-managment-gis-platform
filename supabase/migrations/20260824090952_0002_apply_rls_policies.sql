/*
# SafeHabitat AI — Row-Level Security Policies

1. Purpose
   Applies least-privilege access rules to every SafeHabitat AI domain table.

2. Read access
   Authenticated government users can view shared operational data.

3. Write access
   Admins, state authorities, and district officers can create and manage operational data.
   Viewers are read-only.

4. Audit protection
   Audit logs can be read by authenticated users and inserted with the current user's ID.
   They cannot be updated or deleted through the application role.

5. Function security
   The elevated-role helper uses a fixed search path and is executable only by authenticated users.
*/

CREATE OR REPLACE FUNCTION public.is_elevated_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.is_active = true
      AND p.role IN ('admin', 'state_authority', 'district_officer')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_elevated_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_elevated_user() TO authenticated;

-- Regions
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "regions_select_authenticated" ON regions;
CREATE POLICY "regions_select_authenticated" ON regions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "regions_insert_elevated" ON regions;
CREATE POLICY "regions_insert_elevated" ON regions FOR INSERT TO authenticated WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "regions_update_elevated" ON regions;
CREATE POLICY "regions_update_elevated" ON regions FOR UPDATE TO authenticated USING (public.is_elevated_user()) WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "regions_delete_elevated" ON regions;
CREATE POLICY "regions_delete_elevated" ON regions FOR DELETE TO authenticated USING (public.is_elevated_user());

-- Habitations
ALTER TABLE habitations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "habitations_select_authenticated" ON habitations;
CREATE POLICY "habitations_select_authenticated" ON habitations FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "habitations_insert_elevated" ON habitations;
CREATE POLICY "habitations_insert_elevated" ON habitations FOR INSERT TO authenticated WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "habitations_update_elevated" ON habitations;
CREATE POLICY "habitations_update_elevated" ON habitations FOR UPDATE TO authenticated USING (public.is_elevated_user()) WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "habitations_delete_elevated" ON habitations;
CREATE POLICY "habitations_delete_elevated" ON habitations FOR DELETE TO authenticated USING (public.is_elevated_user());

-- Population
ALTER TABLE population ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "population_select_authenticated" ON population;
CREATE POLICY "population_select_authenticated" ON population FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "population_insert_elevated" ON population;
CREATE POLICY "population_insert_elevated" ON population FOR INSERT TO authenticated WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "population_update_elevated" ON population;
CREATE POLICY "population_update_elevated" ON population FOR UPDATE TO authenticated USING (public.is_elevated_user()) WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "population_delete_elevated" ON population;
CREATE POLICY "population_delete_elevated" ON population FOR DELETE TO authenticated USING (public.is_elevated_user());

-- Vulnerable population
ALTER TABLE vulnerable_population ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vulnerable_population_select_authenticated" ON vulnerable_population;
CREATE POLICY "vulnerable_population_select_authenticated" ON vulnerable_population FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "vulnerable_population_insert_elevated" ON vulnerable_population;
CREATE POLICY "vulnerable_population_insert_elevated" ON vulnerable_population FOR INSERT TO authenticated WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "vulnerable_population_update_elevated" ON vulnerable_population;
CREATE POLICY "vulnerable_population_update_elevated" ON vulnerable_population FOR UPDATE TO authenticated USING (public.is_elevated_user()) WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "vulnerable_population_delete_elevated" ON vulnerable_population;
CREATE POLICY "vulnerable_population_delete_elevated" ON vulnerable_population FOR DELETE TO authenticated USING (public.is_elevated_user());

-- Hazards
ALTER TABLE hazards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hazards_select_authenticated" ON hazards;
CREATE POLICY "hazards_select_authenticated" ON hazards FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "hazards_insert_elevated" ON hazards;
CREATE POLICY "hazards_insert_elevated" ON hazards FOR INSERT TO authenticated WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "hazards_update_elevated" ON hazards;
CREATE POLICY "hazards_update_elevated" ON hazards FOR UPDATE TO authenticated USING (public.is_elevated_user()) WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "hazards_delete_elevated" ON hazards;
CREATE POLICY "hazards_delete_elevated" ON hazards FOR DELETE TO authenticated USING (public.is_elevated_user());

-- Hazard events
ALTER TABLE hazard_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hazard_events_select_authenticated" ON hazard_events;
CREATE POLICY "hazard_events_select_authenticated" ON hazard_events FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "hazard_events_insert_elevated" ON hazard_events;
CREATE POLICY "hazard_events_insert_elevated" ON hazard_events FOR INSERT TO authenticated WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "hazard_events_update_elevated" ON hazard_events;
CREATE POLICY "hazard_events_update_elevated" ON hazard_events FOR UPDATE TO authenticated USING (public.is_elevated_user()) WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "hazard_events_delete_elevated" ON hazard_events;
CREATE POLICY "hazard_events_delete_elevated" ON hazard_events FOR DELETE TO authenticated USING (public.is_elevated_user());

-- Disaster history
ALTER TABLE disaster_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "disaster_history_select_authenticated" ON disaster_history;
CREATE POLICY "disaster_history_select_authenticated" ON disaster_history FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "disaster_history_insert_elevated" ON disaster_history;
CREATE POLICY "disaster_history_insert_elevated" ON disaster_history FOR INSERT TO authenticated WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "disaster_history_update_elevated" ON disaster_history;
CREATE POLICY "disaster_history_update_elevated" ON disaster_history FOR UPDATE TO authenticated USING (public.is_elevated_user()) WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "disaster_history_delete_elevated" ON disaster_history;
CREATE POLICY "disaster_history_delete_elevated" ON disaster_history FOR DELETE TO authenticated USING (public.is_elevated_user());

-- Risk assessments
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "risk_assessments_select_authenticated" ON risk_assessments;
CREATE POLICY "risk_assessments_select_authenticated" ON risk_assessments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "risk_assessments_insert_elevated" ON risk_assessments;
CREATE POLICY "risk_assessments_insert_elevated" ON risk_assessments FOR INSERT TO authenticated WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "risk_assessments_update_elevated" ON risk_assessments;
CREATE POLICY "risk_assessments_update_elevated" ON risk_assessments FOR UPDATE TO authenticated USING (public.is_elevated_user()) WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "risk_assessments_delete_elevated" ON risk_assessments;
CREATE POLICY "risk_assessments_delete_elevated" ON risk_assessments FOR DELETE TO authenticated USING (public.is_elevated_user());

-- Red zones
ALTER TABLE red_zones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "red_zones_select_authenticated" ON red_zones;
CREATE POLICY "red_zones_select_authenticated" ON red_zones FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "red_zones_insert_elevated" ON red_zones;
CREATE POLICY "red_zones_insert_elevated" ON red_zones FOR INSERT TO authenticated WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "red_zones_update_elevated" ON red_zones;
CREATE POLICY "red_zones_update_elevated" ON red_zones FOR UPDATE TO authenticated USING (public.is_elevated_user()) WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "red_zones_delete_elevated" ON red_zones;
CREATE POLICY "red_zones_delete_elevated" ON red_zones FOR DELETE TO authenticated USING (public.is_elevated_user());

-- Relocation sites
ALTER TABLE relocation_sites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "relocation_sites_select_authenticated" ON relocation_sites;
CREATE POLICY "relocation_sites_select_authenticated" ON relocation_sites FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "relocation_sites_insert_elevated" ON relocation_sites;
CREATE POLICY "relocation_sites_insert_elevated" ON relocation_sites FOR INSERT TO authenticated WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "relocation_sites_update_elevated" ON relocation_sites;
CREATE POLICY "relocation_sites_update_elevated" ON relocation_sites FOR UPDATE TO authenticated USING (public.is_elevated_user()) WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "relocation_sites_delete_elevated" ON relocation_sites;
CREATE POLICY "relocation_sites_delete_elevated" ON relocation_sites FOR DELETE TO authenticated USING (public.is_elevated_user());

-- Infrastructure
ALTER TABLE infrastructure ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "infrastructure_select_authenticated" ON infrastructure;
CREATE POLICY "infrastructure_select_authenticated" ON infrastructure FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "infrastructure_insert_elevated" ON infrastructure;
CREATE POLICY "infrastructure_insert_elevated" ON infrastructure FOR INSERT TO authenticated WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "infrastructure_update_elevated" ON infrastructure;
CREATE POLICY "infrastructure_update_elevated" ON infrastructure FOR UPDATE TO authenticated USING (public.is_elevated_user()) WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "infrastructure_delete_elevated" ON infrastructure;
CREATE POLICY "infrastructure_delete_elevated" ON infrastructure FOR DELETE TO authenticated USING (public.is_elevated_user());

-- Roads
ALTER TABLE roads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "roads_select_authenticated" ON roads;
CREATE POLICY "roads_select_authenticated" ON roads FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "roads_insert_elevated" ON roads;
CREATE POLICY "roads_insert_elevated" ON roads FOR INSERT TO authenticated WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "roads_update_elevated" ON roads;
CREATE POLICY "roads_update_elevated" ON roads FOR UPDATE TO authenticated USING (public.is_elevated_user()) WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "roads_delete_elevated" ON roads;
CREATE POLICY "roads_delete_elevated" ON roads FOR DELETE TO authenticated USING (public.is_elevated_user());

-- Hospitals
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hospitals_select_authenticated" ON hospitals;
CREATE POLICY "hospitals_select_authenticated" ON hospitals FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "hospitals_insert_elevated" ON hospitals;
CREATE POLICY "hospitals_insert_elevated" ON hospitals FOR INSERT TO authenticated WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "hospitals_update_elevated" ON hospitals;
CREATE POLICY "hospitals_update_elevated" ON hospitals FOR UPDATE TO authenticated USING (public.is_elevated_user()) WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "hospitals_delete_elevated" ON hospitals;
CREATE POLICY "hospitals_delete_elevated" ON hospitals FOR DELETE TO authenticated USING (public.is_elevated_user());

-- Shelters
ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shelters_select_authenticated" ON shelters;
CREATE POLICY "shelters_select_authenticated" ON shelters FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "shelters_insert_elevated" ON shelters;
CREATE POLICY "shelters_insert_elevated" ON shelters FOR INSERT TO authenticated WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "shelters_update_elevated" ON shelters;
CREATE POLICY "shelters_update_elevated" ON shelters FOR UPDATE TO authenticated USING (public.is_elevated_user()) WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "shelters_delete_elevated" ON shelters;
CREATE POLICY "shelters_delete_elevated" ON shelters FOR DELETE TO authenticated USING (public.is_elevated_user());

-- Capacity assessments
ALTER TABLE capacity_assessments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "capacity_assessments_select_authenticated" ON capacity_assessments;
CREATE POLICY "capacity_assessments_select_authenticated" ON capacity_assessments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "capacity_assessments_insert_elevated" ON capacity_assessments;
CREATE POLICY "capacity_assessments_insert_elevated" ON capacity_assessments FOR INSERT TO authenticated WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "capacity_assessments_update_elevated" ON capacity_assessments;
CREATE POLICY "capacity_assessments_update_elevated" ON capacity_assessments FOR UPDATE TO authenticated USING (public.is_elevated_user()) WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "capacity_assessments_delete_elevated" ON capacity_assessments;
CREATE POLICY "capacity_assessments_delete_elevated" ON capacity_assessments FOR DELETE TO authenticated USING (public.is_elevated_user());

-- Recommendations
ALTER TABLE relocation_recommendations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "recommendations_select_authenticated" ON relocation_recommendations;
CREATE POLICY "recommendations_select_authenticated" ON relocation_recommendations FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "recommendations_insert_elevated" ON relocation_recommendations;
CREATE POLICY "recommendations_insert_elevated" ON relocation_recommendations FOR INSERT TO authenticated WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "recommendations_update_elevated" ON relocation_recommendations;
CREATE POLICY "recommendations_update_elevated" ON relocation_recommendations FOR UPDATE TO authenticated USING (public.is_elevated_user()) WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "recommendations_delete_elevated" ON relocation_recommendations;
CREATE POLICY "recommendations_delete_elevated" ON relocation_recommendations FOR DELETE TO authenticated USING (public.is_elevated_user());

-- Alerts
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "alerts_select_authenticated" ON alerts;
CREATE POLICY "alerts_select_authenticated" ON alerts FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "alerts_insert_elevated" ON alerts;
CREATE POLICY "alerts_insert_elevated" ON alerts FOR INSERT TO authenticated WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "alerts_update_elevated" ON alerts;
CREATE POLICY "alerts_update_elevated" ON alerts FOR UPDATE TO authenticated USING (public.is_elevated_user()) WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "alerts_delete_elevated" ON alerts;
CREATE POLICY "alerts_delete_elevated" ON alerts FOR DELETE TO authenticated USING (public.is_elevated_user());

-- Scenarios
ALTER TABLE scenario_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "scenario_runs_select_authenticated" ON scenario_runs;
CREATE POLICY "scenario_runs_select_authenticated" ON scenario_runs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "scenario_runs_insert_elevated" ON scenario_runs;
CREATE POLICY "scenario_runs_insert_elevated" ON scenario_runs FOR INSERT TO authenticated WITH CHECK (public.is_elevated_user() AND created_by = auth.uid());
DROP POLICY IF EXISTS "scenario_runs_update_elevated" ON scenario_runs;
CREATE POLICY "scenario_runs_update_elevated" ON scenario_runs FOR UPDATE TO authenticated USING (public.is_elevated_user()) WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "scenario_runs_delete_elevated" ON scenario_runs;
CREATE POLICY "scenario_runs_delete_elevated" ON scenario_runs FOR DELETE TO authenticated USING (public.is_elevated_user());

-- Audit logs append-only
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_logs_select_authenticated" ON audit_logs;
CREATE POLICY "audit_logs_select_authenticated" ON audit_logs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "audit_logs_insert_authenticated" ON audit_logs;
CREATE POLICY "audit_logs_insert_authenticated" ON audit_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "audit_logs_update_none" ON audit_logs;
CREATE POLICY "audit_logs_update_none" ON audit_logs FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "audit_logs_delete_none" ON audit_logs;
CREATE POLICY "audit_logs_delete_none" ON audit_logs FOR DELETE TO authenticated USING (false);

-- Risk configuration
ALTER TABLE risk_configuration ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "risk_configuration_select_authenticated" ON risk_configuration;
CREATE POLICY "risk_configuration_select_authenticated" ON risk_configuration FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "risk_configuration_insert_elevated" ON risk_configuration;
CREATE POLICY "risk_configuration_insert_elevated" ON risk_configuration FOR INSERT TO authenticated WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "risk_configuration_update_elevated" ON risk_configuration;
CREATE POLICY "risk_configuration_update_elevated" ON risk_configuration FOR UPDATE TO authenticated USING (public.is_elevated_user()) WITH CHECK (public.is_elevated_user());
DROP POLICY IF EXISTS "risk_configuration_delete_elevated" ON risk_configuration;
CREATE POLICY "risk_configuration_delete_elevated" ON risk_configuration FOR DELETE TO authenticated USING (public.is_elevated_user());
