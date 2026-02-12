import { Colors, Fonts, Spacing } from "@/constants/theme";
import { useUserInfo } from "@/hooks/useUserInfo";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const UserProfileCard: React.FC = () => {
  const { displayName, displayEmail, planName, planIcon } = useUserInfo();

  return (
    <View style={styles.container}>
      {/* Avatar Circle */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {displayName
              .split(" ")
              .map((part) => part[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </Text>
        </View>
      </View>

      {/* User Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{displayEmail}</Text>

        {/* Plan Badge */}
        <View style={styles.planBadge}>
          <Text style={styles.planIcon}>{planIcon}</Text>
          <Text style={styles.planText}>Plano {planName}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 14,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.dark.borderStrong,
    // Glow effect sutil com Guards Red
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarContainer: {
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.dark.primaryLight,
  },
  avatarText: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size["3xl"],
    color: Colors.dark.text,
  },
  infoContainer: {
    alignItems: "center",
    width: "100%",
  },
  name: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  email: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.lg,
  },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.primaryGlow,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  planIcon: {
    fontSize: Fonts.size.lg,
    marginRight: Spacing.sm,
  },
  planText: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.primary,
  },
});
