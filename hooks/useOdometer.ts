// ============================================================
// hooks/useOdometer.ts
// ============================================================

import { supabase } from "@/lib/supabase";
import type {
  OdometerHistory,
  OdometerLog,
  OdometerLogInsert,
  VehicleKmStats,
} from "@/types/odometer";
import { useCallback, useEffect, useState } from "react";

// -------------------------------------------------
// Hook principal: CRUD de logs + stats
// -------------------------------------------------
export function useOdometer(vehicleId: string | undefined) {
  const [logs, setLogs] = useState<OdometerLog[]>([]);
  const [stats, setStats] = useState<VehicleKmStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar logs do veículo (últimos 50, ordenados por data DESC)
  const fetchLogs = useCallback(async () => {
    if (!vehicleId) return;

    const { data, error: fetchError } = await supabase
      .from("odometer_logs")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50);

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    setLogs((data as OdometerLog[]) ?? []);
  }, [vehicleId]);

  // Buscar estatísticas via RPC
  const fetchStats = useCallback(async () => {
    if (!vehicleId) return;

    const { data, error: rpcError } = await supabase.rpc(
      "get_vehicle_km_stats",
      { p_vehicle_id: vehicleId },
    );

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    if (data?.error) {
      setError(data.error);
      return;
    }

    setStats(data as VehicleKmStats);
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

  // Registrar km manualmente
  const addLog = useCallback(
    async (input: OdometerLogInsert) => {
      setError(null);

      const { error: insertError } = await supabase
        .from("odometer_logs")
        .insert({
          vehicle_id: input.vehicle_id,
          km: input.km,
          date: input.date ?? new Date().toISOString().split("T")[0],
          source: "manual",
          notes: input.notes ?? null,
        });

      if (insertError) {
        setError(insertError.message);
        return false;
      }

      // Recarregar logs e stats após inserção
      await fetchAll();
      return true;
    },
    [fetchAll],
  );

  // Deletar log (só manual, maintenance logs são protegidos na UI)
  const deleteLog = useCallback(
    async (logId: string) => {
      setError(null);

      const { error: deleteError } = await supabase
        .from("odometer_logs")
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
    addLog,
    deleteLog,
    refetch: fetchAll,
  };
}

// -------------------------------------------------
// Hook separado: histórico para gráficos (Premium)
// -------------------------------------------------
export function useOdometerHistory(
  vehicleId: string | undefined,
  period: "month" | "quarter" | "year" | "all" = "year",
) {
  const [history, setHistory] = useState<OdometerHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!vehicleId) return;

    setLoading(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc(
      "get_odometer_history",
      { p_vehicle_id: vehicleId, p_period: period },
    );

    if (rpcError) {
      setError(rpcError.message);
    } else if (data?.error) {
      setError(data.error);
    } else {
      setHistory(data as OdometerHistory);
    }

    setLoading(false);
  }, [vehicleId, period]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, error, refetch: fetchHistory };
}
