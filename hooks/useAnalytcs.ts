// ============================================================
// hooks/useAnalytics.ts
// ============================================================

import { supabase } from "@/lib/supabase";
import { CostPerKm, ExpenseBreakdown } from "@/types/analytcs";
import { useCallback, useEffect, useState } from "react";

export function useCostPerKm(vehicleId: string | undefined) {
  const [data, setData] = useState<CostPerKm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!vehicleId) return;

    setLoading(true);
    setError(null);

    try {
      const { data: result, error: rpcError } = await supabase.rpc(
        "get_cost_per_km",
        { p_vehicle_id: vehicleId },
      );

      if (rpcError) throw rpcError;
      if (result?.error) {
        setError(result.error);
        return;
      }
      setData(result as CostPerKm);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar custo por km");
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useExpenseBreakdown(vehicleId: string | undefined) {
  const [data, setData] = useState<ExpenseBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!vehicleId) return;

    setLoading(true);
    setError(null);

    try {
      const { data: result, error: rpcError } = await supabase.rpc(
        "get_expense_breakdown",
        { p_vehicle_id: vehicleId },
      );

      if (rpcError) throw rpcError;
      if (result?.error) {
        setError(result.error);
        return;
      }
      setData(result as ExpenseBreakdown);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar breakdown");
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
