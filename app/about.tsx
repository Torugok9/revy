import { DeleteAccountButton } from "@/components/settings/DeleteAccountButton";
import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const APP_VERSION =
  Constants.expoConfig?.version ?? Constants.manifest?.version ?? "1.0.0";

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.headerButtonPressed,
          ]}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.dark.text} />
        </Pressable>

        <Text style={styles.headerTitle}>Sobre o App</Text>

        <View style={styles.headerButton} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* App Info */}
        <View style={styles.appInfoSection}>
          <View style={styles.appIcon}>
            <Ionicons name="car-sport" size={40} color={Colors.dark.primary} />
          </View>
          <Text style={styles.appName}>Revvy</Text>
          <Text style={styles.appVersion}>Versão {APP_VERSION}</Text>
          <Text style={styles.appDescription}>
            Gerencie seus veículos com inteligência
          </Text>
        </View>

        {/* Links */}
        <View style={styles.linksSection}>
          <Pressable
            onPress={() =>
              Linking.openURL("https://torugok9.github.io/revy/terms.html")
            }
            style={({ pressed }) => [
              styles.linkItem,
              pressed && styles.linkItemPressed,
            ]}
          >
            <Ionicons
              name="document-text-outline"
              size={20}
              color={Colors.dark.textSecondary}
            />
            <Text style={styles.linkText}>Termos de Uso</Text>
            <Ionicons
              name="open-outline"
              size={16}
              color={Colors.dark.textMuted}
              style={styles.linkIcon}
            />
          </Pressable>

          <Pressable
            onPress={() => Linking.openURL("mailto:comercial@beecodeit.com")}
            style={({ pressed }) => [
              styles.linkItem,
              pressed && styles.linkItemPressed,
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={Colors.dark.textSecondary}
            />
            <Text style={styles.linkText}>Contate-nos</Text>
            <Ionicons
              name="open-outline"
              size={16}
              color={Colors.dark.textMuted}
              style={styles.linkIcon}
            />
          </Pressable>
        </View>

        {/* Danger Zone — Delete Account */}
        <View style={styles.dangerSection}>
          <Text style={styles.dangerSectionTitle}>Zona de Perigo</Text>
          <Text style={styles.dangerSectionSubtitle}>
            Ao excluir sua conta, todos os dados serão apagados permanentemente.
          </Text>
          <DeleteAccountButton />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Desenvolvido por BeecodeIT</Text>
          <Text style={styles.footerText}>CNPJ: 50.025.597/0001-05</Text>
        </View>
      </ScrollView>
    </View>
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
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerButtonPressed: {
    opacity: 0.7,
  },
  headerTitle: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
    flex: 1,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  appInfoSection: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.dark.primaryGlow,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  appName: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size["2xl"],
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  appVersion: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
  },
  appDescription: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textMuted,
  },
  linksSection: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: "hidden",
    marginBottom: Spacing["3xl"],
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    gap: Spacing.md,
  },
  linkItemPressed: {
    backgroundColor: Colors.dark.primaryGlow,
  },
  linkText: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
    flex: 1,
  },
  linkIcon: {
    marginLeft: "auto",
  },
  dangerSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  dangerSectionTitle: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.danger,
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dangerSectionSubtitle: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.lg,
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
    gap: Spacing.xs,
  },
  footerText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.xs,
    color: Colors.dark.textMuted,
    textAlign: "center",
  },
});
