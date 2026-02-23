import React from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Colors } from "@/constants/theme";

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
}

export function CircularProgress({
  progress,
  size = 56,
  strokeWidth = 4,
  color = Colors.dark.primary,
  children,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference * (1 - clampedProgress);

  return (
    <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: "-90deg" }], position: "absolute" }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.dark.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      {children}
    </View>
  );
}
