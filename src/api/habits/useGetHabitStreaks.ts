import { useQuery } from '@tanstack/react-query';
import { supabase } from '../useClient';
import { HabitStreak, WeekStreak } from '../../types';

export function useGetHabitStreaks() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return useQuery<HabitStreak[], Error>({
    queryKey: ['habitStreaks'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_habit_streaks', { timezone });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

export function useGetHabitWeeklyStreaks() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return useQuery<WeekStreak[], Error>({
    queryKey: ['weeklyHabitStreaks'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_weekly_streaks_for_all_habits');
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

// CREATE OR REPLACE FUNCTION get_habit_streaks(timezone TEXT)
// RETURNS TABLE (habit_id BIGINT, streak BIGINT)
// LANGUAGE plpgsql
// AS $$
// DECLARE
//   today DATE := (now() AT TIME ZONE timezone)::date;
// BEGIN
//   RETURN QUERY
//   WITH habit_logs AS (
//     SELECT
//       h.id AS habit_id,
//       h.section,
//       gs.day::date AS log_date,
//       COALESCE(hd.count, NULL) AS count
//     FROM habits h
//     CROSS JOIN LATERAL generate_series(h.created::date, today, interval '1 day') AS gs(day)
//     LEFT JOIN habit_data hd
//       ON hd.habit_id = h.id AND hd.created::date = gs.day::date
//     WHERE h.user_id = auth.uid()
//   ),
//   ordered_logs AS (
//     SELECT
//       hl.habit_id,
//       hl.section,
//       hl.log_date,
//       hl.count,
//       ROW_NUMBER() OVER (PARTITION BY hl.habit_id ORDER BY hl.log_date DESC) AS rn,
//       SUM(CASE
//         WHEN hl.section = 'outer' AND hl.count > 0 THEN 1
//         WHEN hl.section IN ('inner', 'middle') AND (hl.count IS NULL OR hl.count = 0) THEN 1
//         ELSE 0
//       END) OVER (
//         PARTITION BY hl.habit_id ORDER BY hl.log_date DESC
//         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
//       ) AS active_run
//     FROM habit_logs hl
//   ),
//   first_break AS (
//     SELECT ol.habit_id, MIN(ol.rn) - 1 AS streak
//     FROM ordered_logs ol
//     WHERE
//       (ol.section = 'outer' AND (ol.count IS NULL OR ol.count <= 0))
//       OR (ol.section IN ('inner', 'middle') AND ol.count > 0)
//     GROUP BY ol.habit_id
//   ),
//   streak_candidates AS (
//     SELECT
//       ol.habit_id,
//       ol.rn,
//       fb.streak AS max_rn
//     FROM ordered_logs ol
//     LEFT JOIN first_break fb ON fb.habit_id = ol.habit_id
//   ),
//   final_counts AS (
//     SELECT sc.habit_id, COUNT(*) AS streak
//     FROM streak_candidates sc
//     WHERE sc.rn <= COALESCE(sc.max_rn, 999999)
//     GROUP BY sc.habit_id
//   )
//   SELECT fc.habit_id, fc.streak
//   FROM final_counts fc;
// END;
// $$;

// working week

// CREATE OR REPLACE FUNCTION get_weekly_streaks_for_all_habits()
// RETURNS TABLE (habit_id BIGINT, week_streak BIGINT)
// LANGUAGE plpgsql
// AS $$
// BEGIN
//   RETURN QUERY
//   WITH habit_logs AS (
//     SELECT 
//       h.id AS hl_habit_id_alias,
//       (hd.created AT TIME ZONE 'America/New_York')::DATE AS log_date,
//       COALESCE(hd.count, 0) AS count,
//       h.target AS target
//     FROM habits h
//     LEFT JOIN habit_data hd ON hd.habit_id = h.id
//     WHERE h.timeframe = 'week'  -- Filter for habits with a timeframe of week
//   ),
//   weekly_totals AS (
//     SELECT 
//       hl_habit_id_alias AS habit_id_alias,
//       date_trunc('week', log_date)::DATE AS week_start,
//       SUM(count) AS total,
//       target
//     FROM habit_logs
//     GROUP BY hl_habit_id_alias, week_start, target
//   ),
//   ordered_weeks AS (
//     SELECT 
//       habit_id_alias AS ow_habit_id_alias,
//       week_start,
//       total,
//       target,
//       ROW_NUMBER() OVER (PARTITION BY habit_id_alias ORDER BY week_start DESC) AS rn
//     FROM weekly_totals
//   ),
//   ranked_weeks AS (
//     SELECT 
//       ow_habit_id_alias,
//       week_start,
//       total,
//       target,
//       rn,
//       CASE 
//         WHEN total >= target THEN 1 
//         ELSE 0 
//       END AS meets_target
//     FROM ordered_weeks
//   ),
//   streak_weeks AS (
//     SELECT 
//       ow_habit_id_alias AS rw_habit_id_alias,
//       *,
//       week_start - INTERVAL '7 days' * (rn - 1) AS expected_start
//     FROM ranked_weeks
//   ),
//   first_fail AS (
//     SELECT rw_habit_id_alias, MIN(rn) AS min_rn
//     FROM streak_weeks
//     WHERE meets_target = 0  -- Only consider weeks that do not meet the target
//     GROUP BY rw_habit_id_alias
//   )
//   SELECT 
//     fc.rw_habit_id_alias AS habit_id, 
//     COUNT(*) AS week_streak
//   FROM streak_weeks fc
//   WHERE fc.rn < COALESCE((SELECT MIN(min_rn) FROM first_fail WHERE rw_habit_id_alias = fc.rw_habit_id_alias), 9999)
//   GROUP BY fc.rw_habit_id_alias;  -- Only return habit_id and week_streak
// END;
// $$;