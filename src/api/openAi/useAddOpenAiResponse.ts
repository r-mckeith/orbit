import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../useClient';

export function useAddOpenAIResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ response, date }: { response: string; date: Date }) => {
      const { data, error } = await supabase
        .from('open_api')
        .insert({ response, date })
        .select()
        .single();

      if (error) {
        console.error(error);
        throw new Error('Failed to add OpenAI response');
      }

      if (!data) {
        throw new Error('No data returned after insert operation');
      }

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries(['openaiResponses']);
    },
  });
}