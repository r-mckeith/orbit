import { useQuery } from '@tanstack/react-query';
import { supabase } from '../useClient';
import { UserProfile } from '../../types';

async function getProfile(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return data ?? [];
}

export function useGetProfile() {
  return useQuery<UserProfile[]>({
    queryKey: ['profile',],
    queryFn: getProfile,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });
}