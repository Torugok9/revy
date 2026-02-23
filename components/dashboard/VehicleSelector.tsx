import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { Vehicle } from "@/types/vehicle";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface VehicleSelectorProps {
  vehicle: Vehicle | null;
  onPress: () => void;
}

export function VehicleSelector({ vehicle, onPress }: VehicleSelectorProps) {
  if (!vehicle) return null;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.selector,
          pressed && styles.selectorPressed,
        ]}
      >
        <View style={styles.imageContainer}>
          {vehicle.photo_url ? (
            <Image
              source={{ uri: vehicle.photo_url }}
              style={styles.image}
              contentFit="cover"
            />
          ) : (
            <Ionicons
              name="car-sport"
              size={20}
              color={Colors.dark.textSecondary}
            />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>SELECIONADO</Text>
          <Text style={styles.vehicleName} numberOfLines={1}>
            {vehicle.model}
          </Text>
        </View>
        <Ionicons
          name="chevron-down"
          size={18}
          color={Colors.dark.textSecondary}
        />
      </Pressable>

      <Pressable style={styles.notificationButton}>
        <Ionicons
          name="notifications-outline"
          size={22}
          color={Colors.dark.text}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  selectorPressed: {
    opacity: 0.7,
  },
  imageContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.surface,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: 32,
    height: 32,
  },
  textContainer: {
    gap: 2,
  },
  label: {
    fontFamily: Fonts.family.medium,
    fontSize: 9,
    color: Colors.dark.textSecondary,
    letterSpacing: 0.5,
  },
  vehicleName: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.sm,
    color: Colors.dark.text,
    maxWidth: 160,
  },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.dark.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
  },
});
