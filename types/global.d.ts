// This file contains type declarations for modules that don't have their own type definitions
declare module 'expo-secure-store' {
  export function getItemAsync(key: string): Promise<string | null>;
  export function setItemAsync(key: string, value: string): Promise<void>;
  export function deleteItemAsync(key: string): Promise<void>;
}

// Add type declarations for @/ imports
declare module '@/lib/supabase' {
  import { SupabaseClient } from '@supabase/supabase-js';
  export const supabase: SupabaseClient;
}

declare module '@/contexts/AuthContext' {
  import { Session } from '@supabase/supabase-js';
  
  export const AuthProvider: React.FC<{ children: React.ReactNode }>;
  export const useAuth: () => {
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
    signUp: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
    signOut: () => Promise<void>;
  };
}

declare module '@/hooks/useColorScheme' {
  export default function useColorScheme(): 'light' | 'dark' | null;
}
