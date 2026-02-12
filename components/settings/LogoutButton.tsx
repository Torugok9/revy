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
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface LogoutButtonProps {
  onLogoutSuccess?: () => void;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  onLogoutSuccess,
}) => {
  const { signOut } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      setShowConfirmation(false);
      onLogoutSuccess?.();
      // O redirecionamento para /auth é feito automaticamente pelo AuthContext
    } catch (error) {
      Alert.alert(
        "Erro",
        "Não foi possível fazer logout. Tente novamente.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Logout Button */}
      <Pressable
        onPress={() => setShowConfirmation(true)}
        disabled={isLoading}
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.logoutButtonPressed,
          isLoading && styles.logoutButtonDisabled,
        ]}
      >
        <View style={styles.logoutContent}>
          <Ionicons
            name="log-out-outline"
            size={20}
            color={Colors.dark.danger}
            style={styles.logoutIcon}
          />
          <Text style={styles.logoutText}>
            {isLoading ? "Saindo..." : "Sair da Conta"}
          </Text>
        </View>
      </Pressable>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons
                name="alert-circle"
                size={48}
                color={Colors.dark.warning}
              />
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>Sair da Conta?</Text>

            {/* Message */}
            <Text style={styles.modalMessage}>
              Tem certeza que deseja sair? Você poderá fazer login novamente
              a qualquer momento.
            </Text>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              <Pressable
                onPress={() => setShowConfirmation(false)}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.cancelButtonPressed,
                ]}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={handleLogout}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.confirmButton,
                  pressed && styles.confirmButtonPressed,
                  isLoading && styles.confirmButtonDisabled,
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator
                    color={Colors.dark.text}
                    size="small"
                  />
                ) : (
                  <Text style={styles.confirmButtonText}>Sair</Text>
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
  logoutButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.dark.danger,
    borderRadius: 10,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: Spacing.xl,
  },
  logoutButtonPressed: {
    backgroundColor: Colors.dark.danger,
    opacity: 0.1,
  },
  logoutButtonDisabled: {
    opacity: 0.5,
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutIcon: {
    marginRight: Spacing.sm,
  },
  logoutText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
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
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  modalMessage: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 1.5,
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
    opacity: 0.6,
  },
  confirmButtonText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
});
