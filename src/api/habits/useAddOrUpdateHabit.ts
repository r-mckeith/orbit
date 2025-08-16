import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../useClient';
import { HabitWithData, Schedule } from '../../types';

type HabitPayload = {
  id?: number;
  created?: Date | null;
  habitId?: number;
  name: string;
  description?: string | null;
  section?: string | null;
  target?: number | null;
  timeframe?: string | null;
  schedule?: Schedule | null;
  archived?: boolean | null;
  day?: number | null;
  week?: number | null;
  month?: number | null;
  year?: number | null;
  last_recorded?: Date | null;
  watchlist? : boolean | null;
  bottom_line?: boolean | null;
  boundary?: boolean | null;
};

export function useAddOrUpdateHabit() {
  const queryClient = useQueryClient();

  return useMutation<HabitWithData | HabitWithData[], Error, HabitPayload | HabitPayload[]>({
    mutationFn: async habitInput => {

      if (Array.isArray(habitInput)) {
        const insertData = habitInput.map(habit => ({
          name: habit.name,
          description: habit.description ?? '',
          section: habit.section ?? 'Uncategorized',
          target: habit.target ?? 0,
          timeframe: habit.timeframe ?? 'daily',
          schedule: habit.schedule ?? null,
          archived: habit.archived ?? null,
          watchlist: habit.watchlist ?? null,
          bottom_line: habit.bottom_line ?? null,
          boundary: habit.boundary ?? null,
        }));
        const { data, error } = await supabase.from('habits').insert(insertData).select();
        if (error) throw new Error('Failed to insert multiple habits');
        return data ?? [];
      }

      const habit = habitInput;

      if (habit.habitId) {
        const { data, error } = await supabase
          .from('habits')
          .update({
            name: habit.name,
            description: habit.description ?? '',
            section: habit.section ?? 'Uncategorized',
            target: habit.target ?? 0,
            timeframe: habit.timeframe ?? 'daily',
            schedule: habit.schedule ?? null,
            archived: habit.archived ?? null,
            watchlist: habit.watchlist ?? null,
            bottom_line: habit.bottom_line ?? null,
            boundary: habit.boundary ?? null,
          })
          .eq('id', habit.habitId)
          .select()
          .single();

        if (error) throw new Error('Failed to update habit');
        return data;
      }

      const { data, error } = await supabase
        .from('habits')
        .insert([
          {
            name: habit.name,
            description: habit.description ?? '',
            section: habit.section ?? 'Uncategorized',
            target: habit.target ?? 0,
            timeframe: habit.timeframe ?? 'daily',
            schedule: habit.schedule ?? null,
            archived: habit.archived ?? null,
            watchlist: habit.watchlist ?? null,
            bottom_line: habit.bottom_line ?? null,
            boundary: habit.boundary ?? null,
          },
        ])
        .select()
        .single();

      if (error) throw new Error('Failed to insert habit');
      return data;
    },

    onSettled: () => {
      // ✅ Invalidate all weekly habit queries
      queryClient.invalidateQueries({ queryKey: ['habitsWithData'] });
    }
  });
}
