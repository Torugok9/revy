import { FEATURE_DISPLAY } from "@/constants/features";
import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

// ─── Props ──────────────────────────────────────────────────────────

export interface PurchaseSuccessSheetProps {
  visible: boolean;
  onDismiss: () => void;
}

// Features desbloqueadas no Pro (subset para exibir)
const HIGHLIGHT_FEATURES = [
  "km_charts",
  "fuel_comparison",
  "cost_per_km",
  "pdf_export",
  "push_reminders",
  "fuel_stats_advanced",
  "receipt_photo",
  "sale_report",
  "odometer_history",
] as const;

// ─── Component ──────────────────────────────────────────────────────

export function PurchaseSuccessSheet({
  visible,
  onDismiss,
}: PurchaseSuccessSheetProps) {
  const glowScale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Pulsar sutil no glow do ícone
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 1200 }),
          withTiming(1, { duration: 1200 }),
        ),
        -1,
        true,
      );
    }
  }, [visible, glowScale]);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <Animated.View
          entering={FadeInUp.duration(400).springify()}
          style={styles.container}
        >
          {/* Header com gradiente */}
          <LinearGradient
            colors={["rgba(220, 38, 38, 0.15)", "transparent"]}
            style={styles.headerGradient}
          />

          <View style={styles.handle} />

          {/* Ícone com glow animado */}
          <View style={styles.iconArea}>
            <Animated.View style={[styles.glowRing, glowStyle]} />
            <Animated.View
              entering={ZoomIn.delay(200).duration(500).springify()}
              style={styles.iconCircle}
            >
              <Ionicons name="diamond" size={32} color="#FFFFFF" />
            </Animated.View>
          </View>

          {/* Título */}
          <Animated.Text
            entering={FadeInDown.delay(300).duration(400)}
            style={styles.title}
          >
            Bem-vindo ao Pro!
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(400).duration(400)}
            style={styles.subtitle}
          >
            Todos os recursos premium foram desbloqueados para você.
          </Animated.Text>

          {/* Lista de features */}
          <Animated.View
            entering={FadeIn.delay(500).duration(500)}
            style={styles.featuresContainer}
          >
            <ScrollView
              style={styles.featuresList}
              showsVerticalScrollIndicator={false}
            >
              {HIGHLIGHT_FEATURES.map((key, index) => {
                const info = FEATURE_DISPLAY[key];
                return (
                  <Animated.View
                    key={key}
                    entering={FadeInDown.delay(550 + index * 60).duration(350)}
                    style={styles.featureRow}
                  >
                    <View style={styles.featureIcon}>
                      <Ionicons
                        name={info.icon as any}
                        size={18}
                        color={Colors.dark.primary}
                      />
                    </View>
                    <Text style={styles.featureName}>{info.name}</Text>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={Colors.dark.success}
                    />
                  </Animated.View>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* CTA */}
          <Animated.View
            entering={FadeInDown.delay(900).duration(400)}
            style={styles.ctaArea}
          >
            <Pressable
              onPress={onDismiss}
              style={({ pressed }) => [
                styles.ctaButton,
                pressed && styles.ctaPressed,
              ]}
            >
              <LinearGradient
                colors={[Colors.dark.primaryLight, Colors.dark.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>Começar a explorar</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: Spacing["4xl"],
    maxHeight: "85%",
    overflow: "hidden",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.borderStrong,
    alignSelf: "center",
    marginTop: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  iconArea: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
    height: 80,
  },
  glowRing: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(220, 38, 38, 0.12)",
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.dark.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size["2xl"],
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    paddingHorizontal: Spacing["3xl"],
    marginBottom: Spacing["2xl"],
    lineHeight: Fonts.lineHeight.relaxed * Fonts.size.base,
  },
  featuresContainer: {
    marginHorizontal: Spacing["2xl"],
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius["2xl"],
    maxHeight: 280,
    overflow: "hidden",
  },
  featuresList: {
    paddingVertical: Spacing.sm,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.primaryGlow,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  featureName: {
    flex: 1,
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
  ctaArea: {
    paddingHorizontal: Spacing["2xl"],
    marginTop: Spacing["2xl"],
  },
  ctaButton: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  ctaText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.md,
    color: "#FFFFFF",
  },
});
