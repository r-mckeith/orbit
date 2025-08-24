import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Habit } from '../../../types/habits';
import { supabase } from '../useClient';

export const HABITS_QUERY_KEY = 'habits';

export const useAddHabit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (newHabit: Omit<Habit, 'id' | 'created_at' | 'user_id'>) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('habits')
        .insert([{ ...newHabit, user_id: session.user.id }])
        .select()
        .single();
      if (error) throw error;
      return data as Habit;
    },
    onSuccess: created => {
      // Append to match created_at ASC, then refetch
      const caches = qc.getQueriesData<(Habit & { isSelected: boolean })[]>({ queryKey: ['habits'] });
      for (const [key, old] of caches) {
        if (!old) continue;
        qc.setQueryData(key, [...old, { ...created, isSelected: false }]);
      }
      qc.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};
