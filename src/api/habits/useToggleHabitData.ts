import { QueryKey, useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { getTodayLocalDateString } from '../../../lib/dates';
import type { Habit } from '../../../types/habits';
import { supabase } from '../useClient';

type ToggleResult =
  | { action: 'deleted'; habitId: string }
  | { action: 'inserted'; habitId: string; data: any };

export type ToggleHabitDataInput = {
  habitId: string;
};

// --- Add these helper types ---
type HabitsWithSelected = (Habit & { isSelected: boolean })[];
type ToggleContext = { prev: Array<[QueryKey, HabitsWithSelected | undefined]> };

export function useToggleHabitData(): UseMutationResult<
  ToggleResult,
  Error,
  ToggleHabitDataInput,
  ToggleContext
> {
  const queryClient = useQueryClient();

  return useMutation<ToggleResult, Error, ToggleHabitDataInput, ToggleContext>({
    onMutate: async ({ habitId }) => {
      await queryClient.cancelQueries({ queryKey: ['habits'] });

      // prev is an array of [QueryKey, Data] tuples — type it:
      const prev = queryClient.getQueriesData<HabitsWithSelected>({
        queryKey: ['habits'],
      });

      // Flip isSelected in every cached habits list
      for (const [key, old] of prev) {
        if (!old) continue;
        const next: HabitsWithSelected = old.map((h) =>
          h.id === habitId ? { ...h, isSelected: !h.isSelected } : h
        );
        queryClient.setQueryData<HabitsWithSelected>(key, next);
      }

      // return typed context for rollback
      return { prev };
    },

    mutationFn: async ({ habitId }) => {
      const todayStr = getTodayLocalDateString();

      const { data: existing, error: fetchError } = await supabase
        .from('habit_data')
        .select('id')
        .eq('habit_id', habitId)
        .eq('date', todayStr);

      if (fetchError) {
        throw new Error('Failed to check existing habit data');
      }

      if (existing && existing.length > 0) {
        const { error: deleteError } = await supabase
          .from('habit_data')
          .delete()
          .eq('id', existing[0].id);

        if (deleteError) {
          throw new Error('Failed to delete habit data');
        }
        return { action: 'deleted' as const, habitId };
      } else {
        const { data, error: insertError } = await supabase
          .from('habit_data')
          .insert([{ habit_id: habitId, date: todayStr }])
          .select()
          .single();

        if (insertError) {
          throw new Error(`Failed to insert habit data: ${insertError.message}`);
        }
        return { action: 'inserted' as const, habitId, data };
      }
    },

    onError: (_err, _vars, ctx) => {
      // rollback using typed context
      if (!ctx) return;
      for (const [key, old] of ctx.prev) {
        queryClient.setQueryData<HabitsWithSelected>(key, old);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}