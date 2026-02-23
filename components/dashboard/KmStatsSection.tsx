import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { useOdometer } from "@/hooks/useOdometer";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface KmStatsSectionProps {
  vehicleId: string;
  onRegisterKm: () => void;
}

function formatKmDisplay(km: number): string {
  return km.toLocaleString("pt-BR") + " km";
}

function formatAvgDisplay(km: number): string {
  return km.toLocaleString("pt-BR") + " km/mês";
}

const STAT_CARDS: {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  getValue: (stats: {
    km_this_month: number;
    km_this_year: number;
    avg_monthly_km: number;
    projected_annual_km: number;
  }) => string;
}[] = [
  {
    key: "month",
    label: "KM ESTE MÊS",
    icon: "trending-up-outline",
    color: Colors.dark.primary,
    bgColor: "rgba(220, 38, 38, 0.15)",
    getValue: (s) => formatKmDisplay(s.km_this_month),
  },
  {
    key: "year",
    label: "KM ESTE ANO",
    icon: "calendar-outline",
    color: "#3B82F6",
    bgColor: "rgba(59, 130, 246, 0.15)",
    getValue: (s) => formatKmDisplay(s.km_this_year),
  },
  {
    key: "avg",
    label: "MÉDIA MENSAL",
    icon: "analytics-outline",
    color: "#22C55E",
    bgColor: "rgba(34, 197, 94, 0.15)",
    getValue: (s) => formatAvgDisplay(s.avg_monthly_km),
  },
  {
    key: "projected",
    label: "PROJEÇÃO ANUAL",
    icon: "rocket-outline",
    color: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.15)",
    getValue: (s) => formatKmDisplay(s.projected_annual_km),
  },
];

export function KmStatsSection({
  vehicleId,
  onRegisterKm,
}: KmStatsSectionProps) {
  const { stats, loading } = useOdometer(vehicleId);

  if (loading || !stats) return null;

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quilometragem</Text>
        <Pressable
          onPress={onRegisterKm}
          style={({ pressed }) => pressed && styles.linkPressed}
        >
          <Text style={styles.sectionLink}>Registrar</Text>
        </Pressable>
      </View>

      {!stats.has_data ? (
        /* Empty State */
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconContainer}>
            <Ionicons
              name="speedometer-outline"
              size={32}
              color={Colors.dark.textMuted}
            />
          </View>
          <Text style={styles.emptyTitle}>
            Nenhum registro de quilometragem
          </Text>
          <Text style={styles.emptySubtitle}>
            Registre a quilometragem atual para acompanhar km rodados, média
            mensal e projeção anual.
          </Text>
          <Pressable
            onPress={onRegisterKm}
            style={({ pressed }) => [
              styles.emptyButton,
              pressed && styles.emptyButtonPressed,
            ]}
          >
            <Ionicons
              name="add-circle-outline"
              size={18}
              color={Colors.dark.text}
            />
            <Text style={styles.emptyButtonText}>
              Registrar primeira quilometragem
            </Text>
          </Pressable>
        </View>
      ) : (
        /* Stats Grid 2x2 */
        <View style={styles.grid}>
          {STAT_CARDS.map((card) => (
            <View key={card.key} style={styles.card}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: card.bgColor },
                ]}
              >
                <Ionicons name={card.icon} size={20} color={card.color} />
              </View>
              <Text style={styles.cardLabel}>{card.label}</Text>
              <Text style={styles.cardValue}>{card.getValue(stats)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing["2xl"],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
  },
  sectionLink: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.primary,
  },
  linkPressed: {
    opacity: 0.7,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  card: {
    width: "48%",
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: BorderRadius["2xl"],
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.dark.borderStrong,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  cardLabel: {
    fontFamily: Fonts.family.semibold,
    fontSize: 10,
    color: Colors.dark.textSecondary,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  cardValue: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size.md,
    color: Colors.dark.text,
  },
  emptyCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: BorderRadius["2xl"],
    padding: Spacing["2xl"],
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: Colors.dark.borderStrong,
  },
  emptyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: Fonts.size.sm * 1.5,
    marginBottom: Spacing.xl,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  emptyButtonPressed: {
    opacity: 0.8,
  },
  emptyButtonText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.sm,
    color: Colors.dark.text,
  },
});
