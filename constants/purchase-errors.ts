import { PURCHASES_ERROR_CODE } from "react-native-purchases";

// ─── Types ──────────────────────────────────────────────────────────

export type PurchaseErrorSeverity =
  | "silent"
  | "info"
  | "warning"
  | "error"
  | "internal";

export type PurchaseErrorAction =
  | "dismiss"
  | "retry"
  | "restore"
  | "contact"
  | "settings";

export interface PurchaseErrorInfo {
  severity: PurchaseErrorSeverity;
  title: string;
  message: string;
  icon: string;
  primaryAction?: { label: string; type: PurchaseErrorAction };
  secondaryAction?: { label: string; type: PurchaseErrorAction };
}

// ─── Mapeamento ─────────────────────────────────────────────────────

const PURCHASE_ERROR_MAP: Record<string, PurchaseErrorInfo> = {
  // ── Silent ────────────────────────────────────────────────────────
  [PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR]: {
    severity: "silent",
    title: "",
    message: "",
    icon: "",
  },

  // ── Info ──────────────────────────────────────────────────────────
  [PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR]: {
    severity: "info",
    title: "Você já possui esta assinatura",
    message:
      "Se ela não estiver ativa, tente restaurar suas compras para recuperar o acesso.",
    icon: "checkmark-circle-outline",
    primaryAction: { label: "Restaurar compras", type: "restore" },
    secondaryAction: { label: "Fechar", type: "dismiss" },
  },

  [PURCHASES_ERROR_CODE.OPERATION_ALREADY_IN_PROGRESS_ERROR]: {
    severity: "info",
    title: "Aguarde um momento",
    message:
      "Já existe uma operação em andamento. Espere ela finalizar antes de tentar novamente.",
    icon: "hourglass-outline",
    primaryAction: { label: "Entendi", type: "dismiss" },
  },

  [PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR]: {
    severity: "info",
    title: "Pagamento pendente",
    message:
      "Seu pagamento está sendo processado pela loja. Você será notificado assim que for concluído.",
    icon: "time-outline",
    primaryAction: { label: "Entendi", type: "dismiss" },
  },

  // ── Warning (recuperáveis com retry) ──────────────────────────────
  [PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR]: {
    severity: "warning",
    title: "Problema na loja",
    message:
      "A loja de aplicativos está com dificuldades no momento. Tente novamente em alguns minutos.",
    icon: "storefront-outline",
    primaryAction: { label: "Tentar novamente", type: "retry" },
    secondaryAction: { label: "Fechar", type: "dismiss" },
  },

  [PURCHASES_ERROR_CODE.NETWORK_ERROR]: {
    severity: "warning",
    title: "Sem conexão",
    message:
      "Verifique sua conexão com a internet e tente novamente.",
    icon: "cloud-offline-outline",
    primaryAction: { label: "Tentar novamente", type: "retry" },
    secondaryAction: { label: "Fechar", type: "dismiss" },
  },

  [PURCHASES_ERROR_CODE.OFFLINE_CONNECTION_ERROR]: {
    severity: "warning",
    title: "Você está offline",
    message:
      "Conecte-se à internet para concluir a operação.",
    icon: "wifi-outline",
    primaryAction: { label: "Tentar novamente", type: "retry" },
    secondaryAction: { label: "Fechar", type: "dismiss" },
  },

  [PURCHASES_ERROR_CODE.PRODUCT_REQUEST_TIMED_OUT_ERROR]: {
    severity: "warning",
    title: "Tempo esgotado",
    message:
      "A solicitação demorou mais do que o esperado. Tente novamente.",
    icon: "timer-outline",
    primaryAction: { label: "Tentar novamente", type: "retry" },
    secondaryAction: { label: "Fechar", type: "dismiss" },
  },

  [PURCHASES_ERROR_CODE.API_ENDPOINT_BLOCKED]: {
    severity: "warning",
    title: "Serviço indisponível",
    message:
      "Não foi possível conectar ao serviço de pagamentos. Verifique sua rede e tente novamente.",
    icon: "shield-outline",
    primaryAction: { label: "Tentar novamente", type: "retry" },
    secondaryAction: { label: "Fechar", type: "dismiss" },
  },

  // ── Error (orientação específica) ─────────────────────────────────
  [PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR]: {
    severity: "error",
    title: "Compra não permitida",
    message:
      "As compras estão desativadas neste dispositivo. Verifique suas configurações ou restrições parentais.",
    icon: "lock-closed-outline",
    primaryAction: { label: "Abrir configurações", type: "settings" },
    secondaryAction: { label: "Fechar", type: "dismiss" },
  },

  [PURCHASES_ERROR_CODE.PURCHASE_INVALID_ERROR]: {
    severity: "error",
    title: "Compra inválida",
    message:
      "Não foi possível validar sua compra. Se o problema persistir, entre em contato com o suporte.",
    icon: "alert-circle-outline",
    primaryAction: { label: "Entrar em contato", type: "contact" },
    secondaryAction: { label: "Fechar", type: "dismiss" },
  },

  [PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR]: {
    severity: "error",
    title: "Plano indisponível",
    message:
      "Este plano não está disponível para compra na sua região ou dispositivo no momento.",
    icon: "bag-remove-outline",
    primaryAction: { label: "Fechar", type: "dismiss" },
  },

  [PURCHASES_ERROR_CODE.RECEIPT_ALREADY_IN_USE_ERROR]: {
    severity: "error",
    title: "Recibo já utilizado",
    message:
      "Este recibo já está vinculado a outra conta. Tente restaurar compras com a conta original.",
    icon: "receipt-outline",
    primaryAction: { label: "Restaurar compras", type: "restore" },
    secondaryAction: { label: "Fechar", type: "dismiss" },
  },

  [PURCHASES_ERROR_CODE.RECEIPT_IN_USE_BY_OTHER_SUBSCRIBER_ERROR]: {
    severity: "error",
    title: "Assinatura vinculada a outra conta",
    message:
      "Esta assinatura pertence a outra conta. Faça login com a conta correta ou entre em contato com o suporte.",
    icon: "people-outline",
    primaryAction: { label: "Entrar em contato", type: "contact" },
    secondaryAction: { label: "Fechar", type: "dismiss" },
  },

  [PURCHASES_ERROR_CODE.INELIGIBLE_ERROR]: {
    severity: "error",
    title: "Oferta não disponível",
    message:
      "Você não é elegível para esta oferta. Verifique os planos disponíveis para sua conta.",
    icon: "pricetag-outline",
    primaryAction: { label: "Fechar", type: "dismiss" },
  },

  [PURCHASES_ERROR_CODE.INSUFFICIENT_PERMISSIONS_ERROR]: {
    severity: "error",
    title: "Permissão necessária",
    message:
      "Não há permissão para realizar esta compra. Verifique as configurações do dispositivo.",
    icon: "key-outline",
    primaryAction: { label: "Abrir configurações", type: "settings" },
    secondaryAction: { label: "Fechar", type: "dismiss" },
  },

  [PURCHASES_ERROR_CODE.INVALID_PROMOTIONAL_OFFER_ERROR]: {
    severity: "error",
    title: "Oferta promocional inválida",
    message:
      "Não foi possível aplicar esta promoção. Tente novamente ou escolha outro plano.",
    icon: "gift-outline",
    primaryAction: { label: "Tentar novamente", type: "retry" },
    secondaryAction: { label: "Fechar", type: "dismiss" },
  },
};

// Fallback para erros internos/desconhecidos
const INTERNAL_FALLBACK: PurchaseErrorInfo = {
  severity: "internal",
  title: "Algo deu errado",
  message:
    "Tente novamente mais tarde. Se o problema persistir, entre em contato com nosso suporte.",
  icon: "warning-outline",
  primaryAction: { label: "Fechar", type: "dismiss" },
  secondaryAction: { label: "Entrar em contato", type: "contact" },
};

// ─── Helper ─────────────────────────────────────────────────────────

export function getPurchaseErrorInfo(
  error: unknown,
): PurchaseErrorInfo | null {
  if (!error || typeof error !== "object") return INTERNAL_FALLBACK;

  const code = (error as any).code as string | undefined;

  // Checagem legada de userCancelled
  if ((error as any).userCancelled) return null;

  if (code && code in PURCHASE_ERROR_MAP) {
    const info = PURCHASE_ERROR_MAP[code];
    if (info.severity === "silent") return null;
    return info;
  }

  return INTERNAL_FALLBACK;
}
