import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type IncidentType = 'flood' | 'fire' | 'earthquake' | 'hurricane' | 'landslide' | 'chemical_spill' | 'power_outage' | 'medical' | 'structural_collapse' | 'other';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'active' | 'contained' | 'resolved';
export type ResourceType = 'shelter' | 'hospital' | 'supply_depot' | 'rescue_team' | 'fire_station' | 'police_station' | 'water_source' | 'helipad';
export type ResourceStatus = 'available' | 'full' | 'deployed' | 'maintenance';
export type AlertSeverity = 'info' | 'warning' | 'severe' | 'critical';

export interface Incident {
  id: string;
  title: string;
  description: string | null;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  latitude: number;
  longitude: number;
  location_name: string | null;
  affected_people: number;
  reported_by: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  latitude: number;
  longitude: number;
  address: string | null;
  capacity: number;
  occupancy: number;
  contact_name: string | null;
  contact_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  area: string | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}
