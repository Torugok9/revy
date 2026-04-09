import { BorderRadius, Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

export function AssistantAvatar() {
  return (
    <View style={styles.container}>
      <Ionicons name="construct" size={16} color={Colors.dark.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.dark.primaryGlow,
    justifyContent: "center",
    alignItems: "center",
  },
});
