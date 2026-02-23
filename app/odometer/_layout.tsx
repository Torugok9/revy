import { Stack } from "expo-router";

export default function OdometerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "modal",
      }}
    />
  );
}
