import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const BANNER_DISMISSED_KEY = "revy_banner_dismissed_at";
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface UpgradeBannerProps {
  hasOverdueMaintenance?: boolean;
  hasFuelLogs?: boolean;
  vehicleCount?: number;
  maxVehicles?: number;
}

function getBannerMessage(props: UpgradeBannerProps): {
  title: string;
  subtitle: string;
  icon: string;
} {
  if (props.hasOverdueMaintenance) {
    return {
      title: "Ative lembretes inteligentes",
      subtitle: "Nunca esqueça uma revisão ou troca de peça.",
      icon: "notifications-outline",
    };
  }
  if (props.hasFuelLogs) {
    return {
      title: "Gasolina ou etanol?",
      subtitle: "Descubra qual compensa mais no seu carro.",
      icon: "swap-horizontal-outline",
    };
  }
  if (
    props.vehicleCount !== undefined &&
    props.maxVehicles !== undefined &&
    props.vehicleCount >= props.maxVehicles
  ) {
    return {
      title: "Adicione mais veículos",
      subtitle: "Faça upgrade para gerenciar até 5 carros.",
      icon: "car-outline",
    };
  }
  return {
    title: "Desbloqueie o Pro",
    subtitle: "Gráficos, exportação PDF e muito mais.",
    icon: "rocket-outline",
  };
}

export function UpgradeBanner(props: UpgradeBannerProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const dismissed = await AsyncStorage.getItem(BANNER_DISMISSED_KEY);
      if (!dismissed) {
        setVisible(true);
        return;
      }
      const elapsed = Date.now() - new Date(dismissed).getTime();
      if (elapsed >= DISMISS_COOLDOWN_MS) {
        setVisible(true);
      }
    })();
  }, []);

  const handleDismiss = useCallback(async () => {
    setVisible(false);
    await AsyncStorage.setItem(BANNER_DISMISSED_KEY, new Date().toISOString());
  }, []);

  if (!visible) return null;

  const msg = getBannerMessage(props);

  return (
    <View style={styles.container}>
      <View style={styles.accent} />
      <View style={styles.body}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={msg.icon as any}
            size={20}
            color={Colors.dark.primary}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{msg.title}</Text>
          <Text style={styles.subtitle}>{msg.subtitle}</Text>
        </View>
        <Pressable
          onPress={() => router.push("/plans" as any)}
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.ctaText}>Conhecer Pro</Text>
        </Pressable>
      </View>
      <Pressable
        onPress={handleDismiss}
        style={styles.closeButton}
        hitSlop={12}
      >
        <Ionicons name="close" size={16} color={Colors.dark.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    overflow: "hidden",
    position: "relative",
  },
  accent: {
    width: 3,
    backgroundColor: Colors.dark.primary,
  },
  body: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingLeft: Spacing.md,
    paddingRight: Spacing["3xl"],
    gap: Spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.dark.primaryGlow,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.sm,
    color: Colors.dark.text,
  },
  subtitle: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.xs,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  ctaButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  pressed: {
    opacity: 0.8,
  },
  ctaText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.xs,
    color: "#FFFFFF",
  },
  closeButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
  },
});
