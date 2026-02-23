import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import type { FuelComparison, FuelComparisonItem, FuelType } from "@/types/fuel";
import { FUEL_TYPE_COLORS, FUEL_TYPE_LABELS } from "@/types/fuel";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface FuelComparisonCardProps {
  comparison: FuelComparison;
}

function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

function formatKmL(value: number): string {
  return `${value.toFixed(1).replace(".", ",")} km/l`;
}

function ComparisonColumn({
  item,
  isWinner,
}: {
  item: FuelComparisonItem;
  isWinner: boolean;
}) {
  const color = FUEL_TYPE_COLORS[item.fuel_type] || Colors.dark.textSecondary;
  const label = FUEL_TYPE_LABELS[item.fuel_type] || item.fuel_type;

  return (
    <View
      style={[
        styles.column,
        isWinner && { borderColor: Colors.dark.success, borderWidth: 1 },
      ]}
    >
      <View style={[styles.columnHeader, { backgroundColor: color + "20" }]}>
        <Text style={[styles.columnTitle, { color }]}>{label.toUpperCase()}</Text>
      </View>
      <View style={styles.columnBody}>
        <Text style={styles.metricValue}>{formatKmL(item.avg_km_per_liter)}</Text>
        <Text style={styles.metricLabel}>km/l</Text>

        <Text style={[styles.metricValue, { marginTop: Spacing.md }]}>
          {formatCurrency(item.avg_price_per_liter)}/L
        </Text>
        <Text style={styles.metricLabel}>preço médio</Text>

        <View style={styles.costRow}>
          <Text style={styles.metricValue}>
            {formatCurrency(item.cost_per_km)}/km
          </Text>
          {isWinner && (
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={Colors.dark.success}
            />
          )}
        </View>
        <Text style={styles.metricLabel}>custo por km</Text>
      </View>
    </View>
  );
}

export function FuelComparisonCard({ comparison }: FuelComparisonCardProps) {
  if (!comparison.has_data || comparison.fuels.length < 2) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Gasolina vs Etanol</Text>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="swap-horizontal-outline"
            size={24}
            color={Colors.dark.textMuted}
          />
          <Text style={styles.emptyText}>
            Registre com outro combustível para comparar
          </Text>
        </View>
      </View>
    );
  }

  const cheapestLabel = comparison.cheapest
    ? FUEL_TYPE_LABELS[comparison.cheapest]
    : null;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Gasolina vs Etanol</Text>

      {cheapestLabel && (
        <View style={styles.recommendationRow}>
          <Ionicons name="trophy" size={18} color="#F59E0B" />
          <Text style={styles.recommendationText}>
            {cheapestLabel} é mais econômica
          </Text>
        </View>
      )}

      <View style={styles.columnsRow}>
        {comparison.fuels.slice(0, 2).map((fuel) => (
          <ComparisonColumn
            key={fuel.fuel_type}
            item={fuel}
            isWinner={fuel.fuel_type === comparison.cheapest}
          />
        ))}
      </View>

      <Text style={styles.footer}>{comparison.recommendation}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },
  cardTitle: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
    marginBottom: Spacing.md,
  },
  recommendationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  recommendationText: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: "#F59E0B",
  },
  columnsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  column: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: Colors.dark.borderStrong,
  },
  columnHeader: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
  },
  columnTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  columnBody: {
    padding: Spacing.md,
  },
  metricValue: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
  metricLabel: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.xs,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.xs,
  },
  costRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  emptyContainer: {
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    textAlign: "center",
  },
  footer: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textMuted,
    textAlign: "center",
    marginTop: Spacing.lg,
  },
});
