import { FEATURE_DISPLAY } from "@/constants/features";
import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { useFeaturesContext } from "@/contexts/FeaturesContext";
import type { FeatureKey } from "@/types/plans";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface FeatureGateProps {
  feature: FeatureKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  mode?: "card" | "action" | "inline";
}

// ─── mode="card" fallback ────────────────────────────────────────────
function CardFallback({ feature }: { feature: FeatureKey }) {
  const router = useRouter();
  const info = FEATURE_DISPLAY[feature];

  return (
    <View style={cardStyles.wrapper}>
      {/* Blurred placeholder overlay */}
      <View style={cardStyles.overlay}>
        <View style={cardStyles.lockCircle}>
          <Ionicons name="lock-closed" size={24} color={Colors.dark.primary} />
        </View>
        <Text style={cardStyles.featureName}>{info.name}</Text>
        <Text style={cardStyles.proLabel}>Disponível no Pro</Text>
        <Pressable
          onPress={() =>
            router.push(`/plans?highlight=${feature}` as any)
          }
          style={({ pressed }) => [
            cardStyles.viewPlansButton,
            pressed && cardStyles.pressed,
          ]}
        >
          <Text style={cardStyles.viewPlansText}>Ver planos</Text>
        </Pressable>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.dark.borderStrong,
    overflow: "hidden",
    minHeight: 140,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 10, 10, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
    paddingHorizontal: Spacing.lg,
  },
  lockCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.dark.primaryGlow,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  featureName: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  proLabel: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.lg,
  },
  viewPlansButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  pressed: {
    opacity: 0.8,
  },
  viewPlansText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.sm,
    color: "#FFFFFF",
  },
});

// ─── mode="action" fallback ──────────────────────────────────────────
function ActionGate({
  feature,
  children,
}: {
  feature: FeatureKey;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const info = FEATURE_DISPLAY[feature];
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Pressable onPress={() => setModalVisible(true)}>
        <View pointerEvents="none">{children}</View>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={actionStyles.backdrop}
          onPress={() => setModalVisible(false)}
        />
        <View style={actionStyles.sheet}>
          <View style={actionStyles.handle} />
          <View style={actionStyles.iconCircle}>
            <Ionicons
              name={info.icon as any}
              size={28}
              color={Colors.dark.primary}
            />
          </View>
          <Text style={actionStyles.title}>{info.name}</Text>
          <Text style={actionStyles.description}>{info.description}</Text>

          <Pressable
            onPress={() => {
              setModalVisible(false);
              router.push(`/plans?highlight=${feature}` as any);
            }}
            style={({ pressed }) => [
              actionStyles.primaryButton,
              pressed && actionStyles.pressed,
            ]}
          >
            <Text style={actionStyles.primaryButtonText}>Ver planos</Text>
          </Pressable>

          <Pressable
            onPress={() => setModalVisible(false)}
            style={({ pressed }) => [
              actionStyles.secondaryButton,
              pressed && actionStyles.pressed,
            ]}
          >
            <Text style={actionStyles.secondaryButtonText}>Agora não</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const actionStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sheet: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing.lg,
    paddingBottom: Spacing["4xl"],
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.borderStrong,
    marginBottom: Spacing["2xl"],
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.primaryGlow,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size.xl,
    color: Colors.dark.text,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  description: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginBottom: Spacing["2xl"],
    lineHeight: Fonts.lineHeight.relaxed * Fonts.size.base,
    paddingHorizontal: Spacing.lg,
  },
  primaryButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    width: "100%",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  pressed: {
    opacity: 0.8,
  },
  primaryButtonText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: "#FFFFFF",
  },
  secondaryButton: {
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
});

// ─── mode="inline" fallback ──────────────────────────────────────────
function InlineFallback({ children }: { children: React.ReactNode }) {
  return (
    <View style={inlineStyles.wrapper}>
      {children}
      <View style={inlineStyles.badge}>
        <Ionicons
          name="lock-closed"
          size={8}
          color="#FFFFFF"
          style={{ marginRight: 3 }}
        />
        <Text style={inlineStyles.badgeText}>Pro</Text>
      </View>
    </View>
  );
}

const inlineStyles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontFamily: Fonts.family.semibold,
    fontSize: 9,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});

// ─── Main Component ──────────────────────────────────────────────────
export function FeatureGate({
  feature,
  children,
  fallback,
  mode = "card",
}: FeatureGateProps) {
  const { canUse } = useFeaturesContext();

  if (canUse(feature)) {
    return <>{children}</>;
  }

  // Custom fallback always takes precedence
  if (fallback) {
    return <>{fallback}</>;
  }

  switch (mode) {
    case "action":
      return <ActionGate feature={feature}>{children}</ActionGate>;
    case "inline":
      return <InlineFallback>{children}</InlineFallback>;
    case "card":
    default:
      return <CardFallback feature={feature} />;
  }
}
