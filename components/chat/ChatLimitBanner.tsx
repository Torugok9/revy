import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ChatLimitBannerProps {
  used: number;
  limit: number;
  isAtLimit: boolean;
}

export function ChatLimitBanner({ used, limit, isAtLimit }: ChatLimitBannerProps) {
  const router = useRouter();

  if (isAtLimit) {
    return (
      <View style={styles.blockedContainer}>
        <Ionicons name="lock-closed" size={20} color={Colors.dark.warning} />
        <Text style={styles.blockedTitle}>Limite de mensagens atingido</Text>
        <Text style={styles.blockedText}>
          Faça upgrade para continuar conversando
        </Text>
        <Pressable
          onPress={() => router.push("/plans" as any)}
          style={({ pressed }) => [
            styles.upgradeButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.upgradeButtonText}>Fazer upgrade</Text>
        </Pressable>
      </View>
    );
  }

  // Warning banner (used >= 80%)
  return (
    <View style={styles.warningContainer}>
      <View style={styles.warningRow}>
        <Ionicons name="alert-circle" size={16} color={Colors.dark.warning} />
        <Text style={styles.warningText}>
          Você usou {used} de {limit} mensagens este mês.
        </Text>
      </View>
      <Pressable onPress={() => router.push("/plans" as any)}>
        <Text style={styles.upgradeLink}>Fazer upgrade →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  warningContainer: {
    backgroundColor: "#1C1C1E",
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  warningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  warningText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.text,
    flex: 1,
  },
  upgradeLink: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.sm,
    color: Colors.dark.warning,
  },
  blockedContainer: {
    backgroundColor: "#1C1C1E",
    paddingVertical: Spacing["2xl"],
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
  },
  blockedTitle: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.md,
    color: Colors.dark.text,
  },
  blockedText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
  },
  upgradeButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing["3xl"],
    borderRadius: BorderRadius.lg,
  },
  pressed: {
    opacity: 0.8,
  },
  upgradeButtonText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: "#FFFFFF",
  },
});
