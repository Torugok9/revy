import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuthContext } from '@/contexts/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();

  useEffect(() => {
    const isAuthGroup = segments[0] === 'auth';

    // Se está carregando, não fazer nada
    if (authLoading) {
      return;
    }

    // Se não tem usuário e não está na tela de auth, redirecionar para auth
    if (!user && !isAuthGroup) {
      router.replace('/auth');
    }

    // Se tem usuário e está na tela de auth, redirecionar para home
    if (user && isAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, segments, authLoading, router]);

  if (authLoading) {
    return null; // Ou um splash screen
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
