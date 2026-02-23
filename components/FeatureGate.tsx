import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { useFeaturesContext } from "@/contexts/FeaturesContext";
import type { FeatureKey } from "@/types/plans";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const FEATURE_LABELS: Record<FeatureKey, string> = {
  pdf_export: "Exportar em PDF",
  push_reminders: "Lembretes push",
  receipt_photo: "Foto de comprovantes",
  multi_user: "Multi-usuário",
  fleet_dashboard: "Dashboard de frota",
  km_charts: "Gráficos de km",
  cost_per_km: "Custo por km",
  fuel_comparison: "Comparação de combustível",
  fuel_stats_advanced: "Estatísticas avançadas",
  sale_report: "Relatório para venda",
  odometer_history: "Histórico de km",
};

interface FeatureGateProps {
  feature: FeatureKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function DefaultFallback({ feature }: { feature: FeatureKey }) {
  const router = useRouter();
  const label = FEATURE_LABELS[feature] || feature;

  return (
    <View style={styles.fallbackCard}>
      <View style={styles.fallbackIconContainer}>
        <Ionicons name="lock-closed" size={20} color={Colors.dark.primary} />
      </View>
      <View style={styles.fallbackContent}>
        <Text style={styles.fallbackTitle}>{label}</Text>
        <Text style={styles.fallbackDescription}>
          Disponível no Premium
        </Text>
      </View>
      <Pressable
        onPress={() => router.push("/profile/plan")}
        style={({ pressed }) => [
          styles.fallbackButton,
          pressed && styles.fallbackButtonPressed,
        ]}
      >
        <Text style={styles.fallbackButtonText}>Upgrade</Text>
      </Pressable>
    </View>
  );
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { canUse } = useFeaturesContext();

  if (canUse(feature)) {
    return <>{children}</>;
  }

  return <>{fallback ?? <DefaultFallback feature={feature} />}</>;
}

const styles = StyleSheet.create({
  fallbackCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.borderStrong,
    gap: Spacing.md,
  },
  fallbackIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.dark.primaryGlow,
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackContent: {
    flex: 1,
  },
  fallbackTitle: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.sm,
    color: Colors.dark.text,
  },
  fallbackDescription: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.xs,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  fallbackButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  fallbackButtonPressed: {
    opacity: 0.8,
  },
  fallbackButtonText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.xs,
    color: "#FFFFFF",
  },
});
