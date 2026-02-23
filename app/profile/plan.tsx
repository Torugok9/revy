import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { useFeaturesContext } from "@/contexts/FeaturesContext";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useVehicles } from "@/hooks/useVehicles";
import type { FeatureKey } from "@/types/plans";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FEATURE_DISPLAY: Record<FeatureKey, { icon: string; label: string }> = {
  pdf_export: { icon: "document-text-outline", label: "Exportação em PDF" },
  push_reminders: { icon: "notifications-outline", label: "Lembretes push" },
  receipt_photo: { icon: "camera-outline", label: "Foto de comprovantes" },
  multi_user: { icon: "people-outline", label: "Multi-usuário" },
  fleet_dashboard: { icon: "stats-chart-outline", label: "Dashboard de frota" },
  km_charts: { icon: "trending-up-outline", label: "Gráficos de km" },
  cost_per_km: { icon: "calculator-outline", label: "Custo por km" },
  fuel_comparison: { icon: "swap-horizontal-outline", label: "Comparação de combustível" },
  fuel_stats_advanced: { icon: "bar-chart-outline", label: "Estatísticas avançadas" },
  sale_report: { icon: "clipboard-outline", label: "Relatório para venda" },
  odometer_history: { icon: "time-outline", label: "Histórico de km" },
};

/** Features base que todos os planos têm */
const BASE_FEATURES: { icon: string; label: string }[] = [
  { icon: "construct-outline", label: "Registro de manutenções" },
  { icon: "speedometer-outline", label: "Controle de quilometragem" },
];

function getStatusLabel(status?: string): { text: string; color: string } {
  switch (status) {
    case "active":
      return { text: "Ativa", color: Colors.dark.success };
    case "trialing":
      return { text: "Período de teste", color: Colors.dark.warning };
    case "past_due":
      return { text: "Pagamento pendente", color: Colors.dark.warning };
    case "canceled":
      return { text: "Cancelada", color: Colors.dark.danger };
    default:
      return { text: "Ativa", color: Colors.dark.success };
  }
}

export default function MyPlanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { plan, planName, planIcon } = useUserInfo();
  const { vehicles, loading: vehiclesLoading } = useVehicles();
  const { features: userFeatures } = useFeaturesContext();

  const features = useMemo(() => {
    const vehicleLabel =
      (plan?.max_vehicles ?? 1) === 1
        ? "Até 1 veículo"
        : plan?.max_vehicles === 999
          ? "Veículos ilimitados"
          : `Até ${plan?.max_vehicles} veículos`;

    const base = [{ icon: "car-outline", label: vehicleLabel }, ...BASE_FEATURES];
    const dynamic = userFeatures
      .map((key) => FEATURE_DISPLAY[key])
      .filter(Boolean);

    return [...base, ...dynamic];
  }, [userFeatures, plan?.max_vehicles]);
  const status = getStatusLabel(plan?.subscription_status);
  const vehicleCount = vehicles.length;
  const maxVehicles = plan?.max_vehicles ?? 1;
  const usagePercent = Math.min((vehicleCount / maxVehicles) * 100, 100);
  const isAtLimit = vehicleCount >= maxVehicles;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Meu Plano</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Plan Card */}
        <View style={styles.planCard}>
          <Text style={styles.planIcon}>{planIcon}</Text>
          <Text style={styles.planName}>Plano {planName}</Text>
          <View style={[styles.statusBadge, { borderColor: status.color }]}>
            <View
              style={[styles.statusDot, { backgroundColor: status.color }]}
            />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.text}
            </Text>
          </View>
          {plan?.description ? (
            <Text style={styles.planDescription}>{plan.description}</Text>
          ) : null}
        </View>

        {/* Usage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uso de veículos</Text>
          <View style={styles.usageCard}>
            <View style={styles.usageHeader}>
              <Text style={styles.usageCount}>
                {vehiclesLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors.dark.primary}
                  />
                ) : (
                  `${vehicleCount}/${maxVehicles}`
                )}
              </Text>
              <Text style={styles.usageLabel}>
                {maxVehicles === 1 ? "veículo" : "veículos"}
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${usagePercent}%`,
                    backgroundColor: isAtLimit
                      ? Colors.dark.warning
                      : Colors.dark.primary,
                  },
                ]}
              />
            </View>
            {isAtLimit ? (
              <Text style={styles.limitText}>
                Limite atingido. Faça upgrade para adicionar mais veículos.
              </Text>
            ) : null}
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recursos do plano</Text>
          <View style={styles.featuresCard}>
            {features.map((feature, index) => (
              <View
                key={index}
                style={[
                  styles.featureRow,
                  index < features.length - 1 && styles.featureRowBorder,
                ]}
              >
                <Ionicons
                  name={feature.icon as any}
                  size={20}
                  color={Colors.dark.primary}
                />
                <Text style={styles.featureText}>{feature.label}</Text>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={Colors.dark.success}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Upgrade CTA */}
        {planName.toLowerCase() === "free" ? (
          <View style={styles.upgradeSection}>
            <Text style={styles.upgradeTitle}>Quer mais recursos?</Text>
            <Text style={styles.upgradeDescription}>
              Faça upgrade para o Pro e tenha até 5 veículos, exportação em PDF,
              lembretes e muito mais.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.upgradeButton,
                pressed && styles.upgradeButtonPressed,
              ]}
              onPress={() => {
                // TODO: Implementar fluxo de upgrade
              }}
            >
              <Ionicons name="rocket-outline" size={18} color="#FFFFFF" />
              <Text style={styles.upgradeButtonText}>Fazer upgrade</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={{ height: Spacing["4xl"] }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  headerTitle: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
    flex: 1,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  // Plan Card
  planCard: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing["2xl"],
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.dark.borderStrong,
    marginBottom: Spacing["3xl"],
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  planIcon: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  planName: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size.xl,
    color: Colors.dark.text,
    marginBottom: Spacing.md,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.xs,
  },
  planDescription: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginTop: Spacing.md,
  },
  // Sections
  section: {
    marginBottom: Spacing["3xl"],
  },
  sectionTitle: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.lg,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // Usage
  usageCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  usageHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  usageCount: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size["2xl"],
    color: Colors.dark.text,
  },
  usageLabel: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.dark.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  limitText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.xs,
    color: Colors.dark.warning,
    marginTop: Spacing.sm,
  },
  // Features
  featuresCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: "hidden",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  featureRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  featureText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
    flex: 1,
  },
  // Upgrade
  upgradeSection: {
    backgroundColor: Colors.dark.primaryGlow,
    borderRadius: BorderRadius.xl,
    padding: Spacing["2xl"],
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    alignItems: "center",
  },
  upgradeTitle: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
    marginBottom: Spacing.sm,
  },
  upgradeDescription: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: Fonts.lineHeight.normal * Fonts.size.sm,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing["2xl"],
    gap: Spacing.sm,
  },
  upgradeButtonPressed: {
    opacity: 0.8,
  },
  upgradeButtonText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: "#FFFFFF",
  },
});
