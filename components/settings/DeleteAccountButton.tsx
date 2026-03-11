import { Colors, Fonts, Spacing } from "@/constants/theme";
import { useAuthContext } from "@/contexts/AuthContext";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const DeleteAccountButton: React.FC = () => {
  const { deleteAccount, user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const isConfirmed = confirmText.toLowerCase() === "excluir";

  const handleDeleteAccount = async () => {
    if (!isConfirmed) return;

    setIsLoading(true);
    try {
      await deleteAccount();
      setShowConfirmation(false);
      setConfirmText("");
    } catch (error) {
      Alert.alert(
        "Erro",
        "Não foi possível excluir sua conta. Tente novamente.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Delete Account Button */}
      <Pressable
        onPress={() => setShowConfirmation(true)}
        disabled={isLoading}
        style={({ pressed }) => [
          styles.deleteButton,
          pressed && styles.deleteButtonPressed,
          isLoading && styles.deleteButtonDisabled,
        ]}
      >
        <View style={styles.deleteContent}>
          <Ionicons
            name="trash-outline"
            size={20}
            color={Colors.dark.danger}
            style={styles.deleteIcon}
          />
          <Text style={styles.deleteText}>Excluir Conta</Text>
        </View>
      </Pressable>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowConfirmation(false);
          setConfirmText("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons
                name="warning"
                size={48}
                color={Colors.dark.danger}
              />
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>Excluir Conta Permanentemente</Text>

            {/* Message */}
            <Text style={styles.modalMessage}>
              Esta ação é irreversível. Todos os seus dados serão apagados
              permanentemente, incluindo veículos, abastecimentos, manutenções e
              histórico de quilometragem.
            </Text>

            {/* Email display */}
            <View style={styles.emailBox}>
              <Text style={styles.emailLabel}>Conta:</Text>
              <Text style={styles.emailText}>{user?.email}</Text>
            </View>

            {/* Confirmation input */}
            <Text style={styles.inputLabel}>
              Digite <Text style={styles.inputLabelBold}>EXCLUIR</Text> para
              confirmar:
            </Text>
            <TextInput
              style={styles.confirmInput}
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder="EXCLUIR"
              placeholderTextColor={Colors.dark.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              <Pressable
                onPress={() => {
                  setShowConfirmation(false);
                  setConfirmText("");
                }}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.cancelButtonPressed,
                ]}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={handleDeleteAccount}
                disabled={isLoading || !isConfirmed}
                style={({ pressed }) => [
                  styles.confirmButton,
                  pressed && isConfirmed && styles.confirmButtonPressed,
                  (!isConfirmed || isLoading) && styles.confirmButtonDisabled,
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator
                    color={Colors.dark.text}
                    size="small"
                  />
                ) : (
                  <Text style={styles.confirmButtonText}>
                    Excluir Conta
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  deleteButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 10,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonPressed: {
    backgroundColor: "rgba(239, 68, 68, 0.05)",
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteIcon: {
    marginRight: Spacing.sm,
  },
  deleteText: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.danger,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.danger,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  modalMessage: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  emailBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.surface,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  emailLabel: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
  emailText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.sm,
    color: Colors.dark.text,
  },
  inputLabel: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  inputLabelBold: {
    fontFamily: Fonts.family.semibold,
    color: Colors.dark.danger,
  },
  confirmInput: {
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 10,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 10,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonPressed: {
    backgroundColor: Colors.dark.border,
  },
  cancelButtonText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: Colors.dark.danger,
    borderRadius: 10,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonPressed: {
    opacity: 0.8,
  },
  confirmButtonDisabled: {
    opacity: 0.4,
  },
  confirmButtonText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
});
