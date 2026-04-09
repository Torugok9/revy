import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { ChatSession } from "@/types/chat";
import { useAuthContext } from "@/contexts/AuthContext";

interface UseChatSessionsResult {
  sessions: ChatSession[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
}

export function useChatSessions(vehicleId?: string): UseChatSessionsResult {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  const fetchSessions = useCallback(async () => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("chat_sessions")
        .select("*")
        .eq("is_active", true)
        .order("updated_at", { ascending: false });

      if (vehicleId) {
        query = query.eq("vehicle_id", vehicleId);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        throw new Error(supabaseError.message || "Erro ao carregar conversas");
      }

      setSessions(data || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao carregar conversas";
      setError(message);
      if (__DEV__) console.error("useChatSessions error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, vehicleId]);

  const deleteSession = useCallback(
    async (sessionId: string) => {
      const { error: supabaseError } = await supabase
        .from("chat_sessions")
        .update({ is_active: false })
        .eq("id", sessionId);

      if (supabaseError) {
        throw new Error(supabaseError.message || "Erro ao excluir conversa");
      }

      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    },
    [],
  );

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    refetch: fetchSessions,
    deleteSession,
  };
}
