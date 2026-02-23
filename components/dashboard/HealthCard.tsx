import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { VehicleHealthData } from "@/hooks/useVehicleHealth";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface HealthCardProps {
  health: VehicleHealthData;
}

function getHealthColor(score: number): string {
  if (score >= 80) return Colors.dark.success;
  if (score >= 50) return Colors.dark.warning;
  return Colors.dark.danger;
}

function getHealthLabel(score: number): string {
  if (score >= 80) return "SAUDÁVEL";
  if (score >= 50) return "ATENÇÃO";
  return "CRÍTICO";
}

function getHealthDescription(score: number): string {
  if (score >= 80) return "Seu veículo está em ótimo estado.";
  if (score >= 50) return "Seu veículo precisa de atenção.";
  return "Seu veículo precisa de manutenção urgente.";
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "Optimal":
      return "Ótimo";
    case "Attention":
      return "Atenção";
    case "Warning":
      return "Atenção";
    case "Critical":
      return "Crítico";
    default:
      return status;
  }
}

function getStatusDotColor(statusColor: string): string {
  switch (statusColor) {
    case "green":
      return Colors.dark.success;
    case "yellow":
      return Colors.dark.warning;
    case "red":
      return Colors.dark.danger;
    default:
      return Colors.dark.success;
  }
}

function formatKm(km: number): string {
  return km.toLocaleString("pt-BR") + " km";
}

export function HealthCard({ health }: HealthCardProps) {
  const healthColor = getHealthColor(health.score);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Saúde da Manutenção</Text>
            <Text style={styles.description}>
              {getHealthDescription(health.score)}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={[styles.scoreText, { color: healthColor }]}>
              {health.score}%
            </Text>
            <Text style={[styles.healthLabel, { color: healthColor }]}>
              {getHealthLabel(health.score)}
            </Text>
          </View>
        </View>

        {/* Status Row */}
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>STATUS</Text>
            <View style={styles.statusValueRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusDotColor(health.status_color) },
                ]}
              />
              <Text style={styles.statusValue}>
                {getStatusLabel(health.status)}
              </Text>
            </View>
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>ODÔMETRO ATUAL</Text>
            <Text style={styles.statusValue}>
              {formatKm(health.current_km)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: BorderRadius["2xl"],
    padding: Spacing.xl,
    borderWidth: 0.5,
    borderColor: Colors.dark.borderStrong,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.xl,
  },
  headerLeft: {
    flex: 1,
    marginRight: Spacing.lg,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  title: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size.xl,
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  description: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    lineHeight: Fonts.lineHeight.normal * Fonts.size.sm,
  },
  scoreText: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size["2xl"],
  },
  healthLabel: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.xs,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  statusItem: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  statusLabel: {
    fontFamily: Fonts.family.medium,
    fontSize: 10,
    color: Colors.dark.textSecondary,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  statusValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusValue: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
});
