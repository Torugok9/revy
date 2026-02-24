import { useFeaturesContext } from "@/contexts/FeaturesContext";
import { supabase } from "@/lib/supabase";
import { FunctionsHttpError } from "@supabase/supabase-js";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

async function extractFunctionError(
  fnError: Error,
  fallback: string,
): Promise<string> {
  if (fnError instanceof FunctionsHttpError) {
    try {
      const body = await fnError.context.json();
      return body?.error || body?.detail || body?.message || fallback;
    } catch {
      // response body não é JSON
    }
  }
  return fnError.message || fallback;
}

interface UseSubscriptionResult {
  subscribe: (billingPeriod: "monthly" | "yearly") => Promise<void>;
  cancelSubscription: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useSubscription(): UseSubscriptionResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refetch } = useFeaturesContext();

  const subscribe = useCallback(
    async (billingPeriod: "monthly" | "yearly") => {
      setLoading(true);
      setError(null);

      try {
        // Pegar token da sessão atual para enviar no body
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error("Sessão expirada. Faça login novamente.");
        }

        const { data, error: fnError } = await supabase.functions.invoke(
          "create-checkout",
          {
            body: {
              billing_period: billingPeriod,
              access_token: session.access_token,
            },
          },
        );

        if (fnError) {
          const msg = await extractFunctionError(
            fnError,
            "Erro ao criar sessão de pagamento",
          );
          throw new Error(msg);
        }

        if (!data?.url) {
          throw new Error("URL de pagamento não recebida");
        }

        // Abrir Stripe Checkout no browser in-app
        await WebBrowser.openBrowserAsync(data.url);

        // Após retorno do browser, aguardar webhook processar e recarregar features
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await refetch();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao processar pagamento";
        setError(message);
        Alert.alert("Erro", message);
      } finally {
        setLoading(false);
      }
    },
    [refetch],
  );

  const cancelSubscription = useCallback(async () => {
    return new Promise<void>((resolve) => {
      Alert.alert(
        "Cancelar assinatura",
        "Sua assinatura será cancelada ao final do período atual. Você continuará tendo acesso até a data de expiração.",
        [
          {
            text: "Manter assinatura",
            style: "cancel",
            onPress: () => resolve(),
          },
          {
            text: "Confirmar cancelamento",
            style: "destructive",
            onPress: async () => {
              setLoading(true);
              setError(null);

              try {
                const {
                  data: { session },
                } = await supabase.auth.getSession();

                if (!session?.access_token) {
                  throw new Error("Sessão expirada. Faça login novamente.");
                }

                const { data, error: fnError } =
                  await supabase.functions.invoke("manage-subscription", {
                    body: {
                      action: "cancel",
                      access_token: session.access_token,
                    },
                  });

                if (fnError) {
                  const msg = await extractFunctionError(
                    fnError,
                    "Erro ao cancelar assinatura",
                  );
                  throw new Error(msg);
                }

                const expiresDate = data?.expires_at
                  ? new Date(data.expires_at).toLocaleDateString("pt-BR")
                  : "";

                Alert.alert(
                  "Assinatura cancelada",
                  `Você continuará tendo acesso ao Pro até ${expiresDate}.`,
                );

                await refetch();
              } catch (err) {
                const message =
                  err instanceof Error
                    ? err.message
                    : "Erro ao cancelar assinatura";
                setError(message);
                Alert.alert("Erro", message);
              } finally {
                setLoading(false);
                resolve();
              }
            },
          },
        ],
      );
    });
  }, [refetch]);

  const openCustomerPortal = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      const { data, error: fnError } = await supabase.functions.invoke(
        "manage-subscription",
        {
          body: {
            action: "portal",
            access_token: session.access_token,
          },
        },
      );

      if (fnError) {
        const msg = await extractFunctionError(fnError, "Erro ao abrir portal");
        throw new Error(msg);
      }

      if (!data?.url) {
        throw new Error("URL do portal não recebida");
      }

      await WebBrowser.openBrowserAsync(data.url);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Erro ao abrir portal de pagamento";
      setError(message);
      Alert.alert("Erro", message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    subscribe,
    cancelSubscription,
    openCustomerPortal,
    loading,
    error,
  };
}
