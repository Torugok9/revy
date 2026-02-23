import type { FeatureKey } from "@/types/plans";
import React, { createContext, useContext } from "react";

import { useFeatures } from "@/hooks/useFeatures";

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
  const value = useFeatures();

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
