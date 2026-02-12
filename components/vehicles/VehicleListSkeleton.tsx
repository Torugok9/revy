import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Animated,
  Easing,
} from "react-native";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface VehicleListSkeletonProps {
  itemCount?: number;
}

function SkeletonCard() {
  const fadeAnim = React.useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.line1} />
      <View style={styles.line2} />
      <View style={styles.line3} />
    </Animated.View>
  );
}

export function VehicleListSkeleton({
  itemCount = 3,
}: VehicleListSkeletonProps) {
  const items = Array.from({ length: itemCount }, (_, index) => ({
    id: `skeleton-${index}`,
  }));

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={() => <SkeletonCard />}
      scrollEnabled={false}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.lg,
  },
  skeleton: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: Spacing.md,
  },
  line1: {
    height: 20,
    backgroundColor: Colors.dark.border,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  line2: {
    height: 14,
    backgroundColor: Colors.dark.border,
    borderRadius: BorderRadius.sm,
    width: "70%",
    marginBottom: Spacing.sm,
  },
  line3: {
    height: 14,
    backgroundColor: Colors.dark.border,
    borderRadius: BorderRadius.sm,
    width: "50%",
  },
});
