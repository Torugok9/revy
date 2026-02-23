import { ConfirmModal } from "@/components/vehicles/ConfirmModal";
import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { useFuel } from "@/hooks/useFuel";
import type { FuelLog } from "@/types/fuel";
import { FUEL_TYPE_COLORS, FUEL_TYPE_LABELS } from "@/types/fuel";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function FuelLogItem({
  log,
  onLongPress,
}: {
  log: FuelLog;
  onLongPress: () => void;
}) {
  const color = FUEL_TYPE_COLORS[log.fuel_type];

  return (
    <Pressable
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.logItem,
        pressed && styles.logItemPressed,
      ]}
    >
      <View style={styles.logItemLeft}>
        <View style={[styles.fuelTypeDot, { backgroundColor: color }]} />
        <View style={styles.logItemContent}>
          <View style={styles.logItemTopRow}>
            <View
              style={[
                styles.logFuelBadge,
                { backgroundColor: color + "20" },
              ]}
            >
              <Text style={[styles.logFuelBadgeText, { color }]}>
                {FUEL_TYPE_LABELS[log.fuel_type]}
              </Text>
            </View>
            {log.full_tank && (
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={Colors.dark.success}
              />
            )}
          </View>
          <Text style={styles.logItemDetails}>
            {log.liters.toFixed(1)}L × R$ {log.price_per_liter.toFixed(2)}
          </Text>
          {log.station_name && (
            <Text style={styles.logItemStation} numberOfLines={1}>
              {log.station_name}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.logItemRight}>
        <Text style={styles.logItemTotal}>
          {log.total_cost.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </Text>
        <Text style={styles.logItemDate}>
          {new Date(log.date + "T00:00:00").toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
          })}
        </Text>
      </View>
    </Pressable>
  );
}

export default function FuelHistoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const vehicleId = params.vehicleId as string;
  const insets = useSafeAreaInsets();

  const { logs, loading, deleteFuelLog, refetch } = useFuel(vehicleId);

  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleLongPress = (logId: string) => {
    setSelectedLogId(logId);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!selectedLogId) return;
    setIsDeleting(true);
    try {
      await deleteFuelLog(selectedLogId);
      setDeleteModalVisible(false);
      setSelectedLogId(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao excluir registro";
      console.error("handleDeleteFuelLog error:", err);
      alert(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: FuelLog }) => (
      <FuelLogItem log={item} onLongPress={() => handleLongPress(item.id)} />
    ),
    [],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.dark.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Histórico de Abastecimentos</Text>
        <Pressable
          onPress={() =>
            router.push(`/fuel/new?vehicleId=${vehicleId}`)
          }
          style={({ pressed }) => [
            styles.addButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons name="add" size={24} color={Colors.dark.primary} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
        </View>
      ) : logs.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons
            name="water-outline"
            size={48}
            color={Colors.dark.textMuted}
          />
          <Text style={styles.emptyText}>Nenhum abastecimento registrado</Text>
          <Text style={styles.emptySubtext}>
            Registre seu primeiro abastecimento para começar a acompanhar.
          </Text>
          <Pressable
            onPress={() =>
              router.push(`/fuel/new?vehicleId=${vehicleId}`)
            }
            style={({ pressed }) => [
              styles.emptyButton,
              pressed && styles.emptyButtonPressed,
            ]}
          >
            <Text style={styles.emptyButtonText}>
              Registrar abastecimento
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.dark.primary}
            />
          }
        />
      )}

      <ConfirmModal
        visible={deleteModalVisible}
        title="Excluir abastecimento?"
        message="Tem certeza que deseja excluir este registro de abastecimento? Essa ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        isDangerous
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedLogId(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
  },
  addButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing["3xl"],
  },
  logItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.dark.border,
  },
  logItemPressed: {
    opacity: 0.7,
  },
  logItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  fuelTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.md,
  },
  logItemContent: {
    flex: 1,
  },
  logItemTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  logFuelBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  logFuelBadgeText: {
    fontFamily: Fonts.family.semibold,
    fontSize: 10,
  },
  logItemDetails: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
  logItemStation: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.xs,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  logItemRight: {
    alignItems: "flex-end",
    marginLeft: Spacing.md,
  },
  logItemTotal: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
  logItemDate: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.xs,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  emptyText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.textSecondary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textMuted,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  emptyButton: {
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
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
});
