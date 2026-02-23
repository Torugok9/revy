import { CostPerKmSection } from "@/components/analytics/CostPerKmSection";
import { ExpenseBreakdownSection } from "@/components/analytics/ExpenseBreakdownSection";
import { FuelAnalyticsSection } from "@/components/analytics/FuelAnalyticsSection";
import { KmChartSection } from "@/components/analytics/KmChartSection";
import { VehiclePickerModal } from "@/components/dashboard/VehiclePickerModal";
import { VehicleSelector } from "@/components/dashboard/VehicleSelector";
import { Colors, Fonts, Spacing } from "@/constants/theme";
import { useVehicles } from "@/hooks/useVehicles";
import { Vehicle } from "@/types/vehicle";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AnalyticsScreen() {
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

  const selectedVehicle =
    vehicles.find((v) => v.id === selectedVehicleId) ?? null;

  // Auto-select first vehicle
  useEffect(() => {
    if (vehicles.length === 0) return;

    if (
      !selectedVehicleId ||
      !vehicles.some((v) => v.id === selectedVehicleId)
    ) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [vehicles, selectedVehicleId]);

  // Refetch on focus
  useFocusEffect(
    useCallback(() => {
      refetchVehicles();
    }, [refetchVehicles]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchVehicles();
    setRefreshing(false);
  }, [refetchVehicles]);

  const handleSelectVehicle = useCallback((vehicle: Vehicle) => {
    setSelectedVehicleId(vehicle.id);
    setPickerVisible(false);
  }, []);

  // No vehicles
  if (!vehiclesLoading && vehicles.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors.dark.background}
        />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Análises</Text>
          <Text style={styles.emptyText}>
            Cadastre um veículo para ver análises
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Loading
  if (vehiclesLoading && !selectedVehicleId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors.dark.background}
        />
        <View style={styles.emptyContainer}>
          <ActivityIndicator color={Colors.dark.primary} size="large" />
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
        {/* Vehicle Selector */}
        <VehicleSelector
          vehicle={selectedVehicle}
          onPress={() => setPickerVisible(true)}
        />

        {selectedVehicleId && (
          <>
            {/* Section 1: Custo Operacional */}
            <CostPerKmSection vehicleId={selectedVehicleId} />

            {/* Section 2: Quilometragem */}
            <KmChartSection vehicleId={selectedVehicleId} />

            {/* Section 3: Combustível */}
            <FuelAnalyticsSection vehicleId={selectedVehicleId} />

            {/* Section 4: Gastos por Categoria */}
            <ExpenseBreakdownSection vehicleId={selectedVehicleId} />
          </>
        )}

        <View style={{ height: Spacing["4xl"] }} />
      </ScrollView>

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
