import { LogoutButton } from "@/components/settings/LogoutButton";
import { SettingsMenuItem } from "@/components/settings/SettingsMenuItem";
import { UserProfileCard } from "@/components/settings/UserProfileCard";
import { Colors, Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";

export default function SettingsScreen() {
  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      console.error("Erro ao abrir link");
    });
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configurações</Text>
        <Text style={styles.headerSubtitle}>
          Gerencie sua conta e preferências
        </Text>
      </View>

      {/* User Profile Card */}
      <UserProfileCard />

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conta</Text>

        <SettingsMenuItem
          icon="person-outline"
          label="Informações Pessoais"
          onPress={() => {
            // TODO: Implementar navegação para edição de perfil
            console.log("Editar informações pessoais");
          }}
        />

        <SettingsMenuItem
          icon="card-outline"
          label="Meu Plano"
          onPress={() => {
            // TODO: Implementar tela de plano
            console.log("Ver plano");
          }}
          rightElement={
            <Ionicons
              name="arrow-forward-circle-outline"
              size={20}
              color={Colors.dark.primary}
            />
          }
        />

        <SettingsMenuItem
          icon="notifications-outline"
          label="Notificações"
          onPress={() => {
            // TODO: Implementar configurações de notificações
            console.log("Notificações");
          }}
        />
      </View>

      {/* App Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aplicativo</Text>

        <SettingsMenuItem
          icon="information-circle-outline"
          label="Sobre o App"
          onPress={() => {
            console.log("Sobre o app");
          }}
          rightElement={<Text style={styles.versionText}>v1.0.0</Text>}
        />

        <SettingsMenuItem
          icon="document-text-outline"
          label="Termos de Uso"
          onPress={() => {
            handleOpenLink("https://exemplo.com/termos");
          }}
        />

        <SettingsMenuItem
          icon="shield-checkmark-outline"
          label="Política de Privacidade"
          onPress={() => {
            handleOpenLink("https://exemplo.com/privacidade");
          }}
        />
      </View>

      {/* Help Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ajuda</Text>

        <SettingsMenuItem
          icon="help-circle-outline"
          label="Central de Ajuda"
          onPress={() => {
            handleOpenLink("https://exemplo.com/ajuda");
          }}
        />

        <SettingsMenuItem
          icon="mail-outline"
          label="Contate-nos"
          onPress={() => {
            Linking.openURL("mailto:suporte@revy.app");
          }}
        />
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <LogoutButton />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Revvy - Gerencie seus veículos com inteligência
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  contentContainer: {
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size["2xl"],
    color: Colors.dark.text,
    marginBottom: Spacing.sm,
  },
  headerSubtitle: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.textSecondary,
  },
  section: {
    marginBottom: Spacing["3xl"],
  },
  sectionTitle: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.lg,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  logoutSection: {
    marginBottom: Spacing.xl,
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  footerText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.xs,
    color: Colors.dark.textMuted,
    textAlign: "center",
  },
  versionText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
});
