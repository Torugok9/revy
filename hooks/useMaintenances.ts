import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Maintenance } from "@/types/vehicle";

interface UseMaintenancesResult {
  maintenances: Maintenance[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalCost: number;
  count: number;
  deleteMaintenance: (maintenanceId: string) => Promise<void>;
}

export function useMaintenances(vehicleId: string): UseMaintenancesResult {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaintenances = useCallback(async () => {
    if (!vehicleId) {
      setMaintenances([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("maintenances")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("date", { ascending: false });

      if (supabaseError) {
        throw new Error(
          supabaseError.message ||
            "Erro ao carregar manutenções"
        );
      }

      setMaintenances(data || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao carregar manutenções";
      setError(message);
      if (__DEV__) console.error("useMaintenances error:", err);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  const deleteMaintenance = useCallback(
    async (maintenanceId: string) => {
      try {
        const { error: supabaseError } = await supabase
          .from("maintenances")
          .delete()
          .eq("id", maintenanceId);

        if (supabaseError) {
          throw new Error(
            supabaseError.message ||
              "Erro ao excluir manutenção"
          );
        }

        // Remove do estado local
        setMaintenances((prev) =>
          prev.filter((m) => m.id !== maintenanceId)
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Erro ao excluir manutenção";
        if (__DEV__) console.error("deleteMaintenance error:", err);
        throw new Error(message);
      }
    },
    []
  );

  useEffect(() => {
    fetchMaintenances();
  }, [fetchMaintenances]);

  // Calcular total gasto (ignorar nulls)
  const totalCost = maintenances.reduce((sum, m) => {
    return sum + (m.cost || 0);
  }, 0);

  return {
    maintenances,
    loading,
    error,
    refetch: fetchMaintenances,
    totalCost,
    count: maintenances.length,
    deleteMaintenance,
  };
}
