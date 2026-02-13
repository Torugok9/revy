import { EmptyState } from "@/components/vehicles/EmptyState";
import { FloatingActionButton } from "@/components/vehicles/FloatingActionButton";
import { LimitReachedModal } from "@/components/vehicles/LimitReachedModal";
import { RegisterNewVehicleCard } from "@/components/vehicles/RegisterNewVehicleCard";
import { SearchBar } from "@/components/vehicles/SearchBar";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { VehicleListSkeleton } from "@/components/vehicles/VehicleListSkeleton";
import { Colors, Fonts, Spacing } from "@/constants/theme";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useVehicles } from "@/hooks/useVehicles";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GarageScreen() {
  const router = useRouter();
  const { vehicles, loading, error, refetch } = useVehicles();
  const { plan, loading: planLoading } = useUserPlan();
  const [limitModalVisible, setLimitModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Refetch veículos quando a tela ganha foco (após criar novo veículo, por exemplo)
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const handleAddVehicle = useCallback(() => {
    if (!plan) {
      Alert.alert("Erro", "Não foi possível carregar seu plano");
      return;
    }

    const isAtLimit = vehicles.length >= plan.max_vehicles;

    if (isAtLimit) {
      setLimitModalVisible(true);
      return;
    }

    router.push("/vehicle/new");
  }, [vehicles.length, plan, router]);

  const handleVehiclePress = useCallback(
    (vehicleId: string) => {
      router.push(`/vehicle/${vehicleId}`);
    },
    [router],
  );

  const handleUpgradePlan = useCallback(() => {
    // TODO: Navegar para tela de upgrade de planos
    router.push("/(tabs)/explore");
  }, [router]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Filtrar veículos por busca
  const filteredVehicles = useMemo(() => {
    if (!searchQuery.trim()) return vehicles;

    const query = searchQuery.toLowerCase();
    return vehicles.filter(
      (vehicle) =>
        vehicle.brand.toLowerCase().includes(query) ||
        vehicle.model.toLowerCase().includes(query) ||
        vehicle.plate.toLowerCase().includes(query),
    );
  }, [vehicles, searchQuery]);

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.dark.background}
      />
      <View style={styles.container}>
        {/* Header with FAB inline */}
        <View style={styles.header}>
          <Text style={styles.title}>Garagem</Text>
        </View>

        {/* Content */}
        {loading || planLoading ? (
          <VehicleListSkeleton itemCount={3} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Não foi possível carregar seus veículos.
            </Text>
            <View
              style={{
                backgroundColor: Colors.dark.primary,
                borderRadius: 10,
                overflow: "hidden",
                marginTop: Spacing.lg,
              }}
            >
              <Text
                style={{
                  paddingVertical: Spacing.lg,
                  paddingHorizontal: Spacing.lg,
                  color: "#FFFFFF",
                  fontFamily: Fonts.family.semibold,
                  fontSize: Fonts.size.sm,
                  textAlign: "center",
                }}
                onPress={handleRetry}
              >
                Tentar novamente
              </Text>
            </View>
          </View>
        ) : vehicles.length === 0 ? (
          <EmptyState onAddVehicle={handleAddVehicle} />
        ) : (
          <>
            {/* Search Bar */}
            <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

            {/* Vehicle List */}
            <FlatList
              data={filteredVehicles}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <VehicleCard vehicle={item} onPress={handleVehiclePress} />
              )}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={Colors.dark.primary}
                />
              }
              ListFooterComponent={() => (
                <RegisterNewVehicleCard onPress={handleAddVehicle} />
              )}
              contentContainerStyle={styles.listContent}
            />
          </>
        )}

        {/* FAB */}
        {vehicles.length > 0 && (
          <FloatingActionButton onPress={handleAddVehicle} />
        )}

        {/* Modal - Limite Atingido */}
        <LimitReachedModal
          visible={limitModalVisible}
          onClose={() => setLimitModalVisible(false)}
          planName={plan?.name || "seu plano"}
          maxVehicles={plan?.max_vehicles || 1}
          onUpgrade={handleUpgradePlan}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  title: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size["3xl"],
    color: Colors.dark.text,
    lineHeight: Fonts.lineHeight.tight * Fonts.size["3xl"],
  },
  listContent: {
    paddingBottom: Spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  errorText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.textSecondary,
    textAlign: "center",
  },
});
