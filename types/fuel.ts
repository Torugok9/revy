// ============================================================
// types/fuel.ts
// ============================================================

export type FuelType =
  | "gasoline" // Gasolina Comum
  | "gasoline_ad" // Gasolina Aditivada
  | "ethanol" // Etanol
  | "diesel" // Diesel
  | "diesel_s10" // Diesel S-10
  | "gnv"; // Gás Natural Veicular

/** Labels em pt-BR para exibição */
export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  gasoline: "Gasolina Comum",
  gasoline_ad: "Gasolina Aditivada",
  ethanol: "Etanol",
  diesel: "Diesel",
  diesel_s10: "Diesel S-10",
  gnv: "GNV",
};

/** Cores por tipo de combustível (para gráficos e badges) */
export const FUEL_TYPE_COLORS: Record<FuelType, string> = {
  gasoline: "#F59E0B", // amber
  gasoline_ad: "#EAB308", // yellow
  ethanol: "#22C55E", // green
  diesel: "#6B7280", // gray
  diesel_s10: "#8B5CF6", // purple
  gnv: "#06B6D4", // cyan
};

/** Registro individual de abastecimento */
export interface FuelLog {
  id: string;
  vehicle_id: string;
  date: string;
  fuel_type: FuelType;
  liters: number;
  price_per_liter: number;
  total_cost: number;
  km_at_fillup: number | null;
  full_tank: boolean;
  station_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Payload para inserção */
export interface FuelLogInsert {
  vehicle_id: string;
  date?: string;
  fuel_type: FuelType;
  liters: number;
  price_per_liter: number;
  total_cost: number;
  km_at_fillup?: number;
  full_tank?: boolean;
  station_name?: string;
  notes?: string;
}

/** Payload para edição */
export interface FuelLogUpdate {
  date?: string;
  fuel_type?: FuelType;
  liters?: number;
  price_per_liter?: number;
  total_cost?: number;
  km_at_fillup?: number;
  full_tank?: boolean;
  station_name?: string;
  notes?: string;
}

/** Retorno da get_fuel_stats */
export interface FuelStats {
  has_data: boolean;
  total_logs: number;
  total_cost: number;
  total_liters: number;
  avg_km_per_liter: number;
  cost_this_month: number;
  liters_this_month: number;
  cost_this_year: number;
  kml_data_points: number;
  last_fillup: {
    id: string;
    date: string;
    fuel_type: FuelType;
    liters: number;
    price_per_liter: number;
    total_cost: number;
    km: number | null;
    full_tank: boolean;
    station_name: string | null;
  } | null;
}

/** Retorno da get_fuel_comparison (Premium) */
export interface FuelComparison {
  has_data: boolean;
  fuels: FuelComparisonItem[];
  cheapest: FuelType | null;
  recommendation: string;
}

export interface FuelComparisonItem {
  fuel_type: FuelType;
  avg_km_per_liter: number;
  avg_price_per_liter: number;
  cost_per_km: number;
  data_points: number;
}
