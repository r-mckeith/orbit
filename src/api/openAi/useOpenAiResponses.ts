import { useQuery } from '@tanstack/react-query';
import { supabase } from '../useClient';

export function useOpenAIResponses() {
  const getResponses = async () => {
    const { data, error } = await supabase
      .from('open_api')
      .select('*')
      .order('created', { ascending: false })
      .limit(1);

    if (error) {
      console.error(error);
      throw new Error(error.message);
    }

    return data ?? [];
  };

  return useQuery({
    queryKey: ['openaiResponses'],
    queryFn: getResponses,
    refetchInterval: (data) => (data && data.length > 0 ? false : 5000),
    retry: false,
  });
}