import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, Fonts, Spacing, BorderRadius } from "@/constants/theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function SearchBar({ value, onChangeText }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <IconSymbol
        name="magnifyingglass"
        size={18}
        color={Colors.dark.textSecondary}
      />
      <TextInput
        style={styles.input}
        placeholder="Pesquise seus veículos..."
        placeholderTextColor={Colors.dark.textSecondary}
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText("")}>
          <IconSymbol
            name="xmark.circle.fill"
            size={18}
            color={Colors.dark.textSecondary}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
    padding: 0,
  },
});
