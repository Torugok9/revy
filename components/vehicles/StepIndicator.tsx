import { Colors, Fonts, Spacing } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabel?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepLabel,
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.container}>
      {/* Step Counter */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {currentStep} de {totalSteps}
        </Text>
        {stepLabel && <Text style={styles.labelText}>{stepLabel}</Text>}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${progress}%`,
            },
          ]}
        />
      </View>

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index < currentStep && styles.dotFilled,
              index === currentStep - 1 && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  counterText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
  labelText: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: Colors.dark.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.dark.primary,
    borderRadius: 2,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.border,
  },
  dotFilled: {
    backgroundColor: Colors.dark.primary,
  },
  dotActive: {
    backgroundColor: Colors.dark.primaryLight,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
