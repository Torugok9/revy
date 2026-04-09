import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutChangeEvent, Platform, Pressable, StyleSheet, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type RouteLayout = {
  x: number;
  width: number;
};

type RouteItem = BottomTabBarProps["state"]["routes"][number];

type TabItemProps = {
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
  color: string;
  label: string;
  icon: React.ReactNode;
};

const INDICATOR_WIDTH = 38;

function resolveLabel(options: BottomTabBarProps["descriptors"][string]["options"], routeName: string) {
  if (typeof options.tabBarLabel === "string") {
    return options.tabBarLabel;
  }

  if (typeof options.title === "string") {
    return options.title;
  }

  return routeName;
}

function TabItem({
  isFocused,
  onPress,
  onLongPress,
  onLayout,
  color,
  label,
  icon,
}: TabItemProps) {
  const focusProgress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    focusProgress.value = withTiming(isFocused ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [focusProgress, isFocused]);

  const iconContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.95 + focusProgress.value * 0.1 }],
    opacity: 0.7 + focusProgress.value * 0.3,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: 0.75 + focusProgress.value * 0.25,
    transform: [{ translateY: (1 - focusProgress.value) * 2 }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      onLayout={onLayout}
      onLongPress={onLongPress}
      onPress={onPress}
      onPressIn={() => {
        if (Platform.OS === "ios") {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }}
      style={styles.sidePressable}
    >
      <Animated.View style={[styles.iconContainer, iconContainerStyle]}>{icon}</Animated.View>
      <Animated.Text style={[styles.sideLabel, { color }, labelStyle]} numberOfLines={1}>
        {label}
      </Animated.Text>
    </Pressable>
  );
}

function CenterChatButton() {
  const router = useRouter();
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [glowOpacity]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Pressable
      onPress={() => {
        if (Platform.OS === "ios") {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        router.push("/chat");
      }}
      style={styles.centerPressable}
    >
      <Animated.View style={[styles.centerGlow, glowStyle]} />
      <View style={styles.centerButton}>
        <Ionicons name="chatbubble-ellipses" size={22} color="#FFFFFF" />
      </View>
      <Animated.Text style={[styles.sideLabel, { color: Colors.dark.primary }]} numberOfLines={1}>
        Revy I.A.
      </Animated.Text>
    </Pressable>
  );
}

export function FloatingTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];

  const routeIndexMap = useMemo(() => Object.fromEntries(state.routes.map((route, index) => [route.key, index])), [state.routes]);
  const [routeLayouts, setRouteLayouts] = useState<Record<string, RouteLayout>>({});
  const activeRoute = state.routes[state.index];
  const activeRouteLayout = routeLayouts[activeRoute.key];

  const indicatorX = useSharedValue(0);
  const indicatorOpacity = useSharedValue(activeRouteLayout ? 1 : 0);

  useEffect(() => {
    indicatorOpacity.value = withTiming(activeRouteLayout ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
  }, [activeRouteLayout, indicatorOpacity]);

  useEffect(() => {
    if (!activeRouteLayout) {
      return;
    }

    indicatorX.value = withTiming(activeRouteLayout.x + (activeRouteLayout.width - INDICATOR_WIDTH) / 2, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [activeRouteLayout, indicatorX]);

  const updateLayout = useCallback((routeKey: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setRouteLayouts((prev) => {
      const oldLayout = prev[routeKey];
      if (oldLayout && oldLayout.x === x && oldLayout.width === width) {
        return prev;
      }

      return { ...prev, [routeKey]: { x, width } };
    });
  }, []);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
    transform: [{ translateX: indicatorX.value }],
  }));

  const renderRouteIcon = useCallback(
    (route: RouteItem, isFocused: boolean) => {
      const options = descriptors[route.key].options;
      const iconColor = isFocused ? palette.tabIconSelected : palette.tabIconDefault;
      if (!options.tabBarIcon) {
        return null;
      }

      return options.tabBarIcon({
        focused: isFocused,
        color: iconColor,
        size: 24,
      });
    },
    [descriptors, palette.tabIconDefault, palette.tabIconSelected]
  );

  const handlePress = useCallback(
    (route: RouteItem, isFocused: boolean) => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    },
    [navigation]
  );

  const handleLongPress = useCallback(
    (route: RouteItem) => {
      navigation.emit({
        type: "tabLongPress",
        target: route.key,
      });
    },
    [navigation]
  );

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: Math.max(insets.bottom, Spacing.sm) + 2,
        },
      ]}
    >
      <View style={styles.shell}>
        {Platform.OS === "ios" ? (
          <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFillObject} />
        ) : null}
        <View
          style={[
            StyleSheet.absoluteFillObject,
            styles.shellOverlay,
            {
              backgroundColor: "rgba(10,10,10,0.9)",
              borderColor: palette.border,
            },
          ]}
        />

        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            {
              backgroundColor: palette.primaryGlow,
            },
            indicatorStyle,
          ]}
        />

        <View style={styles.sideRow}>
          {state.routes.map((route, index) => {
            const options = descriptors[route.key].options;
            const isFocused = state.index === routeIndexMap[route.key];
            const color = isFocused ? palette.tabIconSelected : palette.tabIconDefault;
            const midpoint = Math.floor(state.routes.length / 2);

            return (
              <React.Fragment key={route.key}>
                {index === midpoint && <CenterChatButton />}
                <TabItem
                  color={color}
                  icon={renderRouteIcon(route, isFocused)}
                  isFocused={isFocused}
                  label={resolveLabel(options, route.name)}
                  onLayout={(event) => updateLayout(route.key, event)}
                  onLongPress={() => handleLongPress(route)}
                  onPress={() => handlePress(route, isFocused)}
                />
              </React.Fragment>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    backgroundColor: "transparent",
  },
  shell: {
    height: 86,
    borderRadius: BorderRadius.full,
    overflow: "visible",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 16,
  },
  shellOverlay: {
    borderWidth: 1,
    borderRadius: BorderRadius.full,
  },
  sideRow: {
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
    paddingHorizontal: Spacing.sm,
    justifyContent: "space-evenly",
  },
  sidePressable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 1,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  sideLabel: {
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.family.semibold,
    letterSpacing: 0.2,
  },
  indicator: {
    position: "absolute",
    bottom: 10,
    width: INDICATOR_WIDTH,
    height: 4,
    borderRadius: BorderRadius.full,
  },
  centerPressable: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 2,
  },
  centerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  centerGlow: {
    ...StyleSheet.absoluteFillObject,
    top: 2,
    left: -4,
    right: -4,
    bottom: 14,
    borderRadius: 26,
    backgroundColor: Colors.dark.primaryGlow,
  },
});
