import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const confirmColor = isDangerous ? Colors.dark.danger : Colors.dark.primary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.centeredView}>
          <View style={styles.modal}>
            {/* Título */}
            <Text style={styles.title}>{title}</Text>

            {/* Mensagem */}
            <Text style={styles.message}>{message}</Text>

            {/* Botões */}
            <View style={styles.buttonContainer}>
              {/* Botão Cancelar */}
              <Pressable
                onPress={onCancel}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.button,
                  styles.buttonCancel,
                  pressed && !isLoading && styles.buttonCancelPressed,
                ]}
              >
                <Text style={styles.buttonCancelText}>{cancelText}</Text>
              </Pressable>

              {/* Botão Confirmar */}
              <Pressable
                onPress={onConfirm}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.button,
                  styles.buttonConfirm,
                  { backgroundColor: confirmColor },
                  pressed && !isLoading && styles.buttonConfirmPressed,
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.dark.text} size="small" />
                ) : (
                  <Text style={styles.buttonConfirmText}>{confirmText}</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  modal: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing["2xl"],
    maxWidth: 320,
    width: "85%",
  },
  title: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
    marginBottom: Spacing.lg,
  },
  message: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.xl,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonCancel: {
    backgroundColor: "transparent",
  },
  buttonCancelPressed: {
    backgroundColor: Colors.dark.border,
  },
  buttonCancelText: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.base,
    color: Colors.dark.textSecondary,
  },
  buttonConfirm: {
    backgroundColor: Colors.dark.primary,
  },
  buttonConfirmPressed: {
    opacity: 0.8,
  },
  buttonConfirmText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
});
