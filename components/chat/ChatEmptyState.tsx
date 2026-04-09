import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ChatEmptyStateProps {
  onSuggestionPress: (suggestion: string) => void;
}

const SUGGESTIONS = [
  "Quando devo trocar o óleo?",
  "Meu carro está fazendo um barulho estranho",
  "O que significam as manutenções do meu histórico?",
];

export function ChatEmptyState({ onSuggestionPress }: ChatEmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatarLarge}>
        <Ionicons name="construct" size={36} color={Colors.dark.primary} />
      </View>
      <Text style={styles.greeting}>
        Olá! Sou o Revy, seu{"\n"}assistente mecânico.
      </Text>
      <Text style={styles.subtitle}>
        Pergunte sobre seu veículo e eu te ajudo.
      </Text>

      <View style={styles.suggestionsContainer}>
        {SUGGESTIONS.map((suggestion) => (
          <Pressable
            key={suggestion}
            onPress={() => onSuggestionPress(suggestion)}
            style={({ pressed }) => [
              styles.suggestionChip,
              pressed && styles.suggestionPressed,
            ]}
          >
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.dark.primaryGlow,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginBottom: Spacing["3xl"],
  },
  suggestionsContainer: {
    width: "100%",
    gap: Spacing.md,
  },
  suggestionChip: {
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: "transparent",
  },
  suggestionPressed: {
    backgroundColor: Colors.dark.primaryGlow,
    borderColor: Colors.dark.primary,
  },
  suggestionText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
    textAlign: "center",
  },
});
