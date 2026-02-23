import { FeatureGate } from "@/components/FeatureGate";
import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { useExpenseBreakdown } from "@/hooks/useAnalytcs";
import {
  EXPENSE_CATEGORY_COLORS,
  MAINTENANCE_TYPE_LABELS,
} from "@/types/analytcs";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface ExpenseBreakdownSectionProps {
  vehicleId: string;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  fuel: "water",
  revision: "construct",
  part_change: "build",
  repair: "hammer",
  other: "cube",
};

interface BreakdownItem {
  category: string;
  total: number;
  pct: number;
  color: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

function ExpenseBreakdownContent({
  vehicleId,
}: {
  vehicleId: string;
}) {
  const { data, loading } = useExpenseBreakdown(vehicleId);

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
            name="pie-chart-outline"
            size={28}
            color={Colors.dark.textMuted}
          />
        </View>
        <Text style={styles.emptyText}>
          Registre manutenções e abastecimentos para ver o breakdown
        </Text>
      </View>
    );
  }

  // Build items: fuel + maintenance categories, sorted by total
  const items: BreakdownItem[] = [];

  // Add fuel
  if (data.fuel.total > 0) {
    items.push({
      category: "fuel",
      total: data.fuel.total,
      pct: data.fuel.pct,
      color: EXPENSE_CATEGORY_COLORS.fuel,
      label: "Combustível",
      icon: CATEGORY_ICONS.fuel,
    });
  }

  // Add maintenance categories
  for (const m of data.maintenance_with_pct) {
    items.push({
      category: m.category,
      total: m.total,
      pct: m.pct,
      color:
        EXPENSE_CATEGORY_COLORS[m.category] || EXPENSE_CATEGORY_COLORS.other,
      label:
        MAINTENANCE_TYPE_LABELS[m.category] || m.category,
      icon: CATEGORY_ICONS[m.category] || CATEGORY_ICONS.other,
    });
  }

  // Sort by total desc
  items.sort((a, b) => b.total - a.total);

  const maxPct = items.length > 0 ? items[0].pct : 100;

  return (
    <View style={styles.contentCard}>
      {/* Total */}
      <Text style={styles.totalLabel}>Total</Text>
      <Text style={styles.totalValue}>{formatCurrency(data.grand_total)}</Text>

      {/* Breakdown list */}
      <View style={styles.breakdownList}>
        {items.map((item) => (
          <View key={item.category} style={styles.breakdownItem}>
            <View style={styles.itemHeader}>
              <View style={styles.itemLeft}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: item.color + "20" },
                  ]}
                >
                  <Ionicons name={item.icon} size={14} color={item.color} />
                </View>
                <Text style={styles.itemLabel}>{item.label}</Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemValue}>
                  {formatCurrency(item.total)}
                </Text>
                <Text style={styles.itemPct}>
                  {item.pct.toFixed(1).replace(".", ",")}%
                </Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: item.color,
                    width: `${(item.pct / maxPct) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function ExpenseBreakdownSection({
  vehicleId,
}: ExpenseBreakdownSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Gastos por Categoria</Text>
      <FeatureGate feature="fuel_stats_advanced" mode="card">
        <ExpenseBreakdownContent vehicleId={vehicleId} />
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
  totalLabel: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.xs,
  },
  totalValue: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size["2xl"],
    color: Colors.dark.text,
    marginBottom: Spacing.xl,
  },
  breakdownList: {
    gap: Spacing.lg,
  },
  breakdownItem: {
    gap: Spacing.sm,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  itemLabel: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  itemValue: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
  itemPct: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    minWidth: 45,
    textAlign: "right",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
});
