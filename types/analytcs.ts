// ============================================================
// types/analytics.ts
// ============================================================

/** Retorno da get_cost_per_km */
export interface CostPerKm {
  has_data: boolean;
  current_km: number;
  km_range: number;
  total_cost: number;
  maintenance_cost: number;
  fuel_cost: number;
  cost_per_km: number;
  maintenance_per_km: number;
  fuel_per_km: number;
  maintenance_pct: number;
  fuel_pct: number;
}

/** Item do breakdown de manutenção */
export interface MaintenanceBreakdownItem {
  category: "revision" | "part_change" | "repair" | "other";
  total: number;
  count: number;
  pct: number;
}

/** Retorno da get_expense_breakdown */
export interface ExpenseBreakdown {
  has_data: boolean;
  grand_total: number;
  fuel: {
    total: number;
    pct: number;
  };
  maintenance: {
    category: string;
    total: number;
    count: number;
  }[];
  maintenance_with_pct: MaintenanceBreakdownItem[];
}

/** Labels pt-BR para categorias de manutenção */
export const MAINTENANCE_TYPE_LABELS: Record<string, string> = {
  revision: "Revisão",
  part_change: "Troca de Peça",
  repair: "Reparo",
  other: "Outros",
};

/** Cores para categorias (gráficos) */
export const EXPENSE_CATEGORY_COLORS: Record<string, string> = {
  revision: "#3B82F6", // blue
  part_change: "#F59E0B", // amber
  repair: "#EF4444", // red
  other: "#6B7280", // gray
  fuel: "#22C55E", // green
};
