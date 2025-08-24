// src/features/habits/api/useGetHabitStats.ts
import { useQuery } from '@tanstack/react-query';
import { format, startOfDay, subDays } from 'date-fns';
import type { Habit } from '../../../types/habits';
import { supabase } from '../useClient';

export const HABIT_STATS_QUERY_KEY = 'habitStats';

// helper: yyyy-MM-dd in local time (to match your habit_data.date)
const toISODate = (d: Date) => format(d, 'yyyy-MM-dd');

export type Circle = 'outer' | 'middle' | 'inner';

export type HabitStatRow = {
  habit: Habit;
  count: number;              // occurrences in range
  lastDate?: string | null;   // yyyy-MM-dd of most recent occurrence (any time)
};

export type HabitStats = {
  // ranked by count desc, name asc tiebreaker
  ranked: HabitStatRow[];

  // quick lookups
  topByCircle: Partial<Record<Circle, HabitStatRow | undefined>>;

  // insight helpers
  daysSinceByHabit: Record<string, number | null>; // null if never occurred
};

export function useGetHabitStats(opts?: { endDate?: Date; days?: number }) {
  const end = startOfDay(opts?.endDate ?? new Date());
  const days = Math.max(1, opts?.days ?? 7);
  const start = startOfDay(subDays(end, days - 1));

  const startStr = toISODate(start);
  const endStr = toISODate(end);

  return useQuery({
    queryKey: [HABIT_STATS_QUERY_KEY, { start: startStr, end: endStr, days }],
    queryFn: async (): Promise<HabitStats> => {
      // 1) Habits (RLS-scoped)
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: true });

      if (habitsError) throw habitsError;

      // 2) habit_data for the window (RLS-scoped)
      const { data: rows, error: dataError } = await supabase
        .from('habit_data')
        .select('habit_id, date') // date stored as yyyy-MM-dd
        .gte('date', startStr)
        .lte('date', endStr);

      if (dataError) throw dataError;

      // 3) Also fetch most recent occurrence ever (for "days since") — optional but useful
      // If your dataset is big, you can replace this with a server view/RPC later.
      const { data: allRecent, error: recentError } = await supabase
        .from('habit_data')
        .select('habit_id, date')
        .order('date', { ascending: false });

      if (recentError) throw recentError;

      // Build indices
      const byId = new Map(habits.map(h => [h.id, h as Habit]));
      const counts = new Map<string, number>();
      for (const r of rows ?? []) {
        counts.set(r.habit_id, (counts.get(r.habit_id) ?? 0) + 1);
      }

      const lastDateByHabit = new Map<string, string | null>();
      for (const h of habits ?? []) lastDateByHabit.set(h.id, null);
      for (const r of allRecent ?? []) {
        // first time we see an id in a descending list is the last occurrence
        if (!lastDateByHabit.get(r.habit_id)) {
          lastDateByHabit.set(r.habit_id, r.date);
        }
      }

      // Build ranked list
      const ranked: HabitStatRow[] = (habits ?? []).map(h => ({
        habit: h,
        count: counts.get(h.id) ?? 0,
        lastDate: lastDateByHabit.get(h.id) ?? null,
      }));
      ranked.sort((a, b) => (b.count - a.count) || a.habit.name.localeCompare(b.habit.name));

      // Top by circle
      const firstByCircle: Partial<Record<Circle, HabitStatRow>> = {};
      for (const row of ranked) {
        const c = row.habit.category as Circle;
        if (c && firstByCircle[c] === undefined) firstByCircle[c] = row;
      }

      // Days since last occurrence (relative to end date)
      const daysSinceByHabit: Record<string, number | null> = {};
      for (const row of ranked) {
        if (!row.lastDate) {
          daysSinceByHabit[row.habit.id] = null;
        } else {
          const diff = (end.getTime() - startOfDay(new Date(row.lastDate + 'T00:00:00')).getTime()) / (1000 * 60 * 60 * 24);
          daysSinceByHabit[row.habit.id] = Math.max(0, Math.floor(diff));
        }
      }

      return {
        ranked,
        topByCircle: firstByCircle,
        daysSinceByHabit,
      };
    },
  });
}