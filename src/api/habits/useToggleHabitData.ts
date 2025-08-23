import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { endOfDay, formatISO, startOfDay } from 'date-fns';
import { supabase } from '../useClient';

type ToggleResult = 
  | { action: 'deleted'; habitId: string }
  | { action: 'inserted'; habitId: string; data: any };

export type ToggleHabitDataInput = {
  habitId: string;
};

export function useToggleHabitData(): UseMutationResult<
  ToggleResult,
  Error,
  ToggleHabitDataInput
> {
  const queryClient = useQueryClient();

  return useMutation<ToggleResult, Error, ToggleHabitDataInput>({
    mutationFn: async ({ habitId }) => {
      const today = new Date();
      const todayStart = startOfDay(today).toISOString();
      const todayEnd = endOfDay(today).toISOString();

      // Rest of your existing code remains the same...
      const { data: existingEntries, error: fetchError } = await supabase
        .from('habit_data')
        .select('id')
        .eq('habit_id', habitId)
        .gte('date', todayStart)
        .lte('date', todayEnd);

      if (fetchError) {
        throw new Error('Failed to check existing habit data');
      }

      if (existingEntries && existingEntries.length > 0) {
        const { error: deleteError } = await supabase
          .from('habit_data')
          .delete()
          .eq('id', existingEntries[0].id);

        if (deleteError) {
          throw new Error('Failed to delete habit data');
        }
        return { action: 'deleted' as const, habitId };
      } else {
        const { data, error: insertError } = await supabase
          .from('habit_data')
          .insert([{ 
            habit_id: habitId,
            date: formatISO(today, { representation: 'date' }),
          }])
          .select()
          .single();
          console.log('DATA', data);

        if (insertError) {
          throw new Error('Failed to insert habit data', insertError);
        }
        return { action: 'inserted' as const, habitId, data };
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
    onError: (error: Error) => {
      console.error('Error toggling habit data:', error);
    }
  });
}