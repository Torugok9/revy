import { ActionMenu } from "@/components/vehicles/ActionMenu";
import { ConfirmModal } from "@/components/vehicles/ConfirmModal";
import { FinancialSummary } from "@/components/vehicles/FinancialSummary";
import { MaintenanceItem } from "@/components/vehicles/MaintenanceItem";
import { VehicleInfoCard } from "@/components/vehicles/VehicleInfoCard";
import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { useMaintenances } from "@/hooks/useMaintenances";
import { useVehicle } from "@/hooks/useVehicle";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function VehicleDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const vehicleId = params.id as string;

  const {
    vehicle,
    loading: vehicleLoading,
    error: vehicleError,
    refetch: refetchVehicle,
  } = useVehicle(vehicleId);
  const {
    maintenances,
    loading: maintenancesLoading,
    refetch: refetchMaintenances,
    totalCost,
    count,
    deleteMaintenance,
  } = useMaintenances(vehicleId);

  const [refreshing, setRefreshing] = useState(false);
  const [deleteVehicleModalVisible, setDeleteVehicleModalVisible] =
    useState(false);
  const [deleteMaintenanceModalVisible, setDeleteMaintenanceModalVisible] =
    useState(false);
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState<
    string | null
  >(null);
  const [selectedMaintenanceTitle, setSelectedMaintenanceTitle] =
    useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchVehicle(), refetchMaintenances()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchVehicle, refetchMaintenances]);

  const handleDeleteVehicle = async () => {
    if (!vehicle) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("vehicles")
        .delete()
        .eq("id", vehicleId);

      if (error) {
        throw new Error(error.message || "Erro ao excluir veículo");
      }

      setDeleteVehicleModalVisible(false);
      router.replace("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao excluir veículo";
      console.error("handleDeleteVehicle error:", err);
      alert(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteMaintenance = async () => {
    if (!selectedMaintenanceId) return;

    setIsDeleting(true);
    try {
      await deleteMaintenance(selectedMaintenanceId);
      setDeleteMaintenanceModalVisible(false);
      setSelectedMaintenanceId(null);
      setSelectedMaintenanceTitle("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao excluir manutenção";
      console.error("handleDeleteMaintenance error:", err);
      alert(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMaintenancePress = (maintenanceId: string) => {
    // Preparado para navegação futura
    console.log("Navigate to maintenance detail:", maintenanceId);
    // router.push(`/maintenance/${maintenanceId}`);
  };

  const handleMaintenanceLongPress = (maintenanceId: string, title: string) => {
    setSelectedMaintenanceId(maintenanceId);
    setSelectedMaintenanceTitle(title);
    setDeleteMaintenanceModalVisible(true);
  };

  // Loading estado
  if (vehicleLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  // Erro ao carregar
  if (vehicleError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{vehicleError}</Text>
        <Pressable
          onPress={refetchVehicle}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  // Veículo não encontrado
  if (!vehicle) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Veículo não encontrado</Text>
        <Pressable
          onPress={() => router.replace("/")}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.headerButtonPressed,
          ]}
        >
          <Ionicons name="chevron-back" size={28} color={Colors.dark.text} />
        </Pressable>

        <View style={styles.headerTitle}>
          <Text style={styles.title}>
            {vehicle.brand} {vehicle.model}
          </Text>
          <Text style={styles.subtitle}>{vehicle.year}</Text>
        </View>

        <ActionMenu
          onEdit={() => router.push(`/vehicle/${vehicleId}/edit`)}
          onDelete={() => setDeleteVehicleModalVisible(true)}
        />
      </View>

      {/* Conteúdo */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.dark.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Card de Informações */}
        <VehicleInfoCard vehicle={vehicle} />

        {/* Resumo Financeiro */}
        <FinancialSummary totalCost={totalCost} count={count} />

        {/* Histórico de Manutenções */}
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Histórico</Text>
            <Pressable
              onPress={() =>
                router.push(`/maintenance/new?vehicleId=${vehicleId}`)
              }
              style={({ pressed }) => pressed && styles.addButtonPressed}
            >
              <Text style={styles.addButton}>Adicionar</Text>
            </Pressable>
          </View>

          {maintenancesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.dark.primary} />
            </View>
          ) : maintenances.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Nenhuma manutenção registrada
              </Text>
              <Text style={styles.emptySubtext}>
                Registre a primeira manutenção deste veículo.
              </Text>
              <Pressable
                onPress={() =>
                  router.push(`/maintenance/new?vehicleId=${vehicleId}`)
                }
                style={({ pressed }) => [
                  styles.emptyButton,
                  pressed && styles.emptyButtonPressed,
                ]}
              >
                <Text style={styles.emptyButtonText}>Registrar manutenção</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.maintenanceList}>
              {maintenances.map((maintenance) => (
                <MaintenanceItem
                  key={maintenance.id}
                  maintenance={maintenance}
                  onPress={() => handleMaintenancePress(maintenance.id)}
                  onLongPress={() =>
                    handleMaintenanceLongPress(
                      maintenance.id,
                      maintenance.title,
                    )
                  }
                />
              ))}
            </View>
          )}
        </View>

        {/* Bottom padding para não ficar embaixo do FAB */}
        {maintenances.length > 0 && <View style={{ height: Spacing["3xl"] }} />}
      </ScrollView>

      {/* FAB - Só aparece se houver manutenções */}
      {maintenances.length > 0 && (
        <Pressable
          onPress={() => router.push(`/maintenance/new?vehicleId=${vehicleId}`)}
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        >
          <Ionicons name="add" size={28} color={Colors.dark.text} />
        </Pressable>
      )}

      {/* Modal de Exclusão de Veículo */}
      <ConfirmModal
        visible={deleteVehicleModalVisible}
        title="Excluir veículo?"
        message={`Tem certeza que deseja excluir o ${vehicle.brand} ${vehicle.model}? Todas as manutenções registradas também serão excluídas. Essa ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isDangerous
        isLoading={isDeleting}
        onConfirm={handleDeleteVehicle}
        onCancel={() => setDeleteVehicleModalVisible(false)}
      />

      {/* Modal de Exclusão de Manutenção */}
      <ConfirmModal
        visible={deleteMaintenanceModalVisible}
        title="Excluir manutenção?"
        message={`Tem certeza que deseja excluir "${selectedMaintenanceTitle}"? Essa ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isDangerous
        isLoading={isDeleting}
        onConfirm={handleDeleteMaintenance}
        onCancel={() => setDeleteMaintenanceModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    padding: Spacing.lg,
    paddingTop: Spacing["4xl"],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  headerButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  headerButtonPressed: {
    backgroundColor: Colors.dark.border,
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  title: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
  },
  subtitle: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
  content: {
    flex: 1,
  },
  historyContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  historyTitle: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
  },
  addButton: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.base,
    color: Colors.dark.primary,
  },
  addButtonPressed: {
    opacity: 0.7,
  },
  loadingContainer: {
    padding: Spacing.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textMuted,
    marginBottom: Spacing.lg,
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
  maintenanceList: {
    marginBottom: Spacing.lg,
  },
  fab: {
    position: "absolute",
    bottom: Spacing.xl,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: BorderRadius["2xl"],
    backgroundColor: Colors.dark.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabPressed: {
    opacity: 0.8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.dark.background,
  },
  errorText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.lg,
  },
  button: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
});
