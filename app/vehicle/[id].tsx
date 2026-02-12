import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors, Fonts } from "@/constants/theme";

/**
 * Tela de detalhes do veículo
 * TODO: Implementar detalhes e edição
 */
export default function VehicleDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalhes do Veículo</Text>
      <Text style={styles.subtitle}>
        ID: {id}
      </Text>
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
