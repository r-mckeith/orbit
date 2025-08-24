// lib/supabase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';
// If you really want SecureStore on native, you can swap it in below.
// import * as SecureStore from 'expo-secure-store';

const supabaseUrl = 'https://ditfloepmylydershdus.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpdGZsb2VwbXlseWRlcnNoZHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzODg5ODQsImV4cCI6MjA3MDk2NDk4NH0.vn27-wqNDoDVXyFsDv0-DaQPdMxaleNJcCGbTJj-m6U';

// Cross-platform storage adapter that DOES NOT alter values
type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const makeStorage = (): StorageAdapter => {
  if (Platform.OS === 'web') {
    // Use localStorage on web
    // Guard for SSR just in case
    const ls = typeof window !== 'undefined' ? window.localStorage : undefined;

    return {
      async getItem(key) {
        return ls ? ls.getItem(key) : null;
      },
      async setItem(key, value) {
        if (ls) ls.setItem(key, value);
      },
      async removeItem(key) {
        if (ls) ls.removeItem(key);
      },
    };
  }

  // Native: use AsyncStorage (recommended by Supabase for RN)
  // If you prefer SecureStore, swap these three lines to SecureStore.*Async
  return {
    getItem: (key) => AsyncStorage.getItem(key),
    setItem: (key, value) => AsyncStorage.setItem(key, value),
    removeItem: (key) => AsyncStorage.removeItem(key),
  };

  // SecureStore variant (optional):
  // return {
  //   getItem: (key) => SecureStore.getItemAsync(key),
  //   setItem: (key, value) => SecureStore.setItemAsync(key, value),
  //   removeItem: (key) => SecureStore.deleteItemAsync(key),
  // };
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: makeStorage(),
    autoRefreshToken: true,
    persistSession: true,
    // On web, allow Supabase to parse OAuth redirects (?code=...); on native, you typically use deep links
    detectSessionInUrl: Platform.OS === 'web',
    // Optional: explicitly set PKCE if you use OAuth
    // flowType: 'pkce',
  },
});