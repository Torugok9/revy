import { FEATURE_DISPLAY } from "@/constants/features";
import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { useFeaturesContext } from "@/contexts/FeaturesContext";
import type { FeatureKey } from "@/types/plans";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Plan data (hardcoded — rarely changes) ──────────────────────────
interface PlanData {
  id: string;
  name: string;
  price: string;
  priceAnnual?: string;
  maxVehicles: string;
  features: FeatureKey[];
  isPopular?: boolean;
}

const PLANS: PlanData[] = [
  {
    id: "free",
    name: "Gratuito",
    price: "Grátis",
    maxVehicles: "1 veículo",
    features: [],
  },
  {
    id: "premium",
    name: "Pro",
    price: "R$ 12,90/mês",
    priceAnnual: "ou R$ 89,90/ano (economize 42%)",
    maxVehicles: "Até 5 veículos",
    features: [
      "km_charts",
      "fuel_comparison",
      "cost_per_km",
      "fuel_stats_advanced",
      "pdf_export",
      "push_reminders",
      "receipt_photo",
      "sale_report",
      "odometer_history",
    ],
    isPopular: true,
  },
  {
    id: "fleet",
    name: "Frota",
    price: "Sob consulta",
    maxVehicles: "Até 15 veículos",
    features: [
      "km_charts",
      "fuel_comparison",
      "cost_per_km",
      "fuel_stats_advanced",
      "pdf_export",
      "push_reminders",
      "receipt_photo",
      "sale_report",
      "odometer_history",
      "multi_user",
      "fleet_dashboard",
    ],
  },
];

// Base features everyone gets
const BASE_FEATURES = [
  "Registro de manutenções",
  "Controle de quilometragem",
  "Registro de abastecimentos",
];

// All premium feature keys in display order
const ALL_PREMIUM_FEATURES: FeatureKey[] = [
  "km_charts",
  "fuel_comparison",
  "cost_per_km",
  "fuel_stats_advanced",
  "pdf_export",
  "push_reminders",
  "receipt_photo",
  "sale_report",
  "odometer_history",
  "multi_user",
  "fleet_dashboard",
];

export default function PlansScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { planId } = useFeaturesContext();
  const params = useLocalSearchParams();
  const highlightFeature = params.highlight as FeatureKey | undefined;

  const handleSubscribe = async (targetPlanId: string) => {
    if (targetPlanId === "fleet") {
      Alert.alert(
        "Plano Frota",
        "Entre em contato conosco para saber mais sobre o plano Frota.",
      );
      return;
    }

    // Save intent for future analytics
    await AsyncStorage.setItem(
      "revy_upgrade_intent",
      JSON.stringify({ plan: targetPlanId, date: new Date().toISOString() }),
    );

    Alert.alert(
      "Em breve!",
      "Estamos finalizando a integração de pagamento. Você será notificado quando estiver disponível.",
    );
  };

  const renderPlanCard = (plan: PlanData) => {
    const isCurrent = plan.id === planId;
    const isPopular = plan.isPopular;
    const planFeatureSet = new Set(plan.features);

    return (
      <View
        key={plan.id}
        style={[
          styles.planCard,
          isPopular && styles.planCardPopular,
        ]}
      >
        {/* Popular badge */}
        {isPopular && (
          <View style={styles.popularBadge}>
            <Ionicons name="star" size={12} color="#FFFFFF" />
            <Text style={styles.popularBadgeText}>RECOMENDADO</Text>
          </View>
        )}

        {/* Plan name & price */}
        <Text style={styles.planName}>{plan.name}</Text>
        <Text style={[styles.planPrice, isPopular && styles.planPricePopular]}>
          {plan.price}
        </Text>
        {plan.priceAnnual && (
          <Text style={styles.planPriceAnnual}>{plan.priceAnnual}</Text>
        )}

        {/* Vehicle limit */}
        <View style={styles.vehicleLimitRow}>
          <Ionicons
            name="car-outline"
            size={16}
            color={Colors.dark.textSecondary}
          />
          <Text style={styles.vehicleLimitText}>{plan.maxVehicles}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Base features (everyone gets) */}
        {BASE_FEATURES.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.dark.success} />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}

        {/* Premium features */}
        {ALL_PREMIUM_FEATURES.map((key) => {
          const has = planFeatureSet.has(key);
          const info = FEATURE_DISPLAY[key];
          const isHighlighted = highlightFeature === key && has;

          return (
            <View
              key={key}
              style={[
                styles.featureRow,
                isHighlighted && styles.featureRowHighlight,
              ]}
            >
              {has ? (
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={Colors.dark.success}
                />
              ) : (
                <Ionicons
                  name="lock-closed"
                  size={16}
                  color={Colors.dark.textMuted}
                />
              )}
              <Text
                style={[
                  styles.featureText,
                  !has && styles.featureTextLocked,
                ]}
              >
                {info.name}
              </Text>
              {isHighlighted && (
                <Ionicons
                  name="star"
                  size={14}
                  color={Colors.dark.primary}
                  style={{ marginLeft: "auto" }}
                />
              )}
            </View>
          );
        })}

        {/* Action button */}
        <View style={styles.buttonContainer}>
          {isCurrent ? (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Plano atual</Text>
            </View>
          ) : plan.id === "fleet" ? (
            <Pressable
              onPress={() => handleSubscribe(plan.id)}
              style={({ pressed }) => [
                styles.outlineButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.outlineButtonText}>Entrar em contato</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => handleSubscribe(plan.id)}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Assinar Pro</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Escolha seu plano</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Current plan badge */}
      <View style={styles.currentPlanRow}>
        <Text style={styles.currentPlanLabel}>Seu plano: </Text>
        <View style={styles.currentPlanBadge}>
          <Text style={styles.currentPlanBadgeText}>
            {planId === "free"
              ? "Gratuito"
              : planId === "premium"
                ? "Pro"
                : "Frota"}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {PLANS.map(renderPlanCard)}
        <View style={{ height: Spacing["4xl"] }} />
      </ScrollView>
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
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
    flex: 1,
    textAlign: "center",
  },
  currentPlanRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
  },
  currentPlanLabel: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
  currentPlanBadge: {
    backgroundColor: Colors.dark.primaryGlow,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  currentPlanBadgeText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.xs,
    color: Colors.dark.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  // ─── Plan Card ────────
  planCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius["2xl"],
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  planCardPopular: {
    borderColor: Colors.dark.primary,
    borderWidth: 2,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  popularBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    gap: 4,
    marginBottom: Spacing.md,
  },
  popularBadgeText: {
    fontFamily: Fonts.family.bold,
    fontSize: 10,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  planName: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size.xl,
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  planPrice: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size["2xl"],
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  planPricePopular: {
    color: Colors.dark.primary,
  },
  planPriceAnnual: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.md,
  },
  vehicleLimitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  vehicleLimitText: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginBottom: Spacing.lg,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  featureRowHighlight: {
    backgroundColor: Colors.dark.primaryGlow,
    marginHorizontal: -Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  featureText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.text,
    flex: 1,
  },
  featureTextLocked: {
    color: Colors.dark.textMuted,
    textDecorationLine: "line-through",
  },
  buttonContainer: {
    marginTop: Spacing.xl,
  },
  primaryButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  pressed: {
    opacity: 0.8,
  },
  primaryButtonText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: "#FFFFFF",
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: Colors.dark.borderStrong,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  outlineButtonText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
  currentBadge: {
    borderWidth: 1,
    borderColor: Colors.dark.success,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  currentBadgeText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.success,
  },
});
