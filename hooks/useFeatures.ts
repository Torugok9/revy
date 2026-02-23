// ============================================================
// hooks/useFeatures.ts
// ============================================================

import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuthContext } from "@/contexts/AuthContext";
import type { FeatureKey, PlanWithFeatures, UserFeatures } from "@/types/plans";

/**
 * Hook principal de feature gating.
 * Carrega as features do plano do usuário uma vez e expõe
 * um helper `canUse('feature_key')` para checar permissão.
 *
 * Uso:
 * const { canUse, planId, loading } = useFeatures();
 * if (canUse('km_charts')) { ... }
 */
export function useFeatures() {
  const { user } = useAuthContext();
  const [userFeatures, setUserFeatures] = useState<UserFeatures | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatures = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "get_user_features",
        { p_user_id: user.id },
      );

      if (rpcError) throw rpcError;
      setUserFeatures(data as UserFeatures);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar features");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  // Set de features para lookup O(1)
  const featureSet = useMemo(() => {
    if (!userFeatures?.features) return new Set<FeatureKey>();
    return new Set<FeatureKey>(userFeatures.features);
  }, [userFeatures]);

  // Helper principal
  const canUse = useCallback(
    (feature: FeatureKey): boolean => featureSet.has(feature),
    [featureSet],
  );

  return {
    canUse,
    planId: userFeatures?.plan_id ?? "free",
    features: userFeatures?.features ?? [],
    loading,
    error,
    refetch: fetchFeatures,
  };
}

/**
 * Hook para tela de upgrade.
 * Retorna todos os planos ativos com suas features.
 */
export function usePlans() {
  const [plans, setPlans] = useState<PlanWithFeatures[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "get_all_plans_with_features",
      );

      if (rpcError) throw rpcError;
      setPlans((data as PlanWithFeatures[]) ?? []);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar planos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return { plans, loading, error, refetch: fetchPlans };
}
