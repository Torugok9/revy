import {
  BorderRadius,
  Colors,
  Fonts,
  Spacing,
} from "@/constants/theme";
import type {
  PurchaseErrorAction,
  PurchaseErrorInfo,
  PurchaseErrorSeverity,
} from "@/constants/purchase-errors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ─── Props ──────────────────────────────────────────────────────────

export interface PurchaseErrorSheetProps {
  visible: boolean;
  errorInfo: PurchaseErrorInfo | null;
  onAction: (actionType: PurchaseErrorAction) => void;
  onDismiss: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<PurchaseErrorSeverity, string> = {
  silent: "transparent",
  info: Colors.dark.primary,
  warning: Colors.dark.warning,
  error: Colors.dark.danger,
  internal: Colors.dark.textSecondary,
};

const SEVERITY_BG: Record<PurchaseErrorSeverity, string> = {
  silent: "transparent",
  info: Colors.dark.primaryGlow,
  warning: "rgba(245, 158, 11, 0.12)",
  error: "rgba(239, 68, 68, 0.12)",
  internal: "rgba(115, 115, 115, 0.12)",
};

const HAPTIC_TYPE: Record<PurchaseErrorSeverity, Haptics.NotificationFeedbackType> = {
  silent: Haptics.NotificationFeedbackType.Success,
  info: Haptics.NotificationFeedbackType.Warning,
  warning: Haptics.NotificationFeedbackType.Warning,
  error: Haptics.NotificationFeedbackType.Error,
  internal: Haptics.NotificationFeedbackType.Error,
};

// ─── Component ──────────────────────────────────────────────────────

export function PurchaseErrorSheet({
  visible,
  errorInfo,
  onAction,
  onDismiss,
}: PurchaseErrorSheetProps) {
  useEffect(() => {
    if (visible && errorInfo) {
      Haptics.notificationAsync(HAPTIC_TYPE[errorInfo.severity]);
    }
  }, [visible, errorInfo]);

  if (!errorInfo) return null;

  const color = SEVERITY_COLORS[errorInfo.severity];
  const bgColor = SEVERITY_BG[errorInfo.severity];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.backdrop} onPress={onDismiss} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={[styles.iconCircle, { backgroundColor: bgColor }]}>
          <Ionicons
            name={errorInfo.icon as any}
            size={28}
            color={color}
          />
        </View>

        <Text style={styles.title}>{errorInfo.title}</Text>
        <Text style={styles.description}>{errorInfo.message}</Text>

        {errorInfo.primaryAction && (
          <Pressable
            onPress={() => onAction(errorInfo.primaryAction!.type)}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: color },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {errorInfo.primaryAction.label}
            </Text>
          </Pressable>
        )}

        {errorInfo.secondaryAction && (
          <Pressable
            onPress={() => onAction(errorInfo.secondaryAction!.type)}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>
              {errorInfo.secondaryAction.label}
            </Text>
          </Pressable>
        )}
      </View>
    </Modal>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
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
