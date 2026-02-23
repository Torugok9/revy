import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

function SkeletonBox({
  width,
  height,
  borderRadius = BorderRadius.lg,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
}) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: Colors.dark.surfaceElevated,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <View style={styles.container}>
      {/* Vehicle Selector */}
      <View style={styles.selectorRow}>
        <SkeletonBox width={200} height={44} borderRadius={22} />
        <SkeletonBox width={42} height={42} borderRadius={21} />
      </View>

      {/* Health Card */}
      <View style={styles.section}>
        <SkeletonBox width="100%" height={180} borderRadius={BorderRadius["2xl"]} />
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <SkeletonBox width="48%" height={150} borderRadius={BorderRadius["2xl"]} />
        <SkeletonBox width="48%" height={150} borderRadius={BorderRadius["2xl"]} />
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <SkeletonBox width={160} height={20} />
        <View style={{ height: Spacing.lg }} />
        <SkeletonBox width="100%" height={68} borderRadius={BorderRadius.xl} />
        <View style={{ height: Spacing.sm }} />
        <SkeletonBox width="100%" height={68} borderRadius={BorderRadius.xl} />
        <View style={{ height: Spacing.sm }} />
        <SkeletonBox width="100%" height={68} borderRadius={BorderRadius.xl} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing.lg,
  },
  selectorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
});
