import { EmptyState } from "@/components/vehicles/EmptyState";
import { FloatingActionButton } from "@/components/vehicles/FloatingActionButton";
import { LimitReachedModal } from "@/components/vehicles/LimitReachedModal";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { VehicleListSkeleton } from "@/components/vehicles/VehicleListSkeleton";
import { Colors, Fonts, Spacing } from "@/constants/theme";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useVehicles } from "@/hooks/useVehicles";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function VehiclesScreen() {
  const router = useRouter();
  const { vehicles, loading, error, refetch } = useVehicles();
  const { plan, loading: planLoading } = useUserPlan();
  const [limitModalVisible, setLimitModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Refetch veículos quando a tela ganha foco (após criar novo veículo, por exemplo)
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
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

  const isAtLimit = plan && vehicles.length >= plan.max_vehicles;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Veículos</Text>
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>
            {vehicles.length}{" "}
            {vehicles.length === 1
              ? "veículo cadastrado"
              : "veículos cadastrados"}
          </Text>
          {plan && (
            <Text style={[styles.badge, isAtLimit && styles.badgeFull]}>
              {plan.name} · {vehicles.length}/{plan.max_vehicles}{" "}
              {plan.max_vehicles === 1 ? "veículo" : "veículos"}
            </Text>
          )}
        </View>
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
        <FlatList
          data={vehicles}
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
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* FAB */}
      <FloatingActionButton onPress={handleAddVehicle} />

      {/* Modal - Limite Atingido */}
      <LimitReachedModal
        visible={limitModalVisible}
        onClose={() => setLimitModalVisible(false)}
        planName={plan?.name || "seu plano"}
        maxVehicles={plan?.max_vehicles || 1}
        onUpgrade={handleUpgradePlan}
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    paddingTop: Spacing["3xl"],
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  title: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size["2xl"],
    color: Colors.dark.text,
    marginBottom: Spacing.md,
    lineHeight: Fonts.lineHeight.tight * Fonts.size["2xl"],
  },
  subtitleContainer: {
    gap: Spacing.sm,
  },
  subtitle: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
  badge: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.xs,
    color: Colors.dark.textSecondary,
  },
  badgeFull: {
    color: Colors.dark.primary,
  },
  listContent: {
    paddingVertical: Spacing.lg,
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
