import React from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Animated,
  Text,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, Fonts, Spacing, BorderRadius } from "@/constants/theme";

interface RegisterNewVehicleCardProps {
  onPress: () => void;
}

export function RegisterNewVehicleCard({
  onPress,
}: RegisterNewVehicleCardProps) {
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

  return (
    <Animated.View style={[animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <IconSymbol
              name="plus"
              size={24}
              color={Colors.dark.primary}
            />
          </View>
          <Text style={styles.text}>Cadastrar Novo Veículo</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing["3xl"],
    borderWidth: 1,
    borderColor: `rgba(220, 38, 38, 0.35)`,
    borderStyle: "dashed",
    borderRadius: BorderRadius["2xl"],
    paddingVertical: Spacing["2xl"],
    paddingHorizontal: Spacing.lg,
  },
  content: {
    alignItems: "center",
    gap: Spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.dark.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
});
