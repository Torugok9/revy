import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, Fonts, Spacing, BorderRadius } from "@/constants/theme";
import { AuthButton } from "@/components/auth/AuthButton";

interface EmptyStateProps {
  onAddVehicle: () => void;
}

export function EmptyState({ onAddVehicle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <IconSymbol
          name="car.fill"
          size={80}
          color={Colors.dark.borderStrong}
        />
      </View>

      <Text style={styles.title}>Nenhum veículo cadastrado</Text>

      <Text style={styles.subtitle}>
        Adicione seu primeiro veículo para começar a acompanhar manutenções e
        gastos.
      </Text>

      <AuthButton
        label="Adicionar veículo"
        variant="primary"
        onPress={onAddVehicle}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    gap: Spacing["2xl"],
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: Fonts.lineHeight.normal * Fonts.size.sm,
  },
  button: {
    width: "100%",
    maxWidth: 280,
  },
});
