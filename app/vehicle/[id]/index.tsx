import { FeatureGate } from "@/components/FeatureGate";
import { FuelComparison } from "@/components/FuelComparison";
import { ActionMenu } from "@/components/vehicles/ActionMenu";
import { ConfirmModal } from "@/components/vehicles/ConfirmModal";
import { QuickActionButton } from "@/components/vehicles/QuickActionButton";
import { RecentMaintenanceItem } from "@/components/vehicles/RecentMaintenanceItem";
import { UpcomingServiceCard } from "@/components/vehicles/UpcomingServiceCard";
import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { useFuel } from "@/hooks/useFuel";
import { useMaintenances } from "@/hooks/useMaintenances";
import { useOdometer } from "@/hooks/useOdometer";
import { useVehicle } from "@/hooks/useVehicle";
import { supabase } from "@/lib/supabase";
import { FUEL_TYPE_COLORS, FUEL_TYPE_LABELS } from "@/types/fuel";
import type { OdometerLog } from "@/types/odometer";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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

  const {
    logs: odometerLogs,
    loading: odometerLoading,
    deleteLog,
    refetch: refetchOdometer,
  } = useOdometer(vehicleId);

  const {
    stats: fuelStats,
    loading: fuelLoading,
    refetch: refetchFuel,
  } = useFuel(vehicleId);

  const [deleteLogModalVisible, setDeleteLogModalVisible] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

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
      await Promise.all([refetchVehicle(), refetchMaintenances(), refetchOdometer(), refetchFuel()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchVehicle, refetchMaintenances, refetchOdometer, refetchFuel]);

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

  const recentOdometerLogs = useMemo(() => {
    return odometerLogs.slice(0, 3);
  }, [odometerLogs]);

  const handleOdometerLogLongPress = (log: OdometerLog) => {
    if (log.source === "maintenance") return;
    setSelectedLogId(log.id);
    setDeleteLogModalVisible(true);
  };

  const handleDeleteOdometerLog = async () => {
    if (!selectedLogId) return;
    setIsDeleting(true);
    try {
      await deleteLog(selectedLogId);
      setDeleteLogModalVisible(false);
      setSelectedLogId(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao excluir registro";
      console.error("handleDeleteOdometerLog error:", err);
      alert(message);
    } finally {
      setIsDeleting(false);
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
            icon="water-outline"
            label="Abastecer"
            onPress={() =>
              router.push(`/fuel/new?vehicleId=${vehicleId}`)
            }
          />
          <QuickActionButton
            icon="speedometer-outline"
            label="Registrar Km"
            onPress={() =>
              router.push(`/odometer/new?vehicleId=${vehicleId}`)
            }
          />
        </View>

        {/* Odometer Logs */}
        <View style={styles.odometerContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quilometragem</Text>
            <Pressable
              onPress={() =>
                router.push(`/odometer/new?vehicleId=${vehicleId}`)
              }
              style={({ pressed }) => pressed && styles.linkPressed}
            >
              <Text style={styles.sectionLink}>Registrar</Text>
            </Pressable>
          </View>

          {odometerLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.dark.primary} />
            </View>
          ) : odometerLogs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Nenhum registro de quilometragem
              </Text>
              <Text style={styles.emptySubtext}>
                Registre a quilometragem para acompanhar km rodados.
              </Text>
              <Pressable
                onPress={() =>
                  router.push(`/odometer/new?vehicleId=${vehicleId}`)
                }
                style={({ pressed }) => [
                  styles.emptyButton,
                  pressed && styles.emptyButtonPressed,
                ]}
              >
                <Text style={styles.emptyButtonText}>Registrar km</Text>
              </Pressable>
            </View>
          ) : (
            <View>
              {recentOdometerLogs.map((log) => (
                <Pressable
                  key={log.id}
                  onLongPress={() => handleOdometerLogLongPress(log)}
                  style={({ pressed }) => [
                    styles.odometerLogItem,
                    pressed && styles.odometerLogItemPressed,
                  ]}
                >
                  <View
                    style={[
                      styles.odometerLogIcon,
                      {
                        backgroundColor:
                          log.source === "manual"
                            ? "rgba(220, 38, 38, 0.15)"
                            : "rgba(59, 130, 246, 0.15)",
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        log.source === "manual"
                          ? "create-outline"
                          : "construct-outline"
                      }
                      size={18}
                      color={
                        log.source === "manual"
                          ? Colors.dark.primary
                          : "#3B82F6"
                      }
                    />
                  </View>
                  <View style={styles.odometerLogInfo}>
                    <Text style={styles.odometerLogKm}>
                      {log.km.toLocaleString("pt-BR")} km
                    </Text>
                    <Text style={styles.odometerLogMeta}>
                      {new Date(log.date + "T00:00:00").toLocaleDateString(
                        "pt-BR",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                      {log.source === "maintenance" && " • via manutenção"}
                    </Text>
                    {log.notes && (
                      <Text
                        style={styles.odometerLogNotes}
                        numberOfLines={1}
                      >
                        {log.notes}
                      </Text>
                    )}
                  </View>
                </Pressable>
              ))}
              {odometerLogs.length > 3 && (
                <Text style={styles.odometerMoreText}>
                  +{odometerLogs.length - 3} registros anteriores
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Combustível */}
        <View style={styles.fuelContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Combustível</Text>
            {fuelStats?.has_data && (
              <Pressable
                onPress={() =>
                  router.push(`/fuel/new?vehicleId=${vehicleId}`)
                }
                style={({ pressed }) => pressed && styles.linkPressed}
              >
                <Text style={styles.sectionLink}>Registrar</Text>
              </Pressable>
            )}
          </View>

          {fuelLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.dark.primary} />
            </View>
          ) : !fuelStats?.has_data ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="water-outline"
                size={32}
                color={Colors.dark.textMuted}
                style={{ marginBottom: Spacing.sm }}
              />
              <Text style={styles.emptyText}>
                Nenhum abastecimento registrado
              </Text>
              <Text style={styles.emptySubtext}>
                Registre abastecimentos para acompanhar consumo e gastos.
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
            <View>
              {/* Stats Grid 2x2 */}
              <View style={styles.fuelStatsGrid}>
                <View style={styles.fuelStatCard}>
                  <Text style={styles.fuelStatLabel}>GASTO ESTE MÊS</Text>
                  <Text style={styles.fuelStatValue}>
                    {fuelStats.cost_this_month.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </Text>
                </View>
                <View style={styles.fuelStatCard}>
                  <Text style={styles.fuelStatLabel}>MÉDIA KM/L</Text>
                  <Text style={styles.fuelStatValue}>
                    {fuelStats.avg_km_per_liter > 0
                      ? `${fuelStats.avg_km_per_liter.toFixed(1)} km/l`
                      : "Sem dados"}
                  </Text>
                </View>
                <View style={styles.fuelStatCard}>
                  <Text style={styles.fuelStatLabel}>LITROS ESTE MÊS</Text>
                  <Text style={styles.fuelStatValue}>
                    {fuelStats.liters_this_month.toFixed(1)} L
                  </Text>
                </View>
                <View style={styles.fuelStatCard}>
                  <Text style={styles.fuelStatLabel}>GASTO ESTE ANO</Text>
                  <Text style={styles.fuelStatValue}>
                    {fuelStats.cost_this_year.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </Text>
                </View>
              </View>

              {/* Último Abastecimento */}
              {fuelStats.last_fillup && (
                <View style={styles.lastFillupCard}>
                  <View style={styles.lastFillupHeader}>
                    <Text style={styles.lastFillupTitle}>
                      Último Abastecimento
                    </Text>
                    <View
                      style={[
                        styles.fuelBadge,
                        {
                          backgroundColor:
                            FUEL_TYPE_COLORS[fuelStats.last_fillup.fuel_type] +
                            "20",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.fuelBadgeText,
                          {
                            color:
                              FUEL_TYPE_COLORS[
                                fuelStats.last_fillup.fuel_type
                              ],
                          },
                        ]}
                      >
                        {FUEL_TYPE_LABELS[fuelStats.last_fillup.fuel_type]}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.lastFillupDetails}>
                    {fuelStats.last_fillup.liters.toFixed(1)}L a R${" "}
                    {fuelStats.last_fillup.price_per_liter.toFixed(2)}/L
                    {fuelStats.last_fillup.station_name &&
                      ` • ${fuelStats.last_fillup.station_name}`}
                  </Text>
                  <Text style={styles.lastFillupTotal}>
                    {fuelStats.last_fillup.total_cost.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </Text>
                </View>
              )}

              {/* Stats Avançados de Combustível (Premium) */}
              <FeatureGate feature="fuel_stats_advanced">
                <View style={styles.advancedStatsPlaceholder}>
                  <Text style={styles.fuelStatLabel}>ANÁLISE AVANÇADA</Text>
                  <Text style={styles.fuelStatValue}>
                    Tendência de consumo e gastos detalhados
                  </Text>
                </View>
              </FeatureGate>

              {/* Comparação de Combustível (Premium) */}
              <FeatureGate feature="fuel_comparison">
                <FuelComparison vehicleId={vehicleId} />
              </FeatureGate>

              {/* Custo por Km (Premium) */}
              <FeatureGate feature="cost_per_km">
                <View style={styles.advancedStatsPlaceholder}>
                  <Text style={styles.fuelStatLabel}>CUSTO POR KM</Text>
                  <Text style={styles.fuelStatValue}>
                    Cálculo integrado de combustível + manutenção
                  </Text>
                </View>
              </FeatureGate>

              {/* Ver Histórico */}
              <Pressable
                onPress={() =>
                  router.push(`/fuel/history?vehicleId=${vehicleId}`)
                }
                style={({ pressed }) => [
                  styles.viewHistoryButton,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.viewHistoryText}>
                  Ver histórico completo
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors.dark.primary}
                />
              </Pressable>
            </View>
          )}
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

        {/* Premium Action Buttons */}
        <View style={styles.premiumActionsContainer}>
          <FeatureGate feature="pdf_export" mode="action">
            <Pressable style={styles.premiumActionButton}>
              <Ionicons name="document-text-outline" size={20} color={Colors.dark.text} />
              <Text style={styles.premiumActionText}>Exportar PDF</Text>
            </Pressable>
          </FeatureGate>

          <FeatureGate feature="sale_report" mode="action">
            <Pressable style={styles.premiumActionButton}>
              <Ionicons name="clipboard-outline" size={20} color={Colors.dark.text} />
              <Text style={styles.premiumActionText}>Relatório de Venda</Text>
            </Pressable>
          </FeatureGate>
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

      {/* Modal de Exclusão de Log de Odômetro */}
      <ConfirmModal
        visible={deleteLogModalVisible}
        title="Excluir registro?"
        message="Tem certeza que deseja excluir este registro de quilometragem? Essa ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        isDangerous
        isLoading={isDeleting}
        onConfirm={handleDeleteOdometerLog}
        onCancel={() => {
          setDeleteLogModalVisible(false);
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
  odometerContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  odometerLogItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.dark.border,
  },
  odometerLogItemPressed: {
    opacity: 0.7,
  },
  odometerLogIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  odometerLogInfo: {
    flex: 1,
  },
  odometerLogKm: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
  odometerLogMeta: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.xs,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  odometerLogNotes: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.xs,
    color: Colors.dark.textMuted,
    marginTop: 2,
    fontStyle: "italic",
  },
  odometerMoreText: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    paddingVertical: Spacing.md,
  },
  fuelContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  fuelStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  fuelStatCard: {
    width: "48.5%",
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.dark.borderStrong,
  },
  fuelStatLabel: {
    fontFamily: Fonts.family.semibold,
    fontSize: 10,
    color: Colors.dark.textSecondary,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  fuelStatValue: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
  lastFillupCard: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.dark.borderStrong,
    marginBottom: Spacing.lg,
  },
  lastFillupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  lastFillupTitle: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.sm,
    color: Colors.dark.text,
  },
  fuelBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  fuelBadgeText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.xs,
  },
  lastFillupDetails: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.xs,
  },
  lastFillupTotal: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.primary,
  },
  viewHistoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  viewHistoryText: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.primary,
  },
  advancedStatsPlaceholder: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.dark.borderStrong,
    marginBottom: Spacing.lg,
  },
  premiumActionsContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  premiumActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  premiumActionText: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
});
