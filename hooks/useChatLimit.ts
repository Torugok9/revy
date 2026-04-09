import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ChatLimitInfo } from "@/types/chat";
import { useCallback, useEffect, useState } from "react";

interface UseChatLimitResult extends ChatLimitInfo {
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useChatLimit(): UseChatLimitResult {
  const [limitInfo, setLimitInfo] = useState<ChatLimitInfo>({
    used: 0,
    limit: null,
    remaining: null,
    isAtLimit: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  const fetchLimit = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [countResult, planResult] = await Promise.all([
        supabase.rpc("count_user_messages_this_month", {
          target_user_id: user.id,
        }),
        supabase.rpc("get_user_plan", { target_user_id: user.id }),
      ]);

      if (countResult.error) {
        throw new Error(countResult.error.message);
      }
      if (planResult.error) {
        throw new Error(planResult.error.message);
      }

      const used = countResult.data ?? 0;
      const limit = planResult.data?.max_chat_messages_month ?? null;
      const remaining = limit !== null ? Math.max(0, limit - used) : null;
      const isAtLimit = limit !== null && used >= limit;

      setLimitInfo({ used, limit, remaining, isAtLimit });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao verificar limite";
      setError(message);
      if (__DEV__) console.error("useChatLimit error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLimit();
  }, [fetchLimit]);

  return {
    ...limitInfo,
    loading,
    error,
    refetch: fetchLimit,
  };
}
