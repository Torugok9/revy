import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import React from "react";
import {
  TextInput as RNTextInput,
  StyleSheet,
  Text,
  TextInputProps,
  View,
} from "react-native";

interface VehicleInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: object;
  onSubmitEditing?: () => void;
}

export const VehicleInput = React.forwardRef<RNTextInput, VehicleInputProps>(
  function VehicleInput(
    { label, error, containerStyle, style, onSubmitEditing, ...props },
    ref,
  ) {
    return (
      <View style={containerStyle}>
        {label && <Text style={styles.label}>{label}</Text>}
        <RNTextInput
          ref={ref}
          style={[styles.input, error && styles.inputError, style]}
          placeholderTextColor={Colors.dark.textMuted}
          onSubmitEditing={onSubmitEditing}
          {...props}
        />
        {error && <Text style={styles.errorMessage}>{error}</Text>}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  label: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
  inputError: {
    borderColor: Colors.dark.warning,
  },
  errorMessage: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.xs,
    color: Colors.dark.warning,
    marginTop: Spacing.xs,
  },
});
