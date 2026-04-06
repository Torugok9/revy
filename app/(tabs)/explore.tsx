import { LogoutButton } from "@/components/settings/LogoutButton";
import { SettingsMenuItem } from "@/components/settings/SettingsMenuItem";
import { UserProfileCard } from "@/components/settings/UserProfileCard";
import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { useFeaturesContext } from "@/contexts/FeaturesContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const router = useRouter();
  const { planId } = useFeaturesContext();
  const { manageSubscription } = useSubscription();

  const isPremium = planId === "premium";
  const planLabel =
    planId === "free" ? "Gratuito" : planId === "premium" ? "Pro" : "Frota";

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
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

        {/* My Plan Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meu Plano</Text>
          <Pressable
            onPress={() => router.push("/plans" as any)}
            style={({ pressed }) => [
              styles.planCard,
              pressed && { opacity: 0.8 },
            ]}
          >
            <View style={styles.planCardLeft}>
              <View
                style={[styles.planBadge, isPremium && styles.planBadgePremium]}
              >
                <Text
                  style={[
                    styles.planBadgeText,
                    isPremium && styles.planBadgeTextPremium,
                  ]}
                >
                  {planLabel}
                </Text>
              </View>
              <Text style={styles.planCardHint}>
                {isPremium
                  ? "Você tem acesso a todos os recursos Pro"
                  : "Faça upgrade para desbloquear recursos"}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.dark.textSecondary}
            />
          </Pressable>

          {/* Premium management — redireciona para configurações do iOS */}
          {isPremium && (
            <View style={styles.premiumManagement}>
              <Pressable
                onPress={() => manageSubscription()}
                style={({ pressed }) => [
                  styles.managementButton,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Ionicons
                  name="settings-outline"
                  size={18}
                  color={Colors.dark.primary}
                />
                <Text style={styles.managementButtonText}>
                  Gerenciar assinatura
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>

          <SettingsMenuItem
            icon="person-outline"
            label="Informações Pessoais"
            onPress={() => {
              router.push("/profile/edit");
            }}
          />

          <SettingsMenuItem
            icon="card-outline"
            label="Detalhes do Plano"
            onPress={() => {
              router.push("/profile/plan");
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
              if (__DEV__) console.log("Notificações");
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
              router.push("/about" as any);
            }}
            rightElement={<Text style={styles.versionText}>v1.0.0</Text>}
          />

          {/* <SettingsMenuItem
            icon="document-text-outline"
            label="Termos de Uso"
            onPress={() => {
              handleOpenLink("https://exemplo.com/termos");
            }}
          /> */}

          {/* <SettingsMenuItem
          icon="shield-checkmark-outline"
          label="Política de Privacidade"
          onPress={() => {
            handleOpenLink("https://exemplo.com/privacidade");
          }}
        /> */}
        </View>

        {/* Help Section */}
        {/* <View style={styles.section}>
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
        </View> */}

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  contentContainer: {
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
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  planCardLeft: {
    flex: 1,
    gap: Spacing.xs,
  },
  planBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.dark.primaryGlow,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  planBadgePremium: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    borderColor: Colors.dark.success,
  },
  planBadgeText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.xs,
    color: Colors.dark.primary,
  },
  planBadgeTextPremium: {
    color: Colors.dark.success,
  },
  planCardHint: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
  premiumManagement: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  managementButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    minHeight: 48,
  },
  managementButtonText: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.primary,
  },
});
