import { FeatureGate } from "@/components/FeatureGate";
import { FuelComparisonCard } from "@/components/analytics/FuelComparisonCard";
import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { useFuel, useFuelComparison } from "@/hooks/useFuel";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface FuelAnalyticsSectionProps {
  vehicleId: string;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatLiters(value: number): string {
  return `${value.toFixed(1).replace(".", ",")} L`;
}

function formatKmL(value: number): string {
  return value.toFixed(1).replace(".", ",");
}

function FuelStatsContent({ vehicleId }: { vehicleId: string }) {
  const { stats, loading } = useFuel(vehicleId);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.dark.primary} />
      </View>
    );
  }

  if (!stats || !stats.has_data) {
    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyIconCircle}>
          <Ionicons
            name="water-outline"
            size={28}
            color={Colors.dark.textMuted}
          />
        </View>
        <Text style={styles.emptyText}>
          Abasteça com tanque cheio para calcular consumo
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: "#22C55E" }]}>
            {formatKmL(stats.avg_km_per_liter)}
          </Text>
          <Text style={styles.statLabel}>km/l</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {formatCurrency(stats.cost_this_month)}
          </Text>
          <Text style={styles.statLabel}>gasto/mês</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {formatLiters(stats.liters_this_month)}
          </Text>
          <Text style={styles.statLabel}>litros/mês</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {formatCurrency(stats.cost_this_year)}
          </Text>
          <Text style={styles.statLabel}>gasto/ano</Text>
        </View>
      </View>

      {/* Footer stats */}
      <Text style={styles.footerStats}>
        {stats.total_logs} abastecimentos · {stats.kml_data_points} tanques
        cheios
      </Text>
    </View>
  );
}

function FuelComparisonContent({ vehicleId }: { vehicleId: string }) {
  const { comparison, loading } = useFuelComparison(vehicleId);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.dark.primary} />
      </View>
    );
  }

  if (!comparison) return null;

  return <FuelComparisonCard comparison={comparison} />;
}

export function FuelAnalyticsSection({
  vehicleId,
}: FuelAnalyticsSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Combustível</Text>

      <View style={styles.contentCard}>
        <FeatureGate feature="fuel_stats_advanced" mode="card">
          <FuelStatsContent vehicleId={vehicleId} />
        </FeatureGate>

        <FeatureGate feature="fuel_comparison" mode="card">
          <FuelComparisonContent vehicleId={vehicleId} />
        </FeatureGate>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size.xl,
    color: Colors.dark.text,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  contentCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius["2xl"],
    padding: Spacing.xl,
    borderWidth: 0.5,
    borderColor: Colors.dark.borderStrong,
  },
  loadingContainer: {
    padding: Spacing["3xl"],
    alignItems: "center",
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  emptyText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: Fonts.size.sm * 1.5,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  statCard: {
    width: "47%",
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  statValue: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size.xl,
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
  footerStats: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textMuted,
    textAlign: "center",
    marginTop: Spacing.lg,
  },
});
