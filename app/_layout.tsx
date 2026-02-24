import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as Font from "expo-font";
import * as Linking from "expo-linking";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import "react-native-reanimated";

import { AuthProvider, useAuthContext } from "@/contexts/AuthContext";
import { FeaturesProvider, useFeaturesContext } from "@/contexts/FeaturesContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const { refetch } = useFeaturesContext();

  // Deep link handler for Stripe checkout return
  useEffect(() => {
    const subscription = Linking.addEventListener("url", ({ url }) => {
      if (url.includes("checkout/success")) {
        // Wait for webhook processing, then refresh features
        setTimeout(async () => {
          await refetch();
          Alert.alert(
            "Bem-vindo ao Pro!",
            "Seu pagamento foi confirmado. Aproveite todos os recursos premium!"
          );
          router.replace("/(tabs)");
        }, 2000);
      }
      // checkout/cancel — just return, no action needed
    });

    return () => subscription.remove();
  }, [refetch, router]);

  useEffect(() => {
    const isAuthGroup = segments[0] === "auth";

    // Se está carregando, não fazer nada
    if (authLoading) {
      return;
    }

    // Se não tem usuário e não está na tela de auth, redirecionar para auth
    if (!user && !isAuthGroup) {
      router.replace("/auth");
    }

    // Se tem usuário e está na tela de auth, redirecionar para home
    if (user && isAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, segments, authLoading, router]);

  if (authLoading) {
    return null; // Ou um splash screen
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="vehicle" options={{ headerShown: false }} />
        <Stack.Screen name="maintenance" options={{ headerShown: false }} />
        <Stack.Screen name="odometer" options={{ headerShown: false }} />
        <Stack.Screen name="fuel" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="plans" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          DMSans_400Regular,
          DMSans_500Medium,
          DMSans_600SemiBold,
          DMSans_700Bold,
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setFontsLoaded(true);
        SplashScreen.hideAsync();
      }
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <FeaturesProvider>
        <RootLayoutNav />
      </FeaturesProvider>
    </AuthProvider>
  );
}
