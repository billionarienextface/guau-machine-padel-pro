export type LeadLevel = "BASE" | "LUXE" | "ATELIER";

export type LeadStatus =
  | "NEW"
  | "AUDITED"
  | "CONTACTED"
  | "CALLED"
  | "CLOSED"
  | "CLIENT";

export interface Lead {
  id: string;
  business_name: string;
  city: string;
  address?: string;
  level: LeadLevel;
  status: LeadStatus;
  grid_score_before: number;
}

export interface GridPoint {
  rank: number;
}

export interface GridData {
  points: GridPoint[];
  score: number;
  total: number;
}

export interface Audit {
  id: string;
  lead_id: string;
  grid_data: GridData;
}

export interface Client {
  id: string;
  lead_id: string;
  plan: LeadLevel;
  mrr: number;
}
