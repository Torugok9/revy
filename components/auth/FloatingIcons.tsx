import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export function FloatingIcons() {
  const bobbing1 = useSharedValue(0);
  const bobbing2 = useSharedValue(0);
  const bobbing3 = useSharedValue(0);

  useEffect(() => {
    const animation = (val: SharedValue<number>, delay: number) => {
      val.value = withRepeat(
        withSequence(
          withTiming(-15, {
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    };

    animation(bobbing1, 0);
    setTimeout(() => animation(bobbing2, 0), 500);
    setTimeout(() => animation(bobbing3, 0), 1000);
  }, [bobbing1, bobbing2, bobbing3]);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: bobbing1.value }],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: bobbing2.value }],
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [{ translateY: bobbing3.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.iconsRow}>
        <Animated.View style={[styles.iconWrapper, animatedStyle1]}>
          <MaterialCommunityIcons name="motorbike" size={40} color="#A0A0A0" />
        </Animated.View>

        <Animated.View
          style={[styles.iconWrapper, styles.centerIcon, animatedStyle2]}
        >
          <Ionicons name="car-sport" size={80} color="#FFFFFF" />
        </Animated.View>

        <Animated.View style={[styles.iconWrapper, animatedStyle3]}>
          <Ionicons name="construct" size={40} color="#A0A0A0" />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerIcon: {
    zIndex: 1,
  },
  fabContainer: {
    position: "absolute",
    top: "50%",
    marginTop: -28,
    zIndex: 10,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00E5FF",
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
});
