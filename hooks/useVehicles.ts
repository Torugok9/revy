import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Vehicle } from "@/types/vehicle";
import { useAuthContext } from "@/contexts/AuthContext";

interface UseVehiclesResult {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useVehicles(): UseVehiclesResult {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  const fetchVehicles = useCallback(async () => {
    if (!user) {
      setVehicles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });

      if (supabaseError) {
        throw new Error(
          supabaseError.message ||
            "Erro ao carregar veículos"
        );
      }

      setVehicles(data || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao carregar veículos";
      setError(message);
      console.error("useVehicles error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchVehicles();

    // Subscribe to realtime changes
    if (!user) return;

    const subscription = supabase
      .channel("public:vehicles")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vehicles",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setVehicles((prev) => [payload.new as Vehicle, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setVehicles((prev) =>
              prev.map((v) =>
                v.id === (payload.new as Vehicle).id
                  ? (payload.new as Vehicle)
                  : v
              )
            );
          } else if (payload.eventType === "DELETE") {
            setVehicles((prev) =>
              prev.filter((v) => v.id !== (payload.old as Vehicle).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, fetchVehicles]);

  return {
    vehicles,
    loading,
    error,
    refetch: fetchVehicles,
  };
}
