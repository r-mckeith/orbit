import { useQuery } from '@tanstack/react-query';
import { getTodayLocalDateString } from '../../../lib/dates';
import { supabase } from '../../../lib/supabase';
import { Habit } from '../../../types/habits';

export const HABITS_QUERY_KEY = 'habits';

export const useGetHabits = () => {
  const today = getTodayLocalDateString();

  return useQuery({
    queryKey: [HABITS_QUERY_KEY],
    queryFn: async (): Promise<(Habit & { isSelected: boolean })[]> => {
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: true });

      if (habitsError) throw habitsError;

      const { data: habitData, error: dataError } = await supabase
        .from('habit_data')
        .select('habit_id')
        .eq('date', today);

      if (dataError) throw dataError;

      const selected = new Set((habitData ?? []).map((h) => h.habit_id));

      return (habits ?? []).map((h) => ({
        ...h,
        isSelected: selected.has(h.id),
      }));
    },
  });
};