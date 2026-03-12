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

  // Inicializar o SDK do RevenueCat
  useEffect(() => {
    async function init() {
      try {
        if (__DEV__) {
          Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        }

        Purchases.configure({ apiKey: API_KEY });
        sdkReady.current = true;
        setSdkAvailable(true);
      } catch (error) {
        // Módulo nativo não disponível (Expo Go) — opera em modo degradado
        console.warn(
          "[RevenueCat] SDK nativo indisponível. Rodando em modo free (Expo Go).",
        );
        console.warn("[RevenueCat] Erro real:", error); // <- adiciona essa linha

        sdkReady.current = false;
        setSdkAvailable(false);
        setLoading(false);
      }
    }

    init();
  }, []);

  // Identificar o usuário quando fizer login/logout
  useEffect(() => {
    if (!sdkReady.current) return;

    async function identifyUser() {
      try {
        if (user?.id) {
          const { customerInfo: info } = await Purchases.logIn(user.id);
          setCustomerInfo(info);
        } else {
          // Só faz logOut se não for anônimo
          const isAnonymous = await Purchases.isAnonymous();
          if (!isAnonymous) {
            await Purchases.logOut();
          }
          setCustomerInfo(null);
        }
      } catch (error) {
        console.error("[RevenueCat] Erro ao identificar usuário:", error);
      }
    }

    identifyUser();
  }, [user?.id, sdkAvailable]);

  // Carregar ofertas e informações do cliente
  useEffect(() => {
    if (!sdkReady.current) return;

    async function loadData() {
      try {
        setLoading(true);

        const [offerings, info] = await Promise.all([
          Purchases.getOfferings(),
          Purchases.getCustomerInfo(),
        ]);

        if (offerings.current) {
          setCurrentOffering(offerings.current);
        }

        setCustomerInfo(info);
      } catch (error) {
        console.error("[RevenueCat] Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [sdkAvailable]);

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
      console.error("[RevenueCat] Erro ao recarregar customer info:", error);
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
