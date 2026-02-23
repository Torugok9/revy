import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Maintenance, MaintenanceType } from "@/types/vehicle";
import { Colors, Fonts, Spacing, BorderRadius } from "@/constants/theme";

interface RecentActivityListProps {
  maintenances: Maintenance[];
  onViewAll?: () => void;
}

function getTypeIcon(type: MaintenanceType): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case "revision":
      return "construct";
    case "part_change":
      return "swap-vertical";
    case "repair":
      return "build";
    case "other":
    default:
      return "ellipsis-horizontal";
  }
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

function getTypeBgColor(type: MaintenanceType): string {
  switch (type) {
    case "revision":
      return "rgba(220, 38, 38, 0.15)";
    case "part_change":
      return "rgba(245, 158, 11, 0.15)";
    case "repair":
      return "rgba(59, 130, 246, 0.15)";
    case "other":
    default:
      return "rgba(115, 115, 115, 0.15)";
  }
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `${diffDays} dias atrás`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} sem. atrás`;
  }

  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, "0")}, ${date.getFullYear()}`;
}

function ActivityItem({ maintenance }: { maintenance: Maintenance }) {
  const iconName = getTypeIcon(maintenance.type);
  const typeColor = getTypeColor(maintenance.type);
  const bgColor = getTypeBgColor(maintenance.type);

  return (
    <View style={itemStyles.container}>
      <View style={[itemStyles.iconContainer, { backgroundColor: bgColor }]}>
        <Ionicons name={iconName} size={18} color={typeColor} />
      </View>

      <View style={itemStyles.content}>
        <Text style={itemStyles.title} numberOfLines={1}>
          {maintenance.title}
        </Text>
        <Text style={itemStyles.subtitle} numberOfLines={1}>
          {maintenance.description || maintenance.workshop_name || ""}
        </Text>
      </View>

      <View style={itemStyles.right}>
        <Text style={itemStyles.cost}>
          {maintenance.cost ? `-${formatCurrency(maintenance.cost)}` : ""}
        </Text>
        <Text style={itemStyles.date}>
          {formatRelativeDate(maintenance.date)}
        </Text>
      </View>
    </View>
  );
}

export function RecentActivityList({
  maintenances,
  onViewAll,
}: RecentActivityListProps) {
  const recentItems = maintenances.slice(0, 5);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Atividade Recente</Text>
        {maintenances.length > 5 && onViewAll && (
          <Pressable
            onPress={onViewAll}
            style={({ pressed }) => pressed && styles.linkPressed}
          >
            <Text style={styles.viewAll}>VER TUDO</Text>
          </Pressable>
        )}
      </View>

      {/* List */}
      {recentItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Nenhuma atividade registrada ainda.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {recentItems.map((maintenance) => (
            <ActivityItem key={maintenance.id} maintenance={maintenance} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing["3xl"],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
  },
  viewAll: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.sm,
    color: Colors.dark.primary,
    letterSpacing: 0.3,
  },
  linkPressed: {
    opacity: 0.7,
  },
  list: {
    gap: Spacing.sm,
  },
  emptyContainer: {
    paddingVertical: Spacing["2xl"],
    alignItems: "center",
  },
  emptyText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
});

const itemStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.dark.borderStrong,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
  subtitle: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
  right: {
    alignItems: "flex-end",
    gap: 2,
  },
  cost: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
  date: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.xs,
    color: Colors.dark.textSecondary,
  },
});
