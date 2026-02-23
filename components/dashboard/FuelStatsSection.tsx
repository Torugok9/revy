import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { useFuel } from "@/hooks/useFuel";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface FuelStatsSectionProps {
  vehicleId: string;
  onRegisterFuel: () => void;
}

function formatKml(value: number): string {
  if (value <= 0) return "—";
  return value.toFixed(1).replace(".", ",") + " km/l";
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatLiters(value: number): string {
  if (value <= 0) return "—";
  return value.toFixed(1).replace(".", ",") + " L";
}

export function FuelStatsSection({
  vehicleId,
  onRegisterFuel,
}: FuelStatsSectionProps) {
  const { stats, loading } = useFuel(vehicleId);

  if (loading) return null;

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Combustível</Text>
        <Pressable
          onPress={onRegisterFuel}
          style={({ pressed }) => pressed && styles.linkPressed}
        >
          <Text style={styles.sectionLink}>Abastecer</Text>
        </Pressable>
      </View>

      {!stats?.has_data ? (
        /* Empty State */
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconContainer}>
            <Ionicons
              name="water-outline"
              size={32}
              color={Colors.dark.textMuted}
            />
          </View>
          <Text style={styles.emptyTitle}>
            Nenhum abastecimento registrado
          </Text>
          <Text style={styles.emptySubtitle}>
            Registre seus abastecimentos para acompanhar km/litro, gastos e
            consumo do veículo.
          </Text>
          <Pressable
            onPress={onRegisterFuel}
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
              Registrar primeiro abastecimento
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* KM/L Highlight Card */}
          <View style={styles.highlightCard}>
            <View style={styles.highlightLeft}>
              <View style={styles.highlightIconContainer}>
                <Ionicons
                  name="speedometer-outline"
                  size={24}
                  color="#22C55E"
                />
              </View>
              <View>
                <Text style={styles.highlightLabel}>MÉDIA KM/LITRO</Text>
                <Text style={styles.highlightValue}>
                  {formatKml(stats.avg_km_per_liter)}
                </Text>
                {stats.kml_data_points > 0 && (
                  <Text style={styles.highlightHint}>
                    baseado em {stats.kml_data_points}{" "}
                    {stats.kml_data_points === 1 ? "registro" : "registros"}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.grid}>
            <View style={styles.card}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: "rgba(245, 158, 11, 0.15)" },
                ]}
              >
                <Ionicons
                  name="cash-outline"
                  size={20}
                  color="#F59E0B"
                />
              </View>
              <Text style={styles.cardLabel}>GASTO ESTE MÊS</Text>
              <Text style={styles.cardValue}>
                {formatCurrency(stats.cost_this_month)}
              </Text>
            </View>

            <View style={styles.card}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: "rgba(59, 130, 246, 0.15)" },
                ]}
              >
                <Ionicons
                  name="water-outline"
                  size={20}
                  color="#3B82F6"
                />
              </View>
              <Text style={styles.cardLabel}>LITROS ESTE MÊS</Text>
              <Text style={styles.cardValue}>
                {formatLiters(stats.liters_this_month)}
              </Text>
            </View>
          </View>
        </>
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
  highlightCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: BorderRadius["2xl"],
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.dark.borderStrong,
    marginBottom: Spacing.md,
  },
  highlightLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  highlightIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  highlightLabel: {
    fontFamily: Fonts.family.semibold,
    fontSize: 10,
    color: Colors.dark.textSecondary,
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  highlightValue: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size.xl,
    color: "#22C55E",
  },
  highlightHint: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.xs,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  grid: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  card: {
    flex: 1,
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
