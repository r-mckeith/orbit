import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../useClient';

type GratitudeListPayload = {
  id?: number;
  items: string[];
};

export function useAddOrUpdateGratitudeList(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: GratitudeListPayload) => {
      const { id, items } = payload;

      if (id) {
        const { data, error } = await supabase.from('gratitude').update({ items }).eq('id', id).select().single();

        if (error) throw new Error('Failed to update gratitude list');
        return data;
      }
      const { data, error } = await supabase
        .from('gratitude')
        .insert([{ items: items }])
        .select()

      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(error.message);
      }
      return data;
    },

    onMutate: async newGratitude => {
      const queryKey = ['gratitude'];
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, newGratitude);
      return { previous, queryKey };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },

    onSuccess: (_data, _vars, _context) => {
      options?.onSuccess?.(); // call it safely
    },

    onSettled: (_data, _err, _vars, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries(context.queryKey);
      }
    },
  });
}
