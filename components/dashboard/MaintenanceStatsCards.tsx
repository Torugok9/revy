import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Spacing, BorderRadius } from "@/constants/theme";
import { VehicleHealthData } from "@/hooks/useVehicleHealth";

interface MaintenanceStatsCardsProps {
  health: VehicleHealthData;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, "0")}, ${date.getFullYear()}`;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatKm(km: number): string {
  return km.toLocaleString("pt-BR") + " km";
}

function estimateTimeLeft(nextKm: number, currentKm: number): string {
  const kmLeft = nextKm - currentKm;
  if (kmLeft <= 0) return "Agendamento vencido";

  // Estima ~1.000 km/mês como média
  const monthsLeft = Math.round(kmLeft / 1000);
  if (monthsLeft <= 0) return "Em breve";
  if (monthsLeft === 1) return "~ 1 mês restante";
  return `~ ${monthsLeft} meses restante`;
}

export function MaintenanceStatsCards({ health }: MaintenanceStatsCardsProps) {
  return (
    <View style={styles.container}>
      {/* Last Maintenance */}
      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: "rgba(220, 38, 38, 0.15)" }]}>
          <Ionicons name="time-outline" size={22} color={Colors.dark.primary} />
        </View>
        <Text style={styles.cardLabel}>ÚLTIMA MANUTENÇÃO</Text>
        {health.last_maintenance ? (
          <>
            <Text style={styles.cardValue}>
              {formatDate(health.last_maintenance.date)}
            </Text>
            <Text style={styles.cardSubvalue}>
              {formatCurrency(health.last_maintenance.cost)}
            </Text>
          </>
        ) : (
          <Text style={styles.cardValue}>Nenhuma</Text>
        )}
      </View>

      {/* Next Service */}
      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: "rgba(59, 130, 246, 0.15)" }]}>
          <Ionicons name="arrow-forward-outline" size={22} color="#3B82F6" />
        </View>
        <Text style={styles.cardLabel}>PRÓXIMO SERVIÇO</Text>
        {health.next_service ? (
          <>
            <Text style={styles.cardValue}>
              {formatKm(health.next_service.km)}
            </Text>
            <Text style={[styles.cardSubvalue, { color: "#3B82F6" }]}>
              {estimateTimeLeft(health.next_service.km, health.current_km)}
            </Text>
          </>
        ) : (
          <Text style={styles.cardValue}>Não agendado</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
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
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
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
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  cardSubvalue: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.primary,
  },
});
