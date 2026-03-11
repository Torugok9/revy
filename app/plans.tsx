import { FEATURE_DISPLAY } from "@/constants/features";
import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { useFeaturesContext } from "@/contexts/FeaturesContext";
import { useRevenueCat } from "@/contexts/RevenueCatContext";
import { useSubscription } from "@/hooks/useSubscription";
import type { FeatureKey } from "@/types/plans";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Plan data ──────────────────────────────────────────────────────
interface PlanData {
  id: string;
  name: string;
  maxVehicles: string;
  features: FeatureKey[];
  isPopular?: boolean;
}

const PLANS: PlanData[] = [
  {
    id: "free",
    name: "Gratuito",
    maxVehicles: "1 veículo",
    features: [],
  },
  {
    id: "premium",
    name: "Pro",
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

type BillingPeriod = "monthly" | "yearly";

export default function PlansScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { planId } = useFeaturesContext();
  const { currentOffering } = useRevenueCat();
  const params = useLocalSearchParams();
  const highlightFeature = params.highlight as FeatureKey | undefined;

  const {
    subscribe,
    presentPaywall,
    manageSubscription,
    restorePurchases,
    loading,
  } = useSubscription();

  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("yearly");

  const isPremium = planId === "premium";

  // Preços dinâmicos do RevenueCat (com fallback para valores estáticos)
  const prices = useMemo(() => {
    const monthly = currentOffering?.monthly?.product;
    const annual = currentOffering?.annual?.product;

    return {
      monthly: {
        main: monthly?.priceString ?? "R$ 14,90",
        sub: "/mês",
      },
      yearly: {
        main: annual?.priceString ?? "R$ 119,90",
        sub: "/ano",
      },
    };
  }, [currentOffering]);

  const handleSubscribe = async (targetPlanId: string) => {
    if (targetPlanId === "fleet") {
      Alert.alert(
        "Plano Frota",
        "Entre em contato conosco para saber mais sobre o plano Frota.",
      );
      return;
    }

    if (targetPlanId === "free") return;

    await subscribe(billingPeriod);
  };

  const getPriceDisplay = () => {
    return billingPeriod === "monthly" ? prices.monthly : prices.yearly;
  };

  const renderBillingToggle = () => (
    <View style={styles.billingToggleContainer}>
      <Pressable
        onPress={() => setBillingPeriod("monthly")}
        style={[
          styles.billingToggleOption,
          billingPeriod === "monthly" && styles.billingToggleOptionActive,
        ]}
      >
        <Text
          style={[
            styles.billingToggleText,
            billingPeriod === "monthly" && styles.billingToggleTextActive,
          ]}
        >
          Mensal
        </Text>
      </Pressable>
      <Pressable
        onPress={() => setBillingPeriod("yearly")}
        style={[
          styles.billingToggleOption,
          billingPeriod === "yearly" && styles.billingToggleOptionActive,
        ]}
      >
        <Text
          style={[
            styles.billingToggleText,
            billingPeriod === "yearly" && styles.billingToggleTextActive,
          ]}
        >
          Anual
        </Text>
        <View style={styles.saveBadge}>
          <Text style={styles.saveBadgeText}>-33%</Text>
        </View>
      </Pressable>
    </View>
  );

  const renderPlanCard = (plan: PlanData) => {
    const isCurrent = plan.id === planId;
    const isPopular = plan.isPopular;
    const planFeatureSet = new Set(plan.features);

    return (
      <View
        key={plan.id}
        style={[styles.planCard, isPopular && styles.planCardPopular]}
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

        {plan.id === "free" && <Text style={styles.planPrice}>Grátis</Text>}

        {plan.id === "premium" && (
          <>
            {/* Billing toggle */}
            {!isPremium && renderBillingToggle()}

            {isPremium ? (
              <View style={styles.currentPlanPriceRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={Colors.dark.success}
                />
                <Text style={styles.currentPlanText}>Plano atual</Text>
              </View>
            ) : (
              <View style={styles.priceRow}>
                <Text style={[styles.planPrice, styles.planPricePopular]}>
                  {getPriceDisplay().main}
                </Text>
                <Text style={styles.planPriceSuffix}>
                  {getPriceDisplay().sub}
                </Text>
              </View>
            )}

            {!isPremium && billingPeriod === "yearly" && (
              <Text style={styles.planPriceEquivalent}>
                Equivale a R$ 9,99/mês
              </Text>
            )}
          </>
        )}

        {plan.id === "fleet" && (
          <Text style={styles.planPrice}>Sob consulta</Text>
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
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={Colors.dark.success}
            />
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
                style={[styles.featureText, !has && styles.featureTextLocked]}
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
          {isCurrent && plan.id === "free" ? (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Plano atual</Text>
            </View>
          ) : isCurrent && isPremium ? (
            <View style={styles.premiumActions}>
              <Pressable
                onPress={() => manageSubscription()}
                disabled={loading}
                style={({ pressed }) => [
                  styles.outlineButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="settings-outline"
                  size={16}
                  color={Colors.dark.text}
                  style={{ marginRight: Spacing.sm }}
                />
                <Text style={styles.outlineButtonText}>
                  Gerenciar assinatura
                </Text>
              </Pressable>
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
          ) : plan.id === "premium" ? (
            <View style={styles.premiumSubscribeActions}>
              <Pressable
                onPress={() => handleSubscribe(plan.id)}
                disabled={loading}
                style={({ pressed }) => [
                  styles.primaryButton,
                  loading && styles.buttonDisabled,
                  pressed && styles.pressed,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Assinar Pro</Text>
                )}
              </Pressable>
              <Pressable
                onPress={presentPaywall}
                style={({ pressed }) => [
                  styles.paywallButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="pricetags-outline"
                  size={16}
                  color={Colors.dark.primary}
                  style={{ marginRight: Spacing.sm }}
                />
                <Text style={styles.paywallButtonText}>
                  Ver todas as ofertas
                </Text>
              </Pressable>
            </View>
          ) : null}
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
        <View
          style={[
            styles.currentPlanBadge,
            isPremium && styles.currentPlanBadgePremium,
          ]}
        >
          <Text
            style={[
              styles.currentPlanBadgeText,
              isPremium && styles.currentPlanBadgeTextPremium,
            ]}
          >
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

        {/* Restaurar Compras */}
        <Pressable
          onPress={() => restorePurchases()}
          disabled={loading}
          style={({ pressed }) => [
            styles.restoreButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.restoreButtonText}>Restaurar compras</Text>
        </Pressable>

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
  currentPlanBadgePremium: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    borderColor: Colors.dark.success,
  },
  currentPlanBadgeText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.xs,
    color: Colors.dark.primary,
  },
  currentPlanBadgeTextPremium: {
    color: Colors.dark.success,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  // ─── Billing toggle ────────
  billingToggleContainer: {
    flexDirection: "row",
    backgroundColor: Colors.dark.background,
    borderRadius: BorderRadius.lg,
    padding: 3,
    marginBottom: Spacing.lg,
    gap: 3,
  },
  billingToggleOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  billingToggleOptionActive: {
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  billingToggleText: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textMuted,
  },
  billingToggleTextActive: {
    color: Colors.dark.text,
  },
  saveBadge: {
    backgroundColor: Colors.dark.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  saveBadgeText: {
    fontFamily: Fonts.family.bold,
    fontSize: 10,
    color: "#FFFFFF",
  },
  // ─── Price ────────
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: Spacing.xs,
  },
  planPriceSuffix: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.textSecondary,
    marginLeft: 2,
  },
  planPriceEquivalent: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.md,
  },
  currentPlanPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  currentPlanText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.success,
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
  // ─── Buttons ────────
  buttonContainer: {
    marginTop: Spacing.xl,
  },
  primaryButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  buttonDisabled: {
    opacity: 0.7,
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
    flexDirection: "row",
    borderWidth: 1,
    borderColor: Colors.dark.borderStrong,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
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
  premiumActions: {
    gap: Spacing.md,
  },
  premiumSubscribeActions: {
    gap: Spacing.md,
  },
  paywallButton: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  paywallButtonText: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.primary,
  },
  restoreButton: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  restoreButtonText: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    textDecorationLine: "underline",
  },
});
