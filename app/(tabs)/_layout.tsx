// app/(tabs)/_layout.tsx
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import useColorScheme from '@/hooks/useColorScheme';
import { Database, Target } from '@tamagui/lucide-icons';

export default function TabsLayout() {
  const { session, loading } = useAuth();

  // Block rendering until we know auth state
  if (loading) return null;
  if (!session) return <Redirect href='/(auth)' />;

  const colorScheme = Platform.OS === 'web' ? 'dark' : useColorScheme() ?? 'light';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },
          android: {},
          web: { display: 'none' },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name='index'
        options={{
          title: 'Circles',
          tabBarIcon: ({ color }) => <Target size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name='habitData'
        options={{
          title: 'Data',
          tabBarIcon: ({ color }) => <Database size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
