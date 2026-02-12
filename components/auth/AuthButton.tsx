import { BorderRadius, Fonts } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface AuthButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "pill";
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AuthButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
  testID,
}: AuthButtonProps) {
  const primary = useThemeColor({}, "primary");
  const primaryDark = useThemeColor({}, "primaryDark");
  const surface = useThemeColor({}, "surface");
  const text = useThemeColor({}, "text");

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const isPill = variant === "pill";
  const isSecondary = variant === "secondary";

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator color={isSecondary ? primary : text} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            { color: text },
            isSecondary && ({ color: primary, fontWeight: "700" } as TextStyle),
            isPill &&
              ({
                fontSize: Fonts.size.sm,
                fontWeight: "700",
                color: text,
              } as TextStyle),
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </>
  );

  const buttonStyles = [
    styles.button,
    { backgroundColor: isSecondary ? surface : "transparent" },
    isPill && styles.pillButton,
    isSecondary && styles.secondaryButton,
    disabled && { opacity: 0.6 },
    animatedStyle,
    style,
  ] as StyleProp<ViewStyle>;

  if (isSecondary) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={buttonStyles}
        testID={testID}
      >
        {renderContent()}
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={buttonStyles}
      testID={testID}
    >
      <LinearGradient
        colors={[primary, primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          StyleSheet.absoluteFill,
          isPill
            ? { borderRadius: BorderRadius.full }
            : { borderRadius: BorderRadius.lg },
        ]}
      />
      {renderContent()}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    overflow: "hidden",
    width: "100%",
  },
  secondaryButton: {
    borderWidth: 0,
  },
  pillButton: {
    height: 32,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.full,
    marginTop: 0,
    width: "auto",
  },
  text: {
    fontSize: Fonts.size.md,
    fontFamily: Fonts.family.semibold,
    letterSpacing: 0.3,
  },
});
