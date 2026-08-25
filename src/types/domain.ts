export type UserRole = 'admin' | 'state_authority' | 'district_officer' | 'viewer';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  region_id: string | null;
  district_name: string | null;
  is_active: boolean;
}

export interface DashboardStats {
  criticalHabitations: number;
  populationAtRisk: number;
  vulnerablePopulation: number;
  immediateRelocation: number;
  availableCapacity: number;
  recommendedSites: number;
  activeAlerts: number;
  totalHabitations: number;
}

export interface RiskAssessment {
  id: string;
  habitation_id: string;
  final_risk_score: number;
  risk_class: string;
}

export interface Region {
  id: string;
  name: string;
  state_name: string;
  district_name: string | null;
  code: string;
  is_demo: boolean;
}
