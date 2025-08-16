import { useMutation, useQueryClient } from '@tanstack/react-query';
import { HabitWithData } from '../../types';
import { supabase } from '../useClient';

async function deleteHabit(habitId: number) {
  const { error } = await supabase.from('habits').delete().eq('id', habitId);
  if (error) throw new Error(error.message);
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  const queryKey = ['weeklyHabitsWithData'] as const;

  return useMutation({
    mutationFn: async (habitId: number) => {
      await deleteHabit(habitId);
    },
    onMutate: async (habitId: number) => {
      await queryClient.cancelQueries({ queryKey });

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
    }
  });
}
