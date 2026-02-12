import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Colors, Fonts, Spacing, BorderRadius } from "@/constants/theme";

interface LimitReachedModalProps {
  visible: boolean;
  onClose: () => void;
  planName: string;
  maxVehicles: number;
  onUpgrade?: () => void;
}

export function LimitReachedModal({
  visible,
  onClose,
  planName,
  maxVehicles,
  onUpgrade,
}: LimitReachedModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modal}>
            <Text style={styles.title}>Limite de veículos atingido</Text>

            <Text style={styles.message}>
              Seu plano {planName} permite até {maxVehicles}{" "}
              {maxVehicles === 1 ? "veículo" : "veículos"}. Faça upgrade para
              cadastrar mais.
            </Text>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  onUpgrade?.();
                  onClose();
                }}
              >
                <Text style={styles.primaryButtonText}>Ver planos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onClose}
              >
                <Text style={styles.secondaryButtonText}>Entendi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
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
  modalContainer: {
    width: "100%",
    paddingHorizontal: Spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: BorderRadius["2xl"],
    padding: Spacing["2xl"],
    gap: Spacing.lg,
    width: "100%",
    maxWidth: 320,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  title: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
    textAlign: "center",
    lineHeight: Fonts.lineHeight.tight * Fonts.size.lg,
  },
  message: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: Fonts.lineHeight.normal * Fonts.size.sm,
  },
  buttonGroup: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.sm,
    color: "#FFFFFF",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.dark.borderStrong,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
});
