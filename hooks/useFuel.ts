// ============================================================
// hooks/useFuel.ts
// ============================================================

import { supabase } from "@/lib/supabase";
import type {
  FuelComparison,
  FuelLog,
  FuelLogInsert,
  FuelLogUpdate,
  FuelStats,
} from "@/types/fuel";
import { useCallback, useEffect, useState } from "react";

// -------------------------------------------------
// Hook principal: CRUD de fuel logs + stats básicos
// -------------------------------------------------
export function useFuel(vehicleId: string | undefined) {
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [stats, setStats] = useState<FuelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar logs do veículo (últimos 50)
  const fetchLogs = useCallback(async () => {
    if (!vehicleId) return;

    const { data, error: fetchError } = await supabase
      .from("fuel_logs")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50);

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    setLogs((data as FuelLog[]) ?? []);
  }, [vehicleId]);

  // Buscar stats via RPC
  const fetchStats = useCallback(async () => {
    if (!vehicleId) return;

    const { data, error: rpcError } = await supabase.rpc("get_fuel_stats", {
      p_vehicle_id: vehicleId,
    });

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    if (data?.error) {
      setError(data.error);
      return;
    }

    setStats(data as FuelStats);
  }, [vehicleId]);

  // Carregar tudo
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchLogs(), fetchStats()]);
    setLoading(false);
  }, [fetchLogs, fetchStats]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Registrar abastecimento
  const addFuelLog = useCallback(
    async (input: FuelLogInsert) => {
      setError(null);

      const { error: insertError } = await supabase.from("fuel_logs").insert({
        vehicle_id: input.vehicle_id,
        date: input.date ?? new Date().toISOString().split("T")[0],
        fuel_type: input.fuel_type,
        liters: input.liters,
        price_per_liter: input.price_per_liter,
        total_cost: input.total_cost,
        km_at_fillup: input.km_at_fillup ?? null,
        full_tank: input.full_tank ?? true,
        station_name: input.station_name ?? null,
        notes: input.notes ?? null,
      });

      if (insertError) {
        setError(insertError.message);
        return false;
      }

      await fetchAll();
      return true;
    },
    [fetchAll],
  );

  // Editar abastecimento
  const updateFuelLog = useCallback(
    async (logId: string, updates: FuelLogUpdate) => {
      setError(null);

      const { error: updateError } = await supabase
        .from("fuel_logs")
        .update(updates)
        .eq("id", logId);

      if (updateError) {
        setError(updateError.message);
        return false;
      }

      await fetchAll();
      return true;
    },
    [fetchAll],
  );

  // Deletar abastecimento
  const deleteFuelLog = useCallback(
    async (logId: string) => {
      setError(null);

      const { error: deleteError } = await supabase
        .from("fuel_logs")
        .delete()
        .eq("id", logId);

      if (deleteError) {
        setError(deleteError.message);
        return false;
      }

      await fetchAll();
      return true;
    },
    [fetchAll],
  );

  return {
    logs,
    stats,
    loading,
    error,
    addFuelLog,
    updateFuelLog,
    deleteFuelLog,
    refetch: fetchAll,
  };
}

// -------------------------------------------------
// Hook Premium: comparação entre combustíveis
// -------------------------------------------------
export function useFuelComparison(vehicleId: string | undefined) {
  const [comparison, setComparison] = useState<FuelComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = useCallback(async () => {
    if (!vehicleId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "get_fuel_comparison",
        { p_vehicle_id: vehicleId },
      );

      if (rpcError) throw rpcError;

      if (data?.error) {
        setError(data.error);
        return;
      }

      setComparison(data as FuelComparison);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar comparação");
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchComparison();
  }, [fetchComparison]);

  return { comparison, loading, error, refetch: fetchComparison };
}
