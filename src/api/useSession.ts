import { useState, useEffect } from 'react';
import { supabase } from './useClient';
import { Session } from '@supabase/supabase-js';

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return session;
};

export const useUser = (): any | null => {
  const session = useSession();
  return session?.user || null;
};

export const useUserId = (): string | null => {
  const session = useSession();
  return session?.user?.id || null;
};

export default useUserId;