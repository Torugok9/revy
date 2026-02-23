import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { useFuelComparison } from "@/hooks/useFuel";
import { FUEL_TYPE_COLORS, FUEL_TYPE_LABELS } from "@/types/fuel";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface FuelComparisonProps {
  vehicleId: string;
}

export function FuelComparison({ vehicleId }: FuelComparisonProps) {
  const { comparison, loading, error } = useFuelComparison(vehicleId);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Colors.dark.primary} />
      </View>
    );
  }

  if (error || !comparison?.has_data) {
    return (
      <View style={styles.noDataCard}>
        <Ionicons
          name="analytics-outline"
          size={20}
          color={Colors.dark.textMuted}
        />
        <Text style={styles.noDataText}>
          Registre abastecimentos com diferentes combustíveis para ver a
          comparação.
        </Text>
      </View>
    );
  }

  if (comparison.fuels.length < 2) {
    return (
      <View style={styles.noDataCard}>
        <Ionicons
          name="swap-horizontal-outline"
          size={20}
          color={Colors.dark.textMuted}
        />
        <Text style={styles.noDataText}>
          Registre abastecimentos com outro combustível para comparar.
        </Text>
      </View>
    );
  }

  const totalDataPoints = comparison.fuels.reduce(
    (sum, f) => sum + f.data_points,
    0,
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Comparação de Combustíveis</Text>
      </View>

      {comparison.recommendation && (
        <View style={styles.recommendationCard}>
          <Ionicons
            name="trophy-outline"
            size={16}
            color={Colors.dark.warning}
          />
          <Text style={styles.recommendationText}>
            {comparison.recommendation}
          </Text>
        </View>
      )}

      {comparison.fuels.map((fuel) => {
        const color = FUEL_TYPE_COLORS[fuel.fuel_type];
        const isCheapest = fuel.fuel_type === comparison.cheapest;
        return (
          <View
            key={fuel.fuel_type}
            style={[styles.fuelRow, isCheapest && styles.fuelRowCheapest]}
          >
            <View style={[styles.fuelDot, { backgroundColor: color }]} />
            <View style={styles.fuelInfo}>
              <Text style={styles.fuelName}>
                {FUEL_TYPE_LABELS[fuel.fuel_type]}
              </Text>
              <Text style={styles.fuelMetrics}>
                {fuel.avg_km_per_liter.toFixed(1)} km/l • R${" "}
                {fuel.avg_price_per_liter.toFixed(2)}/l
              </Text>
            </View>
            <View style={styles.costPerKm}>
              <Text
                style={[
                  styles.costPerKmValue,
                  isCheapest && { color: Colors.dark.success },
                ]}
              >
                R$ {fuel.cost_per_km.toFixed(2)}
              </Text>
              <Text style={styles.costPerKmLabel}>/km</Text>
            </View>
          </View>
        );
      })}

      <Text style={styles.footerText}>
        Baseado em {totalDataPoints} abastecimentos
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.dark.borderStrong,
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    padding: Spacing.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.dark.borderStrong,
    marginBottom: Spacing.lg,
  },
  noDataText: {
    flex: 1,
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
  headerRow: {
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.sm,
    color: Colors.dark.text,
  },
  recommendationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.dark.warning + "15",
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  recommendationText: {
    flex: 1,
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.warning,
  },
  fuelRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.dark.border,
  },
  fuelRowCheapest: {
    backgroundColor: Colors.dark.success + "08",
    marginHorizontal: -Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  fuelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.md,
  },
  fuelInfo: {
    flex: 1,
  },
  fuelName: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.sm,
    color: Colors.dark.text,
  },
  fuelMetrics: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.xs,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  costPerKm: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  costPerKmValue: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
  costPerKmLabel: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.xs,
    color: Colors.dark.textSecondary,
  },
  footerText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.xs,
    color: Colors.dark.textMuted,
    textAlign: "center",
    marginTop: Spacing.md,
  },
});
