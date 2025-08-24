import { QueryKey, useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { getTodayLocalDateString } from '../../../lib/dates';
import type { Habit } from '../../../types/habits';
import { supabase } from '../useClient';

// --- types you already have ---
type ToggleResult =
  | { action: 'deleted'; habitId: string }
  | { action: 'inserted'; habitId: string; data: any };

export type ToggleHabitDataInput = { habitId: string };
type HabitsWithSelected = (Habit & { isSelected: boolean })[];

// --- stats types (match your useGetHabitStats result) ---
type Circle = 'outer' | 'middle' | 'inner';
type HabitStatRow = { habit: Habit; count: number; lastDate?: string | null };
type HabitStats = {
  ranked: HabitStatRow[];
  topByCircle: Partial<Record<Circle, HabitStatRow | undefined>>;
  daysSinceByHabit: Record<string, number | null>;
};

// --- mutation context for rollback ---
type ToggleContext = {
  prevHabits: Array<[QueryKey, HabitsWithSelected | undefined]>;
  prevStats: Array<[QueryKey, HabitStats | undefined]>;
};

export function useToggleHabitData(): UseMutationResult<
  ToggleResult,
  Error,
  ToggleHabitDataInput,
  ToggleContext
> {
  const queryClient = useQueryClient();

  return useMutation<ToggleResult, Error, ToggleHabitDataInput, ToggleContext>({
    onMutate: async ({ habitId }) => {
      const todayStr = getTodayLocalDateString();

      // pause both query families
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['habits'] }),
        queryClient.cancelQueries({ queryKey: ['habitStats'] }),
      ]);

      // 1) Snapshot old caches
      const prevHabits = queryClient.getQueriesData<HabitsWithSelected>({ queryKey: ['habits'] });
      const prevStats  = queryClient.getQueriesData<HabitStats>({ queryKey: ['habitStats'] });

      // 2) Optimistically flip isSelected in every habits cache
      for (const [key, old] of prevHabits) {
        if (!old) continue;
        const next: HabitsWithSelected = old.map(h =>
          h.id === habitId ? { ...h, isSelected: !h.isSelected } : h
        );
        queryClient.setQueryData<HabitsWithSelected>(key, next);
      }

      // 3) Optimistically bump counts in any stats window that includes "today"
      for (const [key, stats] of prevStats) {
        if (!stats) continue;

        // we expect keys like: ['habitStats', { start: 'yyyy-MM-dd', end: 'yyyy-MM-dd', days: 7 }]
        const params = Array.isArray(key) ? (key[1] as any) : undefined;
        const startStr: string | undefined = params?.start;
        const endStr: string | undefined = params?.end;

        // only update windows that include today
        if (!startStr || !endStr) continue;
        if (!(startStr <= todayStr && todayStr <= endStr)) continue;

        // figure optimistic delta: +1 for insert, -1 for delete
        // we don't know action yet in onMutate, so toggle based on current habits cache:
        const habitsTuple = prevHabits[0]?.[1];
        const currentlySelected = habitsTuple?.find(h => h.id === habitId)?.isSelected ?? false;
        const delta = currentlySelected ? -1 : +1;

        // clone & update ranked in place
        const ranked = stats.ranked.map(r =>
          r.habit.id === habitId ? { ...r, count: Math.max(0, (r.count ?? 0) + delta) } : r
        );

        // resort to keep UI order consistent
        ranked.sort((a, b) => (b.count - a.count) || a.habit.name.localeCompare(b.habit.name));

        // recompute topByCircle quickly from ranked
        const topByCircle: HabitStats['topByCircle'] = {};
        for (const row of ranked) {
          const c = row.habit.category as Circle;
          if (topByCircle[c] == null) topByCircle[c] = row;
        }

        // daysSinceByHabit is tricky to update accurately on delete (we’d need the previous date).
        // For optimism, we’ll leave it as-is; the invalidate onSettled will reconcile.
        const daysSinceByHabit = stats.daysSinceByHabit;

        queryClient.setQueryData<HabitStats>(key, { ranked, topByCircle, daysSinceByHabit });
      }

      // 4) Provide context for rollback
      return { prevHabits, prevStats };
    },

    mutationFn: async ({ habitId }) => {
      const todayStr = getTodayLocalDateString();

      const { data: existing, error: fetchError } = await supabase
        .from('habit_data')
        .select('id')
        .eq('habit_id', habitId)
        .eq('date', todayStr);

      if (fetchError) throw new Error('Failed to check existing habit data');

      if (existing && existing.length > 0) {
        const { error: deleteError } = await supabase
          .from('habit_data')
          .delete()
          .eq('id', existing[0].id);

        if (deleteError) throw new Error('Failed to delete habit data');
        return { action: 'deleted' as const, habitId };
      } else {
        const { data, error: insertError } = await supabase
          .from('habit_data')
          .insert([{ habit_id: habitId, date: todayStr }])
          .select()
          .single();

        if (insertError) throw new Error(`Failed to insert habit data: ${insertError.message}`);
        return { action: 'inserted' as const, habitId, data };
      }
    },

    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
      // rollback both families
      for (const [key, old] of ctx.prevHabits) {
        queryClient.setQueryData<HabitsWithSelected>(key, old);
      }
      for (const [key, old] of ctx.prevStats) {
        queryClient.setQueryData<HabitStats>(key, old);
      }
    },

    onSettled: () => {
      // reconcile everything precisely (daysSince, true order, etc.)
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habitStats'] });
    },
  });
}