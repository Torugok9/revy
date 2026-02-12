import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface AuthInputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  editable?: boolean;
  error?: boolean;
  testID?: string;
}

export function AuthInput({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  editable = true,
  error = false,
  testID,
}: AuthInputProps) {
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "card");
  const tintColor = useThemeColor({}, "tint");
  const errorColor = "#ef4444";
  const subtitleColor = useThemeColor({}, "subtitle");

  const focusAnim = useSharedValue(0);

  const handleFocus = () => {
    if (!editable) return;
    focusAnim.value = withTiming(1, { duration: 200 });
  };

  const handleBlur = () => {
    focusAnim.value = withTiming(0, { duration: 200 });
  };

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: focusAnim.value * 0.5,
      transform: [{ scale: 1 + focusAnim.value * 0.02 }],
    };
  });

  const borderStyle = useAnimatedStyle(() => {
    return {
      borderColor: error
        ? errorColor
        : interpolateColor(focusAnim.value, [0, 1], ["#333333", tintColor]),
      shadowColor: tintColor,
      shadowOpacity: focusAnim.value * 0.4,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 0 },
    };
  });

  return (
    <View style={styles.outerContainer}>
      {label && (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
      <View style={styles.container}>
        <Animated.View
          style={[styles.glow, glowStyle, { borderColor: tintColor }]}
        />
        <Animated.View
          style={[styles.inputWrapper, borderStyle, { backgroundColor }]}
        >
          <TextInput
            style={[
              styles.input,
              { color: textColor },
              !editable && { opacity: 0.6 },
            ]}
            placeholder={placeholder}
            placeholderTextColor={subtitleColor}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            editable={editable}
            onFocus={handleFocus}
            onBlur={handleBlur}
            testID={testID}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    gap: 8,
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  container: {
    position: "relative",
    height: 56,
  },
  glow: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderWidth: 2,
    borderRadius: 14,
    zIndex: -1,
  },
  inputWrapper: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  input: {
    fontSize: 16,
    fontWeight: "500",
    height: "100%",
  },
});
