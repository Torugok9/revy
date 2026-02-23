import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ONBOARDING_KEY = "revy_onboarding_completed";

const PRO_BENEFITS: { emoji: string; text: string }[] = [
  { emoji: "📊", text: "Gráficos de quilometragem e consumo" },
  { emoji: "⛽", text: "Comparação gasolina vs etanol" },
  { emoji: "📄", text: "Exportação de relatórios em PDF" },
  { emoji: "🔔", text: "Lembretes inteligentes de manutenção" },
  { emoji: "🚗", text: "Até 5 veículos na garagem" },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
  }, []);

  const handleViewPlans = useCallback(async () => {
    await completeOnboarding();
    router.replace("/plans" as any);
  }, [completeOnboarding, router]);

  const handleStartFree = useCallback(async () => {
    await completeOnboarding();
    router.replace("/(tabs)");
  }, [completeOnboarding, router]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing["3xl"], paddingBottom: insets.bottom + Spacing["2xl"] },
      ]}
    >
      {/* Title section */}
      <View style={styles.titleSection}>
        <Text style={styles.welcomeEmoji}>🚗</Text>
        <Text style={styles.title}>Bem-vindo ao Revy!</Text>
        <Text style={styles.subtitle}>
          Você está no plano Gratuito. Veja o que o Pro oferece:
        </Text>
      </View>

      {/* Benefits list */}
      <View style={styles.benefitsList}>
        {PRO_BENEFITS.map((benefit, index) => (
          <View key={index} style={styles.benefitRow}>
            <Text style={styles.benefitEmoji}>{benefit.emoji}</Text>
            <Text style={styles.benefitText}>{benefit.text}</Text>
          </View>
        ))}
      </View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <Pressable
          onPress={handleViewPlans}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="rocket-outline" size={18} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Conhecer o Pro</Text>
        </Pressable>

        <Pressable
          onPress={handleStartFree}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.secondaryButtonText}>Começar grátis</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    paddingHorizontal: Spacing["2xl"],
  },
  titleSection: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  welcomeEmoji: {
    fontSize: 56,
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size["2xl"],
    color: Colors.dark.text,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: Fonts.lineHeight.relaxed * Fonts.size.base,
  },
  benefitsList: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius["2xl"],
    padding: Spacing.xl,
    gap: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  benefitEmoji: {
    fontSize: 24,
    width: 32,
    textAlign: "center",
  },
  benefitText: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
    flex: 1,
  },
  buttonsContainer: {
    gap: Spacing.md,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
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
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.dark.borderStrong,
  },
  secondaryButtonText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
});
