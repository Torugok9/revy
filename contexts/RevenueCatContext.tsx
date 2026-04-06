import { useAuthContext } from "@/contexts/AuthContext";
import type { FeatureKey } from "@/types/plans";
import Constants from "expo-constants";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";

// ─── Constants ──────────────────────────────────────────────────────
const API_KEY = Platform.select({
  ios: Constants.expoConfig?.extra?.revenueCatIosKey,
  android: Constants.expoConfig?.extra?.revenueCatAndroidKey,
})!;

const ENTITLEMENT_ID = "Revvy Pro";

// Mapeamento de entitlements do RevenueCat para features do app
const PRO_FEATURES: FeatureKey[] = [
  "km_charts",
  "fuel_comparison",
  "cost_per_km",
  "fuel_stats_advanced",
  "pdf_export",
  "push_reminders",
  "receipt_photo",
  "sale_report",
  "odometer_history",
];

// ─── Types ──────────────────────────────────────────────────────────
interface RevenueCatContextType {
  /** Se o usuário tem acesso ao Revvy Pro */
  isProUser: boolean;
  /** Informações do cliente do RevenueCat */
  customerInfo: CustomerInfo | null;
  /** Offering atual com os pacotes disponíveis */
  currentOffering: PurchasesOffering | null;
  /** Se está carregando dados iniciais */
  loading: boolean;
  /** Comprar um pacote específico */
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  /** Restaurar compras anteriores */
  restorePurchases: () => Promise<boolean>;
  /** Recarregar informações do cliente */
  refreshCustomerInfo: () => Promise<void>;
  /** Features liberadas pelo RevenueCat */
  proFeatures: FeatureKey[];
  /** Verificar se uma feature está disponível */
  canUse: (feature: FeatureKey) => boolean;
  /** Plano atual baseado no RevenueCat */
  planId: "free" | "premium";
  /** Se o SDK nativo está disponível (false no Expo Go) */
  sdkAvailable: boolean;
}

const RevenueCatContext = createContext<RevenueCatContextType | null>(null);

// ─── Provider ───────────────────────────────────────────────────────
export function RevenueCatProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthContext();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [currentOffering, setCurrentOffering] =
    useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);

  // Rastreia se o SDK nativo está disponível (false no Expo Go)
  const sdkReady = useRef(false);
  const [sdkAvailable, setSdkAvailable] = useState(false);

  // Evita chamadas duplicadas de offerings
  const fetchingOfferings = useRef(false);

  // Inicializar o SDK do RevenueCat
  useEffect(() => {
    async function init() {
      try {
        if (__DEV__) {
          Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        }

        Purchases.configure({
          apiKey: API_KEY,
          entitlementVerificationMode: __DEV__
            ? undefined
            : "informational",
        });
        sdkReady.current = true;
        setSdkAvailable(true);
      } catch (error) {
        // Módulo nativo não disponível (Expo Go) — opera em modo degradado
        if (__DEV__) {
          console.warn(
            "[RevenueCat] SDK nativo indisponível. Rodando em modo free (Expo Go).",
          );
          console.warn("[RevenueCat] Erro real:", error);
        }

        sdkReady.current = false;
        setSdkAvailable(false);
        setLoading(false);
      }
    }

    init();
  }, []);

  // Buscar offerings (função reutilizável, com guard contra chamadas duplicadas)
  const fetchOfferings = useCallback(async () => {
    if (!sdkReady.current || fetchingOfferings.current) return;

    fetchingOfferings.current = true;
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        setCurrentOffering(offerings.current);
      }
    } catch (error) {
      if (__DEV__) console.error("[RevenueCat] Erro ao carregar offerings:", error);
    } finally {
      fetchingOfferings.current = false;
    }
  }, []);

  // Identificar o usuário e então carregar dados
  // Unificado em um único effect para evitar race condition
  useEffect(() => {
    if (!sdkReady.current) return;

    let cancelled = false;

    async function identifyAndLoad() {
      try {
        setLoading(true);

        // 1. Primeiro: identificar o usuário
        if (user?.id) {
          const { customerInfo: info } = await Purchases.logIn(user.id);
          if (!cancelled) setCustomerInfo(info);
        } else {
          // Só faz logOut se não for anônimo
          const isAnonymous = await Purchases.isAnonymous();
          if (!isAnonymous) {
            await Purchases.logOut();
          }
          if (!cancelled) setCustomerInfo(null);
        }

        // 2. Depois: carregar offerings (agora com o usuário correto)
        if (!cancelled) {
          await fetchOfferings();
        }

        // 3. Buscar customer info atualizado
        if (!cancelled) {
          const info = await Purchases.getCustomerInfo();
          if (!cancelled) setCustomerInfo(info);
        }
      } catch (error) {
        if (__DEV__) console.error("[RevenueCat] Erro ao identificar/carregar:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    identifyAndLoad();

    return () => {
      cancelled = true;
    };
  }, [user?.id, sdkAvailable, fetchOfferings]);

  // Listener para atualizações de customer info em tempo real
  useEffect(() => {
    if (!sdkReady.current) return;

    const listener = (info: CustomerInfo) => {
      setCustomerInfo(info);
    };

    Purchases.addCustomerInfoUpdateListener(listener);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [sdkAvailable]);

  // Verificar se o usuário é Pro
  const isProUser = useMemo(() => {
    if (!customerInfo) return false;
    return (
      typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined"
    );
  }, [customerInfo]);

  const planId = isProUser ? "premium" : "free";

  const proFeatures = useMemo(() => {
    return isProUser ? PRO_FEATURES : [];
  }, [isProUser]);

  const featureSet = useMemo(() => new Set(proFeatures), [proFeatures]);

  const canUse = useCallback(
    (feature: FeatureKey): boolean => featureSet.has(feature),
    [featureSet],
  );

  // Comprar um pacote
  const purchasePackage = useCallback(
    async (pkg: PurchasesPackage): Promise<boolean> => {
      if (!sdkReady.current) {
        throw new Error(
          "RevenueCat SDK não disponível. Use um development build.",
        );
      }

      try {
        const { customerInfo: info } = await Purchases.purchasePackage(pkg);
        setCustomerInfo(info);

        return typeof info.entitlements.active[ENTITLEMENT_ID] !== "undefined";
      } catch (error: any) {
        if (error.userCancelled) {
          return false;
        }
        throw error;
      }
    },
    [],
  );

  // Restaurar compras
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (!sdkReady.current) {
      throw new Error(
        "RevenueCat SDK não disponível. Use um development build.",
      );
    }

    const info = await Purchases.restorePurchases();
    setCustomerInfo(info);

    return typeof info.entitlements.active[ENTITLEMENT_ID] !== "undefined";
  }, []);

  // Recarregar informações do cliente
  const refreshCustomerInfo = useCallback(async () => {
    if (!sdkReady.current) return;

    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
    } catch (error) {
      if (__DEV__) console.error("[RevenueCat] Erro ao recarregar customer info:", error);
    }
  }, []);

  const value = useMemo<RevenueCatContextType>(
    () => ({
      isProUser,
      customerInfo,
      currentOffering,
      loading,
      purchasePackage,
      restorePurchases,
      refreshCustomerInfo,
      proFeatures,
      canUse,
      planId,
      sdkAvailable,
    }),
    [
      isProUser,
      customerInfo,
      currentOffering,
      loading,
      purchasePackage,
      restorePurchases,
      refreshCustomerInfo,
      proFeatures,
      canUse,
      planId,
      sdkAvailable,
    ],
  );

  return (
    <RevenueCatContext.Provider value={value}>
      {children}
    </RevenueCatContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────
export function useRevenueCat(): RevenueCatContextType {
  const ctx = useContext(RevenueCatContext);
  if (!ctx) {
    throw new Error("useRevenueCat must be used within RevenueCatProvider");
  }
  return ctx;
}

export { ENTITLEMENT_ID };
