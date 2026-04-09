import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ChatMessage, ChatRateLimitError, SendMessageResponse } from "@/types/chat";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseChatResult {
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  rateLimitError: ChatRateLimitError | null;
  sendMessage: (message: string) => Promise<SendMessageResponse | null>;
  sessionId: string | null;
}

export function useChat(
  initialSessionId: string | null,
  vehicleId: string,
): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(!!initialSessionId);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitError, setRateLimitError] = useState<ChatRateLimitError | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId);
  const { user } = useAuthContext();
  const messageIdsRef = useRef<Set<string>>(new Set());

  // Fetch existing messages for session
  const fetchMessages = useCallback(async () => {
    if (!sessionId || !user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (supabaseError) {
        throw new Error(supabaseError.message || "Erro ao carregar mensagens");
      }

      const msgs = data || [];
      messageIdsRef.current = new Set(msgs.map((m) => m.id));
      setMessages(msgs);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao carregar mensagens";
      setError(message);
      if (__DEV__) console.error("useChat fetchMessages error:", err);
    } finally {
      setLoading(false);
    }
  }, [sessionId, user]);

  useEffect(() => {
    if (initialSessionId) {
      fetchMessages();
    }
  }, [fetchMessages, initialSessionId]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!sessionId || !user) return;

    const subscription = supabase
      .channel(`chat_messages:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          // Deduplicate: skip if we already have this message
          if (messageIdsRef.current.has(newMessage.id)) return;
          messageIdsRef.current.add(newMessage.id);
          setMessages((prev) => [...prev, newMessage]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [sessionId, user]);

  // Send message via Edge Function
  const sendMessage = useCallback(
    async (message: string): Promise<SendMessageResponse | null> => {
      if (!user || !vehicleId) return null;

      try {
        setSending(true);
        setError(null);
        setRateLimitError(null);

        // Optimistic UI: add user message immediately
        const optimisticMsg: ChatMessage = {
          id: `temp-${Date.now()}`,
          session_id: sessionId || "",
          role: "user",
          content: message,
          tokens_used: null,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimisticMsg]);

        const session = await supabase.auth.getSession();
        const { data, error: fnError } = await supabase.functions.invoke(
          "chat",
          {
            body: {
              session_id: sessionId,
              vehicle_id: vehicleId,
              message,
              access_token: session.data.session?.access_token,
            },
          },
        );

        if (fnError) {
          // Remove optimistic message on error
          setMessages((prev) =>
            prev.filter((m) => m.id !== optimisticMsg.id),
          );

          // Check for rate limit
          if (fnError.context?.status === 429) {
            const rateLimitData = data as ChatRateLimitError;
            setRateLimitError(rateLimitData);
            return null;
          }

          throw new Error(fnError.message || "Erro ao enviar mensagem");
        }

        const response = data as SendMessageResponse;

        // Update session ID if this was a new session
        if (!sessionId && response.session_id) {
          setSessionId(response.session_id);
        }

        // Replace optimistic user message with real one and add assistant response
        // Realtime will handle deduplication
        setMessages((prev) => {
          const withoutOptimistic = prev.filter(
            (m) => m.id !== optimisticMsg.id,
          );
          const newMessages: ChatMessage[] = [];

          // Add the real user message if not already present via realtime
          const userMsgExists = withoutOptimistic.some(
            (m) => m.role === "user" && m.content === message && m.id !== optimisticMsg.id,
          );
          if (!userMsgExists) {
            newMessages.push({
              id: `user-${Date.now()}`,
              session_id: response.session_id,
              role: "user",
              content: message,
              tokens_used: null,
              created_at: new Date().toISOString(),
            });
          }

          // Add assistant response if not already present via realtime
          if (!messageIdsRef.current.has(response.message.id)) {
            messageIdsRef.current.add(response.message.id);
            newMessages.push(response.message);
          }

          return [...withoutOptimistic, ...newMessages];
        });

        return response;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao enviar mensagem";
        setError(message);
        if (__DEV__) console.error("useChat sendMessage error:", err);
        return null;
      } finally {
        setSending(false);
      }
    },
    [user, vehicleId, sessionId],
  );

  return {
    messages,
    loading,
    sending,
    error,
    rateLimitError,
    sendMessage,
    sessionId,
  };
}
