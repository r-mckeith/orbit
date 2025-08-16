import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../useClient';
import { HabitWithData } from '../../types';

async function deleteHabit(habitId: number) {
  const { error } = await supabase.from('habits').delete().eq('id', habitId);
  if (error) throw new Error(error.message);
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  const queryKey = ['weeklyHabitsWithData'];

  return useMutation<void, Error, number, { previousHabits: HabitWithData[] | undefined }>(
    async habitId => {
      await deleteHabit(habitId);
    },
    {
      onMutate: async habitId => {
        await queryClient.cancelQueries(queryKey);

        const previousHabits = queryClient.getQueryData<HabitWithData[]>(queryKey);

        queryClient.setQueryData<HabitWithData[]>(queryKey, (oldHabits = []) =>
          oldHabits.filter(habit => habit.id !== habitId)
        );

        return { previousHabits };
      },

      onError: (_, __, context) => {
        if (context?.previousHabits) {
          queryClient.setQueryData(queryKey, context.previousHabits);
        }
      },

      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['habitsWithData'] });
      },
    }
  );
}
