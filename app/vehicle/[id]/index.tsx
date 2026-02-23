import { ActionMenu } from "@/components/vehicles/ActionMenu";
import { ConfirmModal } from "@/components/vehicles/ConfirmModal";
import { MaskedVehicleInput } from "@/components/vehicles/MaskedVehicleInput";
import { QuickActionButton } from "@/components/vehicles/QuickActionButton";
import { RecentMaintenanceItem } from "@/components/vehicles/RecentMaintenanceItem";
import { UpcomingServiceCard } from "@/components/vehicles/UpcomingServiceCard";
import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { useMaintenances } from "@/hooks/useMaintenances";
import { useVehicle } from "@/hooks/useVehicle";
import { supabase } from "@/lib/supabase";
import { cleanKilometers } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
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
  const [updateKmModalVisible, setUpdateKmModalVisible] = useState(false);
  const [newKm, setNewKm] = useState("");
  const [isUpdatingKm, setIsUpdatingKm] = useState(false);
  const [updateKmError, setUpdateKmError] = useState("");

  const upcomingServices = useMemo(() => {
    if (!vehicle?.current_km) return [];
    const currentKm = vehicle.current_km;
    return maintenances
      .filter(
        (m) =>
          m.next_maintenance_km != null && m.next_maintenance_km > currentKm,
      )
      .map((m) => ({
        id: m.id,
        title: m.title,
        kmLeft: m.next_maintenance_km! - currentKm,
        progress: currentKm / m.next_maintenance_km!,
      }))
      .sort((a, b) => a.kmLeft - b.kmLeft);
  }, [maintenances, vehicle?.current_km]);

  const recentMaintenances = useMemo(() => {
    return maintenances.slice(0, 5);
  }, [maintenances]);

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

  const openUpdateKmModal = () => {
    setNewKm(vehicle?.current_km ? String(vehicle.current_km) : "");
    setUpdateKmError("");
    setUpdateKmModalVisible(true);
  };

  const handleUpdateKm = async () => {
    const cleanedKm = cleanKilometers(newKm);
    const kmValue = Number(cleanedKm);

    if (!cleanedKm || isNaN(kmValue) || kmValue <= 0) {
      setUpdateKmError("Informe uma quilometragem válida.");
      return;
    }

    if (vehicle?.current_km && kmValue < vehicle.current_km) {
      setUpdateKmError(
        `A km não pode ser menor que a atual (${formatKm(vehicle.current_km)}).`,
      );
      return;
    }

    setIsUpdatingKm(true);
    setUpdateKmError("");
    try {
      const { error } = await supabase
        .from("vehicles")
        .update({ current_km: kmValue })
        .eq("id", vehicleId);

      if (error) throw new Error(error.message);

      setUpdateKmModalVisible(false);
      await refetchVehicle();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao atualizar quilometragem";
      setUpdateKmError(message);
    } finally {
      setIsUpdatingKm(false);
    }
  };

  const handleMaintenanceLongPress = (maintenanceId: string, title: string) => {
    setSelectedMaintenanceId(maintenanceId);
    setSelectedMaintenanceTitle(title);
    setDeleteMaintenanceModalVisible(true);
  };

  const formatKm = (km: number | null | undefined): string => {
    if (km === null || km === undefined) return "N/A";
    return km.toLocaleString("pt-BR") + " km";
  };

  // Loading
  if (vehicleLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  // Erro
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

        <Text style={styles.headerBrand}>{vehicle.model}</Text>

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
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {vehicle.photo_url ? (
            <Image
              source={{ uri: vehicle.photo_url }}
              style={styles.heroImage}
              contentFit="contain"
            />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Ionicons
                name="car-sport-outline"
                size={80}
                color={Colors.dark.textMuted}
              />
            </View>
          )}
        </View>

        {/* Vehicle Info Bar */}
        <View style={styles.infoBar}>
          <View style={styles.infoBarColumn}>
            <Text style={styles.infoBarTitle} numberOfLines={1}>
              {vehicle.brand} {vehicle.model}
            </Text>
            <Text style={styles.infoBarSubtitle}>{vehicle.color || "—"}</Text>
          </View>

          <View style={styles.infoBarColumnCenter}>
            <Text style={styles.infoBarTitle} numberOfLines={1}>
              {vehicle.year} • {vehicle.plate.toUpperCase()}
            </Text>
            <Text style={styles.infoBarSubtitle}>Ano • Placa</Text>
          </View>

          <View style={styles.infoBarColumnRight}>
            <Text style={styles.infoBarKm}>{formatKm(vehicle.current_km)}</Text>
            <Text style={styles.infoBarSubtitle}>Odômetro</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          <QuickActionButton
            icon="construct-outline"
            label="Registrar Manutenção"
            onPress={() =>
              router.push(`/maintenance/new?vehicleId=${vehicleId}`)
            }
          />
          <QuickActionButton
            icon="receipt-outline"
            label="Adicionar Despesa"
            onPress={() => {}}
            disabled
          />
          <QuickActionButton
            icon="speedometer-outline"
            label="Atualizar Km"
            onPress={openUpdateKmModal}
          />
        </View>

        {/* Upcoming Services */}
        {upcomingServices.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Próximos Serviços</Text>
            </View>
            <FlatList
              data={upcomingServices}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.upcomingServicesList}
              renderItem={({ item }) => (
                <UpcomingServiceCard
                  title={item.title}
                  kmLeft={item.kmLeft}
                  progress={item.progress}
                />
              )}
            />
          </View>
        )}

        {/* Recent Maintenance */}
        <View style={styles.recentMaintenanceContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Manutenções Recentes</Text>
            {maintenances.length > 0 && (
              <Pressable
                onPress={() =>
                  router.push(`/maintenance/new?vehicleId=${vehicleId}`)
                }
                style={({ pressed }) => pressed && styles.linkPressed}
              >
                <Text style={styles.sectionLink}>Adicionar</Text>
              </Pressable>
            )}
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
            <View>
              {recentMaintenances.map((maintenance) => (
                <RecentMaintenanceItem
                  key={maintenance.id}
                  maintenance={maintenance}
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

        <View style={{ height: Spacing["3xl"] }} />
      </ScrollView>

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

      {/* Modal de Atualizar KM */}
      <Modal
        visible={updateKmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUpdateKmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Atualizar Quilometragem</Text>
            <Text style={styles.modalMessage}>
              {vehicle.current_km
                ? `Km atual: ${formatKm(vehicle.current_km)}`
                : "Nenhuma quilometragem registrada"}
            </Text>

            <MaskedVehicleInput
              label="Nova quilometragem"
              placeholder="Ex: 45.000"
              value={newKm}
              onChangeText={(val) => {
                setNewKm(val);
                setUpdateKmError("");
              }}
              maskType="kilometers"
              error={updateKmError}
              showValidation={false}
            />

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setUpdateKmModalVisible(false)}
                disabled={isUpdatingKm}
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.modalButtonCancel,
                  pressed && !isUpdatingKm && styles.modalButtonCancelPressed,
                ]}
              >
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={handleUpdateKm}
                disabled={isUpdatingKm}
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.modalButtonConfirm,
                  pressed && !isUpdatingKm && styles.modalButtonConfirmPressed,
                ]}
              >
                {isUpdatingKm ? (
                  <ActivityIndicator color={Colors.dark.text} size="small" />
                ) : (
                  <Text style={styles.modalButtonConfirmText}>Salvar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    paddingTop: Spacing["4xl"],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  headerButtonPressed: {
    backgroundColor: Colors.dark.border,
  },
  headerBrand: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size.xl,
    color: Colors.dark.text,
  },
  content: {
    flex: 1,
  },
  heroContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    height: 220,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius["2xl"],
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  infoBar: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoBarColumn: {
    flex: 1,
  },
  infoBarColumnCenter: {
    flex: 1,
    alignItems: "center",
  },
  infoBarColumnRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  infoBarTitle: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.sm,
    color: Colors.dark.text,
  },
  infoBarSubtitle: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.xs,
    color: Colors.dark.textSecondary,
    marginTop: Spacing.xs,
  },
  infoBarKm: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size.base,
    color: Colors.dark.primary,
  },
  quickActionsRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing["2xl"],
  },
  sectionContainer: {
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
  upcomingServicesList: {
    paddingHorizontal: Spacing.lg,
  },
  recentMaintenanceContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    padding: Spacing.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing["2xl"],
    maxWidth: 340,
    width: "85%",
  },
  modalTitle: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
    marginBottom: Spacing.sm,
  },
  modalMessage: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.xl,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "transparent",
  },
  modalButtonCancelPressed: {
    backgroundColor: Colors.dark.border,
  },
  modalButtonCancelText: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.base,
    color: Colors.dark.textSecondary,
  },
  modalButtonConfirm: {
    backgroundColor: Colors.dark.primary,
  },
  modalButtonConfirmPressed: {
    opacity: 0.8,
  },
  modalButtonConfirmText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
});
