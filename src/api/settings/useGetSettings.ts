import { useQuery } from '@tanstack/react-query';
import { supabase } from '../useClient';
import { UserSetting } from '../../types';

async function getSettings(): Promise<UserSetting[]> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return data ?? [];
}

export function useGetSettings() {
  return useQuery<UserSetting[]>({
    queryKey: ['settings',],
    queryFn: getSettings,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });
}