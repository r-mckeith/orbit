import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../useClient';
import { GratitudeList } from './useGetGratitudeLists';

async function deleteGratitudeList(listId: number): Promise<void> {
  const { error } = await supabase.from('gratitude').delete().eq('id', listId);
  if (error) throw new Error(error.message);
}

export function useDeleteGratitudeList() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number, { previousLists: GratitudeList[] }>(
    async (listId) => {
      await deleteGratitudeList(listId);
    },
    {
      onMutate: async (listId) => {
        const queryKey = ['gratitude', listId];

        await queryClient.cancelQueries(queryKey);
        const previousLists = queryClient.getQueryData<GratitudeList[]>(queryKey) ?? [];

        queryClient.setQueryData(queryKey, previousLists.filter((list) => list.id !== listId));

        return { previousLists };
      },

      onError: (_, __, context) => {
        if (context?.previousLists) {
          queryClient.setQueryData(['gratitude'], context.previousLists);
        }
      },

      onSettled: () => {
        queryClient.invalidateQueries(['gratitude']);
      },
    }
  );
}