import { FeatureGate } from "@/components/FeatureGate";
import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { useCostPerKm } from "@/hooks/useAnalytcs";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface CostPerKmSectionProps {
  vehicleId: string;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatCostPerKm(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}/km`;
}

function formatKm(value: number): string {
  return value.toLocaleString("pt-BR") + " km";
}

function CostPerKmContent({ vehicleId }: { vehicleId: string }) {
  const { data, loading } = useCostPerKm(vehicleId);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.dark.primary} />
      </View>
    );
  }

  if (!data || !data.has_data) {
    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyIconCircle}>
          <Ionicons
            name="calculator-outline"
            size={28}
            color={Colors.dark.textMuted}
          />
        </View>
        <Text style={styles.emptyText}>
          Registre manutenções e abastecimentos para calcular
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.contentCard}>
      {/* Main cost */}
      <View style={styles.mainCostContainer}>
        <Text style={styles.mainCostValue}>
          {formatCostPerKm(data.cost_per_km)}
        </Text>
        <Text style={styles.mainCostLabel}>custo total por km</Text>
      </View>

      {/* Breakdown cards */}
      <View style={styles.breakdownRow}>
        <View style={[styles.breakdownCard, styles.maintenanceCard]}>
          <View style={styles.breakdownAccent}>
            <View
              style={[styles.accentDot, { backgroundColor: "#3B82F6" }]}
            />
            <Text style={styles.breakdownLabel}>MANUTENÇÃO</Text>
          </View>
          <Text style={styles.breakdownValue}>
            {formatCostPerKm(data.maintenance_per_km)}
          </Text>
          <Text style={styles.breakdownPct}>
            {Math.round(data.maintenance_pct)}%
          </Text>
        </View>

        <View style={[styles.breakdownCard, styles.fuelCard]}>
          <View style={styles.breakdownAccent}>
            <View
              style={[styles.accentDot, { backgroundColor: "#22C55E" }]}
            />
            <Text style={styles.breakdownLabel}>COMBUSTÍVEL</Text>
          </View>
          <Text style={styles.breakdownValue}>
            {formatCostPerKm(data.fuel_per_km)}
          </Text>
          <Text style={styles.breakdownPct}>
            {Math.round(data.fuel_pct)}%
          </Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Base: {formatKm(data.km_range)} rastreados
      </Text>
    </View>
  );
}

export function CostPerKmSection({ vehicleId }: CostPerKmSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Custo Operacional</Text>
      <FeatureGate feature="cost_per_km" mode="card">
        <CostPerKmContent vehicleId={vehicleId} />
      </FeatureGate>
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
  loadingContainer: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius["2xl"],
    padding: Spacing["3xl"],
    alignItems: "center",
  },
  emptyCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius["2xl"],
    padding: Spacing["2xl"],
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: Colors.dark.borderStrong,
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
  contentCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius["2xl"],
    padding: Spacing.xl,
    borderWidth: 0.5,
    borderColor: Colors.dark.borderStrong,
  },
  mainCostContainer: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  mainCostValue: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size["3xl"],
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  mainCostLabel: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
  breakdownRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  breakdownCard: {
    flex: 1,
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  maintenanceCard: {
    borderLeftWidth: 3,
    borderLeftColor: "#3B82F6",
  },
  fuelCard: {
    borderLeftWidth: 3,
    borderLeftColor: "#22C55E",
  },
  breakdownAccent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  accentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownLabel: {
    fontFamily: Fonts.family.semibold,
    fontSize: 10,
    color: Colors.dark.textSecondary,
    letterSpacing: 0.5,
  },
  breakdownValue: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  breakdownPct: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
  footer: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textMuted,
    textAlign: "center",
  },
});
