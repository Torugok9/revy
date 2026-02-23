import { useAuthContext } from "@/contexts/AuthContext";

import { supabase } from "@/lib/supabase";

import { FeatureKey, UserFeatures } from "@/types/plans";
import { useCallback, useEffect, useMemo, useState } from "react";

interface UseUserPlanResult {
  planId: string;
  features: FeatureKey[];
  canUse: (feature: FeatureKey) => boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserPlan(): UseUserPlanResult {
  const [userFeatures, setUserFeatures] = useState<UserFeatures | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  const fetchPlan = useCallback(async () => {
    if (!user) {
      setUserFeatures(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase.rpc(
        "get_user_features",
        { p_user_id: user.id },
      );

      if (supabaseError) {
        throw new Error(
          supabaseError.message || "Erro ao carregar plano do usuário",
        );
      }

      setUserFeatures(data || null);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Erro ao carregar plano do usuário";
      setError(message);
      console.error("useUserPlan error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPlan();
  }, [user, fetchPlan]);

  const featureSet = useMemo(() => {
    if (!userFeatures?.features) return new Set<FeatureKey>();
    return new Set<FeatureKey>(userFeatures.features);
  }, [userFeatures]);

  const canUse = useCallback(
    (feature: FeatureKey): boolean => featureSet.has(feature),
    [featureSet],
  );

  return {
    planId: userFeatures?.plan_id ?? "free",
    features: userFeatures?.features ?? [],
    canUse,
    loading,
    error,
    refetch: fetchPlan,
  };
}
