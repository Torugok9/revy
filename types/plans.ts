// ============================================================
// types/plans.ts (substituir o existente)
// ============================================================

/** Chaves de features — manter sincronizado com feature_catalog no banco */
export type FeatureKey =
  // Existentes
  | "pdf_export"
  | "push_reminders"
  | "receipt_photo"
  | "multi_user"
  | "fleet_dashboard"
  // Odometer & Analytics
  | "km_charts"
  | "cost_per_km"
  | "odometer_history"
  // Fuel
  | "fuel_comparison"
  | "fuel_stats_advanced"
  // Export
  | "sale_report";

/** Retorno da get_user_features */
export interface UserFeatures {
  plan_id: string;
  features: FeatureKey[];
}

/** Plano com features (para tela de upgrade) */
export interface PlanWithFeatures {
  id: string;
  name: string;
  description: string | null;
  max_vehicles: number;
  price_monthly_cents: number | null;
  features: FeatureKey[];
}

/** Metadado de uma feature (do feature_catalog) */
export interface FeatureCatalogItem {
  key: FeatureKey;
  name: string;
  description: string | null;
  category: string;
}
