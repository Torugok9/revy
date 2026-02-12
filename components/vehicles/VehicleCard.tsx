import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
} from "react-native";
import { Vehicle } from "@/types/vehicle";
import { Colors, Fonts, Spacing, BorderRadius } from "@/constants/theme";

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: (vehicleId: string) => void;
}

export function VehicleCard({ vehicle, onPress }: VehicleCardProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
  };

  const kmValue = vehicle.current_km
    ? vehicle.current_km.toLocaleString("pt-BR")
    : "Km não informado";

  const kmText =
    vehicle.current_km !== null && vehicle.current_km !== undefined
      ? `${kmValue} km`
      : kmValue;

  return (
    <Animated.View style={[animatedStyle]}>
      <Pressable
        onPress={() => onPress(vehicle.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Brand and Model */}
          <Text style={styles.brandModel}>
            {vehicle.brand} {vehicle.model}
          </Text>

          {/* Year and Plate */}
          <View style={styles.row}>
            <Text style={styles.year}>{vehicle.year}</Text>
            <Text style={styles.plate}>{vehicle.plate.toUpperCase()}</Text>
          </View>

          {/* KM */}
          <Text
            style={[
              styles.km,
              vehicle.current_km === null ||
              vehicle.current_km === undefined
                ? styles.kmEmpty
                : styles.kmValue,
            ]}
          >
            {kmText}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  content: {
    gap: Spacing.md,
  },
  brandModel: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
    lineHeight: Fonts.lineHeight.tight * Fonts.size.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  year: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
  plate: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.xs,
    color: Colors.dark.textSecondary,
    letterSpacing: 1,
  },
  km: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.base,
  },
  kmValue: {
    color: Colors.dark.primary,
  },
  kmEmpty: {
    color: Colors.dark.textMuted,
  },
});
