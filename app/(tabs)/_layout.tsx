import React from "react";

import { Tabs } from "expo-router";
// eslint-disable-next-line import/no-unresolved
import { HapticTab } from "@/components/haptic-tab";
// eslint-disable-next-line import/no-unresolved
import { IconSymbol } from "@/components/ui/icon-symbol";
// eslint-disable-next-line import/no-unresolved
import { Colors } from "@/constants/theme";
// eslint-disable-next-line import/no-unresolved
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Veículos",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="car.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Configurações",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="gearshape.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
