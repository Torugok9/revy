/**
 * Types relacionados a Veículos
 */

export type MaintenanceType = "revision" | "part_change" | "repair" | "other";

export interface Maintenance {
  id: string;
  vehicle_id: string;
  type: MaintenanceType;
  title: string;
  description?: string | null;
  date: string;
  km_at_maintenance?: number | null;
  cost?: number | null;
  workshop_name?: string | null;
  next_maintenance_km?: number | null;
  next_maintenance_date?: string | null;
  receipt_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  color?: string | null;
  current_km: number | null;
  chassis_number?: string | null;
  purchase_date?: string | null;
  purchase_value?: number | null;
  photo_url?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  name: string;
  description?: string | null;
  max_vehicles: number;
  price_monthly?: number | null;
  price_yearly?: number | null;
  features?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: "active" | "canceled" | "past_due" | "trialing";
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean | null;
  created_at: string;
  updated_at: string;
  plan?: Plan;
}

export interface UserPlan extends Plan {
  subscription_status?: Subscription["status"];
  subscription_id?: string;
}
