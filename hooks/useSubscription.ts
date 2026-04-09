import { ENTITLEMENT_ID, useRevenueCat } from "@/contexts/RevenueCatContext";
import {
  getPurchaseErrorInfo,
  type PurchaseErrorAction,
  type PurchaseErrorInfo,
} from "@/constants/purchase-errors";
import { useCallback, useRef, useState } from "react";
import { Alert, Linking, Platform } from "react-native";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

interface UseSubscriptionResult {
  /** Comprar assinatura pelo período escolhido */
  subscribe: (billingPeriod: "monthly" | "yearly") => Promise<void>;
  /** Apresentar o paywall do RevenueCat (retorna true se comprou/restaurou) */
  presentPaywall: () => Promise<boolean>;
  /** Apresentar paywall somente se o usuário não tiver o Revvy Pro */
  presentPaywallIfNeeded: () => Promise<boolean>;
  /** Abrir o Customer Center do RevenueCat */
  presentCustomerCenter: () => Promise<void>;
  /** Gerenciar assinatura (abre Customer Center ou Paywall) */
  manageSubscription: () => Promise<void>;
  /** Restaurar compras anteriores */
  restorePurchases: () => Promise<void>;
  /** Se está processando uma operação */
  loading: boolean;
  /** Mensagem de erro, se houver */
  error: string | null;
  /** Props para o PurchaseErrorSheet */
  errorSheet: {
    visible: boolean;
    errorInfo: PurchaseErrorInfo | null;
    onAction: (actionType: PurchaseErrorAction) => void;
    onDismiss: () => void;
  };
  /** Props para o PurchaseSuccessSheet */
  successSheet: {
    visible: boolean;
    onDismiss: () => void;
  };
}

function showSdkUnavailableAlert() {
  Alert.alert(
    "Indisponível no Expo Go",
    "As compras in-app requerem um development build. Execute 'expo run:ios' ou 'expo run:android' para testar.",
  );
}

export function useSubscription(): UseSubscriptionResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorSheetVisible, setErrorSheetVisible] = useState(false);
  const [currentErrorInfo, setCurrentErrorInfo] =
    useState<PurchaseErrorInfo | null>(null);
  const [successSheetVisible, setSuccessSheetVisible] = useState(false);
  const lastBillingPeriod = useRef<"monthly" | "yearly">("monthly");
  const {
    currentOffering,
    purchasePackage,
    restorePurchases: rcRestorePurchases,
    refreshCustomerInfo,
    isProUser,
    sdkAvailable,
  } = useRevenueCat();

  // Processar erro de compra e exibir sheet adequado
  const handlePurchaseError = useCallback((err: unknown) => {
    const info = getPurchaseErrorInfo(err);
    if (!info) return; // erro silencioso (ex: cancelamento)

    if (__DEV__) console.error("[Purchase] Erro:", err);

    setCurrentErrorInfo(info);
    setErrorSheetVisible(true);
  }, []);

  // Despachar ação do sheet de erro
  const handleErrorAction = useCallback(
    async (actionType: PurchaseErrorAction) => {
      setErrorSheetVisible(false);

      switch (actionType) {
        case "dismiss":
          break;
        case "retry":
          // Re-executa subscribe com o último período usado
          setTimeout(() => subscribe(lastBillingPeriod.current), 300);
          break;
        case "restore":
          setTimeout(() => restorePurchases(), 300);
          break;
        case "contact":
          Linking.openURL("mailto:suporte@revyapp.com.br");
          break;
        case "settings":
          if (Platform.OS === "ios") {
            Linking.openURL("app-settings:");
          } else {
            Linking.openSettings();
          }
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Comprar assinatura diretamente por período
  const subscribe = useCallback(
    async (billingPeriod: "monthly" | "yearly") => {
      if (!sdkAvailable) {
        showSdkUnavailableAlert();
        return;
      }

      lastBillingPeriod.current = billingPeriod;
      setLoading(true);
      setError(null);

      try {
        if (!currentOffering) {
          Alert.alert(
            "Indisponível",
            "Não foi possível carregar os planos. Tente novamente mais tarde.",
          );
          return;
        }

        const pkg =
          billingPeriod === "monthly"
            ? currentOffering.monthly
            : currentOffering.annual;

        if (!pkg) {
          Alert.alert(
            "Indisponível",
            "Este plano não está disponível no momento.",
          );
          return;
        }

        const success = await purchasePackage(pkg);

        if (success) {
          setSuccessSheetVisible(true);
        }
      } catch (err: any) {
        const message = err?.message || "Erro ao processar assinatura";
        setError(message);
        handlePurchaseError(err);
      } finally {
        setLoading(false);
      }
    },
    [sdkAvailable, currentOffering, purchasePackage, handlePurchaseError],
  );

  // Apresentar paywall nativo do RevenueCat
  const presentPaywall = useCallback(async (): Promise<boolean> => {
    if (!sdkAvailable) {
      showSdkUnavailableAlert();
      return false;
    }

    try {
      const result = await RevenueCatUI.presentPaywall({
        displayCloseButton: true,
      });

      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          await refreshCustomerInfo();
          return true;
        case PAYWALL_RESULT.CANCELLED:
        case PAYWALL_RESULT.NOT_PRESENTED:
        case PAYWALL_RESULT.ERROR:
        default:
          return false;
      }
    } catch (err: any) {
      if (__DEV__) console.error("[Paywall] Erro ao apresentar paywall:", err);
      return false;
    }
  }, [sdkAvailable, refreshCustomerInfo]);

  // Apresentar paywall somente se o usuário não tiver o entitlement
  const presentPaywallIfNeeded = useCallback(async (): Promise<boolean> => {
    if (!sdkAvailable) {
      showSdkUnavailableAlert();
      return false;
    }

    try {
      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: ENTITLEMENT_ID,
        displayCloseButton: true,
      });

      if (result === PAYWALL_RESULT.NOT_PRESENTED) {
        return true;
      }

      if (
        result === PAYWALL_RESULT.PURCHASED ||
        result === PAYWALL_RESULT.RESTORED
      ) {
        await refreshCustomerInfo();
        return true;
      }

      return false;
    } catch (err: any) {
      if (__DEV__) console.error("[Paywall] Erro ao apresentar paywall:", err);
      return false;
    }
  }, [sdkAvailable, refreshCustomerInfo]);

  // Apresentar Customer Center do RevenueCat
  const presentCustomerCenter = useCallback(async () => {
    if (!sdkAvailable) {
      showSdkUnavailableAlert();
      return;
    }

    try {
      await RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onRestoreCompleted: async () => {
            await refreshCustomerInfo();
          },
          onRestoreFailed: ({ error: restoreError }) => {
            if (__DEV__) console.error("[CustomerCenter] Restore falhou:", restoreError);
          },
        },
      });
    } catch (err: any) {
      if (__DEV__) console.error("[CustomerCenter] Erro:", err);
      try {
        await Linking.openURL("https://apps.apple.com/account/subscriptions");
      } catch {
        Alert.alert(
          "Gerenciar assinatura",
          "Acesse Ajustes > Apple ID > Assinaturas para gerenciar seu plano.",
        );
      }
    }
  }, [sdkAvailable, refreshCustomerInfo]);

  // Gerenciar assinatura (Customer Center para Pro, paywall para Free)
  const manageSubscription = useCallback(async () => {
    if (isProUser) {
      await presentCustomerCenter();
    } else {
      await presentPaywall();
    }
  }, [isProUser, presentCustomerCenter, presentPaywall]);

  // Restaurar compras
  const restorePurchases = useCallback(async () => {
    if (!sdkAvailable) {
      showSdkUnavailableAlert();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const restored = await rcRestorePurchases();

      if (restored) {
        Alert.alert(
          "Compras restauradas!",
          "Seu plano Revvy Pro foi recuperado com sucesso.",
        );
      } else {
        Alert.alert(
          "Nenhuma assinatura",
          "Não encontramos assinaturas ativas vinculadas à sua conta.",
        );
      }
    } catch (err: any) {
      const message = err?.message || "Erro ao restaurar compras";
      setError(message);
      handlePurchaseError(err);
    } finally {
      setLoading(false);
    }
  }, [sdkAvailable, rcRestorePurchases, handlePurchaseError]);

  return {
    subscribe,
    presentPaywall,
    presentPaywallIfNeeded,
    presentCustomerCenter,
    manageSubscription,
    restorePurchases,
    loading,
    error,
    errorSheet: {
      visible: errorSheetVisible,
      errorInfo: currentErrorInfo,
      onAction: handleErrorAction,
      onDismiss: () => setErrorSheetVisible(false),
    },
    successSheet: {
      visible: successSheetVisible,
      onDismiss: () => setSuccessSheetVisible(false),
    },
  };
}
