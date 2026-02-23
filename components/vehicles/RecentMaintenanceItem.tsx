import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Maintenance, MaintenanceType } from "@/types/vehicle";
import { Colors, Fonts, Spacing } from "@/constants/theme";

interface RecentMaintenanceItemProps {
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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

function formatCurrency(value: number | null | undefined): string {
  if (!value) return "";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function RecentMaintenanceItem({
  maintenance,
  onPress,
  onLongPress,
}: RecentMaintenanceItemProps) {
  const typeColor = getTypeColor(maintenance.type);
  const costText = formatCurrency(maintenance.cost);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
    >
      <View style={styles.leftSide}>
        <View style={[styles.dot, { backgroundColor: typeColor }]} />
        <Text style={styles.titleText} numberOfLines={1}>
          {maintenance.title}
          {costText ? ` - ${costText}` : ""}
        </Text>
      </View>

      <View style={styles.rightSide}>
        <View style={[styles.dot, { backgroundColor: typeColor }]} />
        <Text style={styles.dateText}>{formatDate(maintenance.date)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  containerPressed: {
    opacity: 0.7,
  },
  leftSide: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: Spacing.lg,
  },
  rightSide: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  titleText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.text,
    flex: 1,
  },
  dateText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
});
