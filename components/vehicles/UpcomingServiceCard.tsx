import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Spacing, BorderRadius } from "@/constants/theme";
import { CircularProgress } from "./CircularProgress";

interface UpcomingServiceCardProps {
  title: string;
  kmLeft: number;
  progress: number;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export function UpcomingServiceCard({
  title,
  kmLeft,
  progress,
  icon = "build-outline",
  onPress,
}: UpcomingServiceCardProps) {
  const formattedKm = kmLeft.toLocaleString("pt-BR");

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
    >
      <CircularProgress progress={progress} size={56} strokeWidth={4}>
        <Ionicons name={icon} size={22} color={Colors.dark.primary} />
      </CircularProgress>

      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.kmLeft}>{formattedKm} km restantes</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 140,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    marginRight: Spacing.md,
  },
  containerPressed: {
    opacity: 0.7,
  },
  title: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.text,
    textAlign: "center",
    marginTop: Spacing.md,
  },
  kmLeft: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.xs,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
});
