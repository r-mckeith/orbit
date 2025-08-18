import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TamaguiProvider } from 'tamagui';
import { useEffect } from 'react';
import 'react-native-reanimated';

import useColorScheme from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import config from '../tamagui.config';

// This component wraps our app with the AuthProvider
function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (session && inAuthGroup) {
      // User is signed in and the initial segment is in the (auth) group.
      router.replace('/(tabs)');
    } else if (!session && !inAuthGroup) {
      // User is not signed in and the initial segment is not in the (auth) group.
      router.replace('/(auth)');
    }
  }, [session, loading, segments]);

  if (loading) {
    return null; // or a loading indicator
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  // Ensure colorScheme is not null by providing a default value
  const theme = colorScheme || 'light';
  
  return (
    <TamaguiProvider config={config} defaultTheme={theme}>
      <NavigationThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <RootLayoutNav />
          <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        </AuthProvider>
      </NavigationThemeProvider>
    </TamaguiProvider>
  );
}
