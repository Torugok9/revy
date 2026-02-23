import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface VehicleHealthData {
  score: number;
  health_label: string;
  status: string;
  status_color: string;
  current_km: number;
  total_records: number;
  overdue_count: number;
  last_maintenance: {
    id: string;
    title: string;
    type: string;
    date: string;
    cost: number;
    km: number;
  } | null;
  next_service: {
    id: string;
    title: string;
    type: string;
    date: string;
    km: number;
  } | null;
}

interface UseVehicleHealthResult {
  health: VehicleHealthData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useVehicleHealth(vehicleId: string | null): UseVehicleHealthResult {
  const [health, setHealth] = useState<VehicleHealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    if (!vehicleId) {
      setHealth(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc(
        "get_vehicle_health_secure",
        { p_vehicle_id: vehicleId }
      );

      if (rpcError) {
        throw new Error(rpcError.message || "Erro ao carregar saúde do veículo");
      }

      setHealth(data as VehicleHealthData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao carregar saúde do veículo";
      setError(message);
      console.error("useVehicleHealth error:", err);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  return {
    health,
    loading,
    error,
    refetch: fetchHealth,
  };
}
