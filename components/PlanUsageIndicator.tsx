import { Colors, Fonts, Spacing } from "@/constants/theme";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface PlanUsageIndicatorProps {
  currentCount: number;
  maxCount: number;
  planId: string;
}

function getBarColor(percent: number): string {
  if (percent >= 100) return "#DC2626";
  if (percent >= 80) return "#F59E0B";
  return "#22C55E";
}

export function PlanUsageIndicator({
  currentCount,
  maxCount,
  planId,
}: PlanUsageIndicatorProps) {
  const router = useRouter();
  const percent = Math.min((currentCount / maxCount) * 100, 100);
  const barColor = getBarColor(percent);
  const isAtLimit = currentCount >= maxCount;
  const isFree = planId === "free";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>
          {currentCount}/{maxCount}{" "}
          {maxCount === 1 ? "veículo" : "veículos"}
        </Text>
      </View>
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            { width: `${percent}%`, backgroundColor: barColor },
          ]}
        />
      </View>
      {isAtLimit && isFree && (
        <Pressable
          onPress={() => router.push("/plans" as any)}
          hitSlop={8}
        >
          <Text style={styles.upgradeHint}>
            Faça upgrade para mais veículos
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  label: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.xs,
    color: Colors.dark.textSecondary,
  },
  barBackground: {
    height: 4,
    backgroundColor: Colors.dark.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: 4,
    borderRadius: 2,
  },
  upgradeHint: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.xs,
    color: Colors.dark.primary,
    marginTop: Spacing.xs,
  },
});
