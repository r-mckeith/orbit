// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import { TamaguiProvider } from 'tamagui';

import { AuthProvider, useAuth } from '../contexts/AuthContext';
import useColorScheme from '../hooks/useColorScheme';
import config from '../tamagui.config';

const queryClient = new QueryClient();

const useAppColorScheme = (): 'light' | 'dark' => {
  return Platform.OS === 'web' ? 'dark' : useColorScheme() || 'dark';
};

function RootLayoutNav() {
  const { loading } = useAuth();

  if (loading) return null;

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useAppColorScheme();
  const [loaded] = useFonts({ SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf') });

  if (!loaded) return null; // add SplashScreen-handoff

  const theme = colorScheme || 'light';

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={config} defaultTheme={theme}>
        <NavigationThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthProvider>
            <RootLayoutNav />
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
          </AuthProvider>
        </NavigationThemeProvider>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}