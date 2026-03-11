import type { FeatureKey } from "@/types/plans";
import React, { createContext, useContext, useMemo } from "react";

import { useRevenueCat } from "@/contexts/RevenueCatContext";
import { useFeatures as useSupabaseFeatures } from "@/hooks/useFeatures";

interface FeaturesContextType {
  canUse: (feature: FeatureKey) => boolean;
  planId: string;
  features: FeatureKey[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const FeaturesContext = createContext<FeaturesContextType | null>(null);

export function FeaturesProvider({ children }: { children: React.ReactNode }) {
  const supabase = useSupabaseFeatures();
  const revenueCat = useRevenueCat();

  // RevenueCat é a fonte de verdade para o status de assinatura.
  // Se o usuário é Pro no RevenueCat, suas features Pro são liberadas.
  // Caso contrário, cai para o Supabase (útil durante migração).
  const value = useMemo<FeaturesContextType>(() => {
    if (revenueCat.isProUser) {
      return {
        canUse: revenueCat.canUse,
        planId: revenueCat.planId,
        features: revenueCat.proFeatures,
        loading: revenueCat.loading,
        error: null,
        refetch: revenueCat.refreshCustomerInfo,
      };
    }

    // Fallback para Supabase (para planos gerenciados manualmente ou migração)
    return {
      canUse: supabase.canUse,
      planId: supabase.planId,
      features: supabase.features,
      loading: supabase.loading || revenueCat.loading,
      error: supabase.error,
      refetch: supabase.refetch,
    };
  }, [revenueCat, supabase]);

  return (
    <FeaturesContext.Provider value={value}>
      {children}
    </FeaturesContext.Provider>
  );
}

export function useFeaturesContext(): FeaturesContextType {
  const ctx = useContext(FeaturesContext);
  if (!ctx) {
    throw new Error("useFeaturesContext must be used within FeaturesProvider");
  }
  return ctx;
}
