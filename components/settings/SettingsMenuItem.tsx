import { Colors, Fonts, Spacing } from "@/constants/theme";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SettingsMenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  rightElement?: React.ReactNode;
  testID?: string;
}

export const SettingsMenuItem: React.FC<SettingsMenuItemProps> = ({
  icon,
  label,
  onPress,
  rightElement,
  testID,
}) => {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={icon as any}
            size={24}
            color={Colors.dark.primary}
          />
        </View>

        <Text style={styles.label}>{label}</Text>
      </View>

      {rightElement ? (
        <View style={styles.rightElement}>{rightElement}</View>
      ) : (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.dark.textSecondary}
        />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.dark.surface,
    borderRadius: 10,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  containerPressed: {
    backgroundColor: Colors.dark.surfaceHover,
    opacity: 0.8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.dark.primaryGlow,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  label: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
  rightElement: {
    marginLeft: Spacing.lg,
  },
});
