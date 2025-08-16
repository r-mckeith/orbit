import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

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

const supabaseUrl = 'https://qzdyqatdnyqlavwjofwl.supabase.co';
const SUPABASE_API_KEY = Constants.expoConfig?.extra?.supabaseApiKey || null;

export const supabase = createClient(supabaseUrl, SUPABASE_API_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
