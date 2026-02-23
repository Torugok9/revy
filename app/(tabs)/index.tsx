import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { FuelStatsSection } from "@/components/dashboard/FuelStatsSection";
import { HealthCard } from "@/components/dashboard/HealthCard";
import { KmStatsSection } from "@/components/dashboard/KmStatsSection";
import { MaintenanceStatsCards } from "@/components/dashboard/MaintenanceStatsCards";
import { RecentActivityList } from "@/components/dashboard/RecentActivityList";
import { VehiclePickerModal } from "@/components/dashboard/VehiclePickerModal";
import { VehicleSelector } from "@/components/dashboard/VehicleSelector";
import { UpgradeBanner } from "@/components/UpgradeBanner";
import { Colors, Fonts, Spacing } from "@/constants/theme";
import { useFeaturesContext } from "@/contexts/FeaturesContext";
import { useMaintenances } from "@/hooks/useMaintenances";
import { useOdometer } from "@/hooks/useOdometer";
import { useVehicleHealth } from "@/hooks/useVehicleHealth";
import { useVehicles } from "@/hooks/useVehicles";
import { Vehicle } from "@/types/vehicle";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardScreen() {
  const router = useRouter();
  const { planId } = useFeaturesContext();
  const {
    vehicles,
    loading: vehiclesLoading,
    refetch: refetchVehicles,
  } = useVehicles();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null,
  );
  const [pickerVisible, setPickerVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Derivar o veículo selecionado da lista (evita referências novas a cada render)
  const selectedVehicle =
    vehicles.find((v) => v.id === selectedVehicleId) ?? null;

  const {
    health,
    loading: healthLoading,
    refetch: refetchHealth,
  } = useVehicleHealth(selectedVehicleId);

  const {
    maintenances,
    loading: maintenancesLoading,
    refetch: refetchMaintenances,
  } = useMaintenances(selectedVehicleId ?? "");

  const { refetch: refetchOdometer } = useOdometer(selectedVehicleId ?? undefined);

  // Selecionar primeiro veículo automaticamente ou corrigir se o selecionado foi removido
  useEffect(() => {
    if (vehicles.length === 0) return;

    if (
      !selectedVehicleId ||
      !vehicles.some((v) => v.id === selectedVehicleId)
    ) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [vehicles, selectedVehicleId]);

  // Refs para poder chamar refetch sem dependências instáveis
  const refetchHealthRef = useRef(refetchHealth);
  const refetchMaintenancesRef = useRef(refetchMaintenances);
  const refetchOdometerRef = useRef(refetchOdometer);
  refetchHealthRef.current = refetchHealth;
  refetchMaintenancesRef.current = refetchMaintenances;
  refetchOdometerRef.current = refetchOdometer;

  // Refetch quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      refetchVehicles();
      refetchHealthRef.current();
      refetchMaintenancesRef.current();
      refetchOdometerRef.current();
    }, [refetchVehicles]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchVehicles(),
      refetchHealthRef.current(),
      refetchMaintenancesRef.current(),
      refetchOdometerRef.current(),
    ]);
    setRefreshing(false);
  }, [refetchVehicles]);

  const handleSelectVehicle = useCallback((vehicle: Vehicle) => {
    setSelectedVehicleId(vehicle.id);
    setPickerVisible(false);
  }, []);

  const handleViewAllActivity = useCallback(() => {
    if (selectedVehicleId) {
      router.push(`/vehicle/${selectedVehicleId}`);
    }
  }, [selectedVehicleId, router]);

  const handleRegisterKm = useCallback(() => {
    if (selectedVehicleId) {
      router.push(`/odometer/new?vehicleId=${selectedVehicleId}`);
    }
  }, [selectedVehicleId, router]);

  const handleRegisterFuel = useCallback(() => {
    if (selectedVehicleId) {
      router.push(`/fuel/new?vehicleId=${selectedVehicleId}`);
    }
  }, [selectedVehicleId, router]);

  const isLoading = vehiclesLoading || healthLoading;

  // Sem veículos
  if (!vehiclesLoading && vehicles.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors.dark.background}
        />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Dashboard</Text>
          <Text style={styles.emptyText}>
            Adicione um veículo na aba Garagem para visualizar o dashboard.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.dark.background}
      />

      {isLoading && !refreshing ? (
        <DashboardSkeleton />
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.dark.primary}
            />
          }
        >
          {/* Upgrade Banner (Free users only) */}
          {planId === "free" && (
            <UpgradeBanner
              hasOverdueMaintenance={health?.overdue_count ? health.overdue_count > 0 : false}
              hasFuelLogs={false}
              vehicleCount={vehicles.length}
              maxVehicles={1}
            />
          )}

          {/* Vehicle Selector */}
          <VehicleSelector
            vehicle={selectedVehicle}
            onPress={() => setPickerVisible(true)}
          />

          {/* Health Card */}
          {health && <HealthCard health={health} />}

          {/* Stats Cards */}
          {health && <MaintenanceStatsCards health={health} />}

          {/* KM Stats */}
          {selectedVehicleId && (
            <KmStatsSection
              vehicleId={selectedVehicleId}
              onRegisterKm={handleRegisterKm}
            />
          )}

          {/* Fuel Stats */}
          {selectedVehicleId && (
            <FuelStatsSection
              vehicleId={selectedVehicleId}
              onRegisterFuel={handleRegisterFuel}
            />
          )}

          {/* Recent Activity */}
          <RecentActivityList
            maintenances={maintenances}
            onViewAll={handleViewAllActivity}
          />

          <View style={{ height: Spacing["4xl"] }} />
        </ScrollView>
      )}

      {/* Vehicle Picker Modal */}
      <VehiclePickerModal
        visible={pickerVisible}
        vehicles={vehicles}
        selectedVehicleId={selectedVehicleId}
        onSelect={handleSelectVehicle}
        onClose={() => setPickerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  emptyTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size["2xl"],
    color: Colors.dark.text,
    marginBottom: Spacing.lg,
  },
  emptyText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: Fonts.lineHeight.relaxed * Fonts.size.base,
  },
});
