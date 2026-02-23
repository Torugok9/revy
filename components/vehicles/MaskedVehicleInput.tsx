import { Colors, Fonts, Spacing } from "@/constants/theme";
import {
  cleanCurrency,
  cleanDate,
  cleanKilometers,
  cleanPlate,
  formatCurrency,
  formatDate,
  formatKilometers,
  formatPlate,
  isValidCurrency,
  isValidDate,
  isValidKilometers,
  isValidPlate,
  isValidYear,
} from "@/utils/formatters";
import React, { forwardRef, useCallback, useMemo } from "react";
import {
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
} from "react-native";

export type InputMaskType =
  | "plate"
  | "date"
  | "currency"
  | "kilometers"
  | "year"
  | "text";

interface MaskedVehicleInputProps extends RNTextInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
  maskType?: InputMaskType;
  error?: string;
  containerStyle?: any;
  showValidation?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
}

export const MaskedVehicleInput = forwardRef<
  RNTextInput,
  MaskedVehicleInputProps
>(
  (
    {
      label,
      placeholder,
      value,
      onChangeText,
      maskType = "text",
      error,
      containerStyle,
      showValidation = true,
      required = false,
      icon,
      style: inputStyleOverride,
      ...otherProps
    },
    ref
  ) => {
    // Aplicar máscara ao texto
    const handleChangeText = useCallback(
      (text: string) => {
        let formatted = text;

        switch (maskType) {
          case "plate":
            formatted = formatPlate(text);
            break;
          case "date":
            formatted = formatDate(text);
            break;
          case "currency":
            formatted = formatCurrency(text);
            break;
          case "kilometers":
            formatted = formatKilometers(text);
            break;
          // Outros tipos não têm formatação especial
          default:
            formatted = text;
        }

        onChangeText(formatted);
      },
      [maskType, onChangeText]
    );

    // Validar valor
    const isValid = useMemo(() => {
      if (!value || value.trim() === "") {
        return required ? false : null; // null = não validado ainda
      }

      switch (maskType) {
        case "plate":
          return isValidPlate(value);
        case "date":
          return isValidDate(value);
        case "currency":
          return isValidCurrency(value);
        case "kilometers":
          return isValidKilometers(value);
        case "year":
          return isValidYear(value);
        default:
          return true;
      }
    }, [value, maskType, required]);

    // Status do ícone de validação
    const validationIcon = useMemo(() => {
      if (!showValidation) return null;
      if (isValid === null) return null;
      if (isValid) return "✓";
      return "✕";
    }, [isValid, showValidation]);

    const validationIconColor = useMemo(() => {
      if (isValid === true) return Colors.dark.success;
      if (isValid === false) return Colors.dark.warning;
      return "transparent";
    }, [isValid]);

    // Determinar keyboard type
    const keyboardType = useMemo(() => {
      switch (maskType) {
        case "date":
        case "year":
        case "kilometers":
          return "number-pad" as const;
        case "currency":
          return "decimal-pad" as const;
        default:
          return "default" as const;
      }
    }, [maskType]);

    // Determinar max length
    const maxLength = useMemo(() => {
      switch (maskType) {
        case "plate":
          return 8; // ABC-1D23
        case "date":
          return 10; // DD/MM/AAAA
        case "year":
          return 4; // AAAA
        default:
          return otherProps.maxLength;
      }
    }, [maskType, otherProps.maxLength]);

    return (
      <View style={[styles.container, containerStyle]}>
        {/* Label */}
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>

        {/* Input com validação */}
        <View style={styles.inputWrapper}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <RNTextInput
            ref={ref}
            style={[
              styles.input,
              !!icon && styles.inputWithIcon,
              error && styles.inputError,
              isValid === true && styles.inputValid,
              isValid === false && styles.inputInvalid,
              inputStyleOverride,
            ]}
            placeholder={placeholder}
            placeholderTextColor={Colors.dark.textMuted}
            value={value}
            onChangeText={handleChangeText}
            keyboardType={keyboardType}
            maxLength={maxLength}
            {...otherProps}
          />

          {/* Ícone de validação */}
          {validationIcon && (
            <Text
              style={[
                styles.validationIcon,
                { color: validationIconColor },
              ]}
            >
              {validationIcon}
            </Text>
          )}
        </View>

        {/* Mensagem de erro */}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }
);

MaskedVehicleInput.displayName = "MaskedVehicleInput";

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
  required: {
    color: Colors.dark.warning,
  },
  inputWrapper: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    position: "absolute",
    left: Spacing.lg,
    zIndex: 1,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 10,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingRight: 40, // Espaço para o ícone de validação
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
  inputValid: {
    borderColor: Colors.dark.success,
  },
  inputInvalid: {
    borderColor: Colors.dark.warning,
  },
  inputError: {
    borderColor: Colors.dark.warning,
  },
  validationIcon: {
    position: "absolute",
    right: Spacing.lg,
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size.lg,
  },
  errorText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.xs,
    color: Colors.dark.warning,
    marginTop: Spacing.xs,
  },
});
