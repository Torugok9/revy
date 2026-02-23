// ============================================================
// types/odometer.ts
// ============================================================

export interface OdometerLog {
  id: string;
  vehicle_id: string;
  km: number;
  date: string;
  source: "manual" | "maintenance";
  notes: string | null;
  created_at: string;
}

export interface OdometerLogInsert {
  vehicle_id: string;
  km: number;
  date?: string; // default: today
  notes?: string;
}

export interface VehicleKmStats {
  has_data: boolean;
  current_km: number;
  total_logs: number;
  km_this_month: number;
  km_this_year: number;
  avg_monthly_km: number;
  projected_annual_km: number;
  km_per_day: number;
  first_log_date: string | null;
  last_log_date: string | null;
  days_tracked: number;
}

export interface OdometerHistoryPoint {
  date: string;
  km: number;
  source: "manual" | "maintenance";
}

export interface OdometerHistory {
  period: "month" | "quarter" | "year" | "all";
  since: string;
  data: OdometerHistoryPoint[];
}
