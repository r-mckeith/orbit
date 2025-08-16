import { useQuery } from '@tanstack/react-query';
import { supabase } from '../useClient';

export type GratitudeList = {
  id: number;
  items: string[]
  created: Date;
}

async function getGratitudeLists(): Promise<GratitudeList[]> {
  const { data, error } = await supabase
    .from('gratitude')
    .select('*')
    .order('created', { ascending: false });

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return data ?? [];
}

export function useGetGratitudeLists() {
  return useQuery<GratitudeList[]>({
    queryKey: ['gratitude',],
    queryFn: getGratitudeLists,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });
}