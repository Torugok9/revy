import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUserInfo } from "@/hooks/useUserInfo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PersonalInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateUserName } = useAuthContext();
  const {
    user,
    userInitials,
    displayName,
    displayEmail,
    planName,
    planIcon,
    joinDate,
  } = useUserInfo();

  const [name, setName] = useState(displayName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const hasChanges = name.trim() !== displayName;

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Nome é obrigatório");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await updateUserName(trimmedName);
      router.back();
    } catch {
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.headerButtonPressed,
          ]}
        >
          <Text style={styles.headerButtonText}>Cancelar</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Informações Pessoais</Text>

        <Pressable
          onPress={handleSave}
          disabled={!hasChanges || isLoading}
          style={({ pressed }) => [
            styles.saveButton,
            (!hasChanges || isLoading) && styles.saveButtonDisabled,
            pressed && styles.saveButtonPressed,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.dark.primary} size="small" />
          ) : (
            <Text
              style={[
                styles.saveButtonText,
                (!hasChanges || isLoading) && styles.saveButtonTextDisabled,
              ]}
            >
              Salvar
            </Text>
          )}
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userInitials}</Text>
          </View>
        </View>

        {/* Nome (editável) */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="Seu nome"
            placeholderTextColor={Colors.dark.textMuted}
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (error) setError("");
            }}
            editable={!isLoading}
            autoCapitalize="words"
          />
          {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
        </View>

        {/* Email (somente leitura) */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.readOnlyField}>
            <Ionicons
              name="mail-outline"
              size={18}
              color={Colors.dark.textSecondary}
            />
            <Text style={styles.readOnlyText}>{displayEmail}</Text>
          </View>
        </View>

        {/* Plano atual */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Plano atual</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.planIcon}>{planIcon}</Text>
            <Text style={styles.readOnlyText}>{planName}</Text>
          </View>
        </View>

        {/* Membro desde */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Membro desde</Text>
          <View style={styles.readOnlyField}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={Colors.dark.textSecondary}
            />
            <Text style={styles.readOnlyText}>{joinDate}</Text>
          </View>
        </View>

        <View style={{ height: Spacing["4xl"] }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerButton: {
    padding: Spacing.sm,
  },
  headerButtonPressed: {
    opacity: 0.7,
  },
  headerButtonText: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.base,
    color: Colors.dark.textSecondary,
  },
  headerTitle: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
    flex: 1,
    textAlign: "center",
  },
  saveButton: {
    padding: Spacing.sm,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonPressed: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.primary,
  },
  saveButtonTextDisabled: {
    color: Colors.dark.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.primaryGlow,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size["2xl"],
    color: Colors.dark.primary,
  },
  fieldContainer: {
    marginBottom: Spacing.xl,
  },
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
    fontSize: Fonts.size.sm,
    color: Colors.dark.warning,
    marginTop: Spacing.xs,
  },
  readOnlyField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  readOnlyText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.textSecondary,
  },
  planIcon: {
    fontSize: Fonts.size.base,
  },
});
