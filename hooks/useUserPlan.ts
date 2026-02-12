// eslint-disable-next-line import/no-unresolved
import { useAuthContext } from "@/contexts/AuthContext";
// eslint-disable-next-line import/no-unresolved
import { supabase } from "@/lib/supabase";
// eslint-disable-next-line import/no-unresolved
import { UserPlan } from "@/types/vehicle";
import { useCallback, useEffect, useState } from "react";

interface UseUserPlanResult {
  plan: UserPlan | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserPlan(): UseUserPlanResult {
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  const fetchPlan = useCallback(async () => {
    if (!user) {
      setPlan(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase.rpc(
        "get_user_plan",
        { target_user_id: user.id },
      );

      if (supabaseError) {
        throw new Error(
          supabaseError.message || "Erro ao carregar plano do usuário",
        );
      }

      setPlan(data || null);
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

  return {
    plan,
    loading,
    error,
    refetch: fetchPlan,
  };
}
