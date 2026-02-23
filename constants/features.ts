import type { FeatureKey } from "@/types/plans";

export interface FeatureDisplayInfo {
  name: string;
  description: string;
  icon: string; // Ionicons name
}

export const FEATURE_DISPLAY: Record<FeatureKey, FeatureDisplayInfo> = {
  pdf_export: {
    name: "Exportar PDF",
    description:
      "Exporte o histórico completo do veículo em PDF para compartilhar ou guardar.",
    icon: "document-text-outline",
  },
  push_reminders: {
    name: "Lembretes Inteligentes",
    description:
      "Receba notificações quando uma manutenção estiver próxima ou vencida.",
    icon: "notifications-outline",
  },
  receipt_photo: {
    name: "Foto da Nota Fiscal",
    description:
      "Anexe fotos das notas fiscais diretamente nas manutenções.",
    icon: "camera-outline",
  },
  km_charts: {
    name: "Gráficos de Quilometragem",
    description:
      "Acompanhe a evolução do uso do seu carro com gráficos interativos.",
    icon: "trending-up-outline",
  },
  cost_per_km: {
    name: "Custo por Quilômetro",
    description:
      "Saiba exatamente quanto cada km rodado custa incluindo combustível e manutenção.",
    icon: "calculator-outline",
  },
  fuel_comparison: {
    name: "Comparação de Combustível",
    description:
      "Descubra se gasolina ou etanol compensa mais no seu carro.",
    icon: "swap-horizontal-outline",
  },
  fuel_stats_advanced: {
    name: "Análise de Consumo",
    description:
      "Estatísticas detalhadas do consumo e gasto com combustível.",
    icon: "bar-chart-outline",
  },
  sale_report: {
    name: "Relatório de Venda",
    description:
      "Gere um relatório de procedência para valorizar seu carro na venda.",
    icon: "clipboard-outline",
  },
  odometer_history: {
    name: "Histórico de Quilometragem",
    description:
      "Visualize a série temporal completa de km com filtros por período.",
    icon: "time-outline",
  },
  multi_user: {
    name: "Multi-usuário",
    description: "Gerencie veículos com múltiplos usuários.",
    icon: "people-outline",
  },
  fleet_dashboard: {
    name: "Dashboard de Frota",
    description: "Visão consolidada de todos os veículos da empresa.",
    icon: "grid-outline",
  },
};
