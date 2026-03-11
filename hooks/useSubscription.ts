import { ENTITLEMENT_ID, useRevenueCat } from "@/contexts/RevenueCatContext";
import { useCallback, useState } from "react";
import { Alert, Linking } from "react-native";
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
  const {
    currentOffering,
    purchasePackage,
    restorePurchases: rcRestorePurchases,
    refreshCustomerInfo,
    isProUser,
    sdkAvailable,
  } = useRevenueCat();

  // Comprar assinatura diretamente por período
  const subscribe = useCallback(
    async (billingPeriod: "monthly" | "yearly") => {
      if (!sdkAvailable) {
        showSdkUnavailableAlert();
        return;
      }

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
          Alert.alert(
            "Assinatura ativada!",
            "Bem-vindo ao Revvy Pro! Aproveite todos os recursos premium.",
          );
        }
      } catch (err: any) {
        const message =
          err?.message || "Erro ao processar assinatura";
        setError(message);
        Alert.alert("Erro", message);
      } finally {
        setLoading(false);
      }
    },
    [sdkAvailable, currentOffering, purchasePackage],
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
      console.error("[Paywall] Erro ao apresentar paywall:", err);
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
      console.error("[Paywall] Erro ao apresentar paywall:", err);
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
            console.error("[CustomerCenter] Restore falhou:", restoreError);
          },
        },
      });
    } catch (err: any) {
      console.error("[CustomerCenter] Erro:", err);
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
      const message =
        err?.message || "Erro ao restaurar compras";
      setError(message);
      Alert.alert("Erro", message);
    } finally {
      setLoading(false);
    }
  }, [sdkAvailable, rcRestorePurchases]);

  return {
    subscribe,
    presentPaywall,
    presentPaywallIfNeeded,
    presentCustomerCenter,
    manageSubscription,
    restorePurchases,
    loading,
    error,
  };
}
