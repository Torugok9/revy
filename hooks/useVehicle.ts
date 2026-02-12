import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Vehicle } from "@/types/vehicle";

interface UseVehicleResult {
  vehicle: Vehicle | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useVehicle(vehicleId: string): UseVehicleResult {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicle = useCallback(async () => {
    if (!vehicleId) {
      setVehicle(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", vehicleId)
        .single();

      if (supabaseError) {
        if (supabaseError.code === "PGRST116") {
          setError("Veículo não encontrado");
        } else {
          throw new Error(
            supabaseError.message ||
              "Erro ao carregar veículo"
          );
        }
      }

      setVehicle(data || null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao carregar veículo";
      setError(message);
      console.error("useVehicle error:", err);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchVehicle();
  }, [fetchVehicle]);

  return {
    vehicle,
    loading,
    error,
    refetch: fetchVehicle,
  };
}
