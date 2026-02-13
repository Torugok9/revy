import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { Vehicle } from "@/types/vehicle";
import { Colors, Fonts, Spacing, BorderRadius } from "@/constants/theme";
import { IconSymbol } from "@/components/ui/icon-symbol";

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
        {/* Vehicle Image Area */}
        <View style={styles.imageContainer}>
          {vehicle.photo_url ? (
            <Image
              source={{ uri: vehicle.photo_url }}
              style={styles.image}
              contentFit="contain"
            />
          ) : (
            <View style={styles.iconPlaceholder}>
              <IconSymbol
                name="car.fill"
                size={56}
                color={Colors.dark.textSecondary}
              />
            </View>
          )}
        </View>

        {/* Vehicle Info */}
        <View style={styles.infoContainer}>
          {/* Left Column */}
          <View style={styles.leftColumn}>
            <Text style={styles.brandModel}>
              {vehicle.brand} {vehicle.model}
            </Text>
            <Text style={styles.details}>
              {vehicle.year} • {vehicle.plate.toUpperCase()}
            </Text>
          </View>

          {/* Right Column */}
          <View style={styles.rightColumn}>
            <Text style={styles.kmValue}>{kmText}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: BorderRadius["2xl"],
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: Colors.dark.borderStrong,
  },
  imageContainer: {
    width: "100%",
    height: 190,
    backgroundColor: Colors.dark.background,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  iconPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    flexDirection: "row",
    padding: Spacing.lg,
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: Spacing.lg,
  },
  leftColumn: {
    flex: 1,
    gap: Spacing.xs,
  },
  rightColumn: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  brandModel: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
    lineHeight: Fonts.lineHeight.tight * Fonts.size.lg,
  },
  details: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: "#9CA3AF",
  },
  kmValue: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.primary,
  },
});
