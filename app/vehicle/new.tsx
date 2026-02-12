import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Colors, Fonts } from "@/constants/theme";

/**
 * Tela para criar novo veículo
 * TODO: Implementar formulário de criação
 */
export default function NewVehicleScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar Veículo</Text>
      <Text style={styles.subtitle}>
        Esta tela será implementada em breve
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.dark.background,
  },
  title: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
  },
  subtitle: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    marginTop: 16,
  },
});
