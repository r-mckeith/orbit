import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTodayLocalDateString } from '../lib/dates';
import { supabase } from '../lib/supabase';
import { Habit } from '../types/habits';

export const HABITS_QUERY_KEY = 'habits';

export const useHabits = () => {
  const today = getTodayLocalDateString();

  return useQuery({
    queryKey: [HABITS_QUERY_KEY],
    queryFn: async (): Promise<(Habit & { isSelected: boolean })[]> => {
      // 1) Habits (RLS-scoped)
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: true });

      if (habitsError) throw habitsError;

      // 2) Today’s habit_data (RLS-scoped)
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

export const useAddHabit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (newHabit: Omit<Habit, 'id' | 'created_at' | 'user_id'>) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('habits')
        .insert([{ ...newHabit, user_id: session.user.id }])
        .select()
        .single();
      if (error) throw error;
      return data as Habit;
    },
    onSuccess: (created) => {
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

// export const useAddHabit = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (newHabit: Omit<Habit, 'id' | 'created_at' | 'user_id'>) => {
//       const { data: { session } } = await supabase.auth.getSession();
//       if (!session) throw new Error('Not authenticated');

//       const { data, error } = await supabase
//         .from('habits')
//         .insert([{ ...newHabit, user_id: session.user.id }])
//         .select()
//         .single();

//       if (error) throw error;
//       return data as Habit;
//     },

//     // optimistic update that APPENDS (matches created_at ASC)
//     onMutate: async (newHabit) => {
//       await queryClient.cancelQueries({ queryKey: ['habits'] });

//       const tempId = `temp-${Date.now()}`;
//       const created_at = new Date().toISOString();
//       const optimistic = { ...newHabit, id: tempId, created_at, isSelected: false } as Habit & { isSelected: boolean };

//       const prev = queryClient.getQueriesData<(Habit & { isSelected: boolean })[]>({
//         queryKey: ['habits'],
//       });

//       for (const [key, old] of prev) {
//         if (!old) continue;
//         // append to match server order (created_at ASC)
//         queryClient.setQueryData(key, [...old, optimistic]);
//       }

//       return { prev, tempId };
//     },

//     onError: (_err, _vars, ctx) => {
//       if (!ctx) return;
//       for (const [key, old] of ctx.prev) {
//         queryClient.setQueryData(key, old);
//       }
//     },

//     onSuccess: (created, _vars, ctx) => {
//       // replace the temp item in-place to avoid a re-sort “jump”
//       const caches = queryClient.getQueriesData<(Habit & { isSelected: boolean })[]>({
//         queryKey: ['habits'],
//       });
//       for (const [key, old] of caches) {
//         if (!old) continue;
//         const next = old.map(h => (h.id === ctx?.tempId ? { ...created, isSelected: false } : h));
//         queryClient.setQueryData(key, next);
//       }
//     },

//     onSettled: () => {
//       // Optional safety refetch (keeps cache honest). Because ordering already matches,
//       // this shouldn’t cause a visible jump.
//       queryClient.invalidateQueries({ queryKey: ['habits'] });
//     },
//   });
// };

// export const useAddHabit = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (newHabit: Omit<Habit, 'id' | 'created_at' | 'user_id'>) => {
//       const { data: { session } } = await supabase.auth.getSession();
//       if (!session) throw new Error('Not authenticated');

//       const { data, error } = await supabase
//         .from('habits')
//         .insert([{ ...newHabit, user_id: session.user.id }])
//         .select()
//         .single();

//       if (error) throw error;
//       return data as Habit;
//     },
//     onSuccess: (created) => {
//       // Merge into every cached habits list (any date keys)
//       const caches = queryClient.getQueriesData<(Habit & { isSelected: boolean })[]>({
//         queryKey: ['habits'],
//       });
//       caches.forEach(([key, old]) => {
//         if (!old) return;
//         queryClient.setQueryData(key, [{ ...created, isSelected: false }, ...old]);
//       });
//     },
//     onSettled: () => {
//       queryClient.invalidateQueries({ queryKey: ['habits'] });
//     },
//   });
// };
