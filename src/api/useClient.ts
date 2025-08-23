import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';

const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value;
    } catch (error) {
      console.error(`Error getting item for key "${key}":`, error);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      const session = JSON.parse(value);

      const minimalSession = JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        user: {
          id: session.user.id,
          email: session.user.email
        },
      });
      console.log(minimalSession);

      await SecureStore.setItemAsync(key, minimalSession);
    } catch (error) {
      console.error(`Error setting item for key "${key}":`, error);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Error removing item for key "${key}":`, error);
    }
  },
};

const supabaseUrl = 'https://ditfloepmylydershdus.supabase.co';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpdGZsb2VwbXlseWRlcnNoZHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzODg5ODQsImV4cCI6MjA3MDk2NDk4NH0.vn27-wqNDoDVXyFsDv0-DaQPdMxaleNJcCGbTJj-m6U';

export const supabase = createClient(supabaseUrl, SUPABASE_API_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
