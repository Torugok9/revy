import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  GestureResponderEvent,
} from "react-native";
import { Maintenance, MaintenanceType } from "@/types/vehicle";
import { Colors, Fonts, Spacing, BorderRadius } from "@/constants/theme";

interface MaintenanceItemProps {
  maintenance: Maintenance;
  onPress?: () => void;
  onLongPress?: () => void;
}

function getTypeColor(type: MaintenanceType): string {
  switch (type) {
    case "revision":
      return "#DC2626";
    case "part_change":
      return "#F59E0B";
    case "repair":
      return "#3B82F6";
    case "other":
    default:
      return "#737373";
  }
}

function getTypeLabel(type: MaintenanceType): string {
  switch (type) {
    case "revision":
      return "Revisão";
    case "part_change":
      return "Troca de Peça";
    case "repair":
      return "Reparo";
    case "other":
    default:
      return "Outros";
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatKm(km: number | null | undefined): string {
  if (km === null || km === undefined) return "";
  return km.toLocaleString("pt-BR") + " km";
}

function formatCurrency(value: number | null | undefined): string {
  if (!value) return "";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function MaintenanceItem({
  maintenance,
  onPress,
  onLongPress,
}: MaintenanceItemProps) {
  const typeColor = getTypeColor(maintenance.type);
  const typeLabel = getTypeLabel(maintenance.type);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
    >
      <View style={styles.card}>
        {/* Indicador de tipo */}
        <View
          style={[styles.typeIndicator, { backgroundColor: typeColor }]}
        />

        <View style={styles.content}>
          {/* Linha 1: Título + Tipo */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>{maintenance.title}</Text>
            <Text style={[styles.typeLabel, { color: typeColor }]}>
              {typeLabel}
            </Text>
          </View>

          {/* Linha 2: Data + KM */}
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>
              {formatDate(maintenance.date)}
            </Text>
            {maintenance.km_at_maintenance && (
              <Text style={styles.infoText}>
                {formatKm(maintenance.km_at_maintenance)}
              </Text>
            )}
          </View>

          {/* Linha 3: Custo + Oficina */}
          <View style={styles.footerRow}>
            {maintenance.cost && (
              <Text style={styles.cost}>
                {formatCurrency(maintenance.cost)}
              </Text>
            )}
            {maintenance.workshop_name && (
              <Text style={styles.workshop}>
                {maintenance.workshop_name}
              </Text>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  containerPressed: {
    opacity: 0.7,
  },
  card: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  typeIndicator: {
    width: 4,
    height: "100%",
    borderRadius: 2,
    marginRight: Spacing.lg,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  title: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
    flex: 1,
  },
  typeLabel: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.xs,
    marginLeft: Spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cost: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
    flex: 1,
  },
  workshop: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.xs,
    color: Colors.dark.textMuted,
    flex: 1,
    textAlign: "right",
  },
});
